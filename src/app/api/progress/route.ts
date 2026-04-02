import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getLessonById, getNextLessonId, getModuleForLesson,
  areAllLessonsInModuleCompleted, CURRICULUM,
} from "@/data/curriculum";
import { calculateLessonXp, levelFromXp, XP_REWARDS } from "@/lib/xp";
import { updateStreak, getTodayString } from "@/lib/streak";
import { getDueDate } from "@/lib/srs";
import { BADGES } from "@/data/badges";
import { z } from "zod";

const submitSchema = z.object({
  lessonId: z.string(),
  score: z.number().min(0).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { lessonId, score } = parsed.data;
  const userId = session.user.id;

  const lesson = getLessonById(lessonId);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (!progress || progress.status === "locked") {
    return NextResponse.json({ error: "Lesson locked" }, { status: 403 });
  }

  const xpEarned = calculateLessonXp(score);
  const today = getTodayString();

  // Update lesson progress
  await prisma.lessonProgress.update({
    where: { userId_lessonId: { userId, lessonId } },
    data: { status: "completed", score, completedAt: new Date(), attempts: { increment: 1 } },
  });

  // Fetch user for streak/xp update
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { newStreak, newLongest } = updateStreak(user.streakDays, user.longestStreak, user.lastActivityDate);
  const streakXp = user.lastActivityDate !== today ? XP_REWARDS.STREAK_DAILY : 0;
  const totalXp = user.xp + xpEarned + streakXp;
  const newLevel = levelFromXp(totalXp);

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: totalXp,
      level: newLevel,
      streakDays: newStreak,
      longestStreak: newLongest,
      lastActivityDate: today,
    },
  });

  // Update activity log
  await prisma.activityLog.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, xpEarned: xpEarned + streakXp, lessons: 1, reviews: 0 },
    update: { xpEarned: { increment: xpEarned + streakXp }, lessons: { increment: 1 } },
  });

  // Add SRS items for new lesson items
  if (progress.status !== "completed") {
    const srsOps = lesson.srsItemIds.map((itemId) => {
      const itemType = itemId.startsWith("hira-") ? "hiragana"
        : itemId.startsWith("kata-") ? "katakana" : "vocab";
      return prisma.sRSItem.upsert({
        where: { userId_itemId: { userId, itemId } },
        create: { userId, itemId, itemType, dueDate: getDueDate(1) },
        update: {},
      });
    });
    await Promise.all(srsOps);
  }

  // Unlock next lesson
  const nextLessonId = getNextLessonId(lessonId);
  if (nextLessonId) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: nextLessonId } },
      create: { userId, lessonId: nextLessonId, status: "available" },
      update: { status: "available" },
    });
  }

  // Check module completion
  const mod = getModuleForLesson(lessonId);
  const allLessonIds = mod?.lessons.map((l) => l.id) ?? [];
  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: allLessonIds }, status: "completed" },
  });
  const completedIds = completedLessons.map((lp) => lp.lessonId);
  const moduleComplete = mod ? areAllLessonsInModuleCompleted(mod.id, completedIds) : false;

  if (moduleComplete && mod) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: mod.id } },
      create: { userId, moduleId: mod.id, status: "completed" },
      update: { status: "completed" },
    });
  }

  // Award badges
  const newBadges: string[] = [];
  const earnedBadgeIds = (await prisma.userBadge.findMany({ where: { userId } })).map((b) => b.badgeId);
  const totalLessons = await prisma.lessonProgress.count({ where: { userId, status: "completed" } });

  async function awardBadge(badgeId: string) {
    if (!earnedBadgeIds.includes(badgeId)) {
      await prisma.userBadge.create({ data: { userId, badgeId } });
      newBadges.push(badgeId);
    }
  }

  if (totalLessons >= 1) await awardBadge("first-step");
  if (newStreak >= 3) await awardBadge("streak-3");
  if (newStreak >= 7) await awardBadge("streak-7");
  if (newStreak >= 30) await awardBadge("streak-30");
  if (score === 100) await awardBadge("perfect-score");
  if (newLevel >= 10) await awardBadge("level-10");

  // Check hiragana completion
  const hiraModules = ["b1-m1", "b1-m2"];
  const hiraProgress = await prisma.moduleProgress.findMany({
    where: { userId, moduleId: { in: hiraModules } },
  });
  if (hiraProgress.filter((m) => m.examPassed).length === 2) await awardBadge("hiragana-hero");

  // Check katakana
  const kataProgress = await prisma.moduleProgress.findFirst({ where: { userId, moduleId: "b1-m3" } });
  if (kataProgress?.examPassed) await awardBadge("katakana-master");

  return NextResponse.json({
    success: true,
    xpEarned: xpEarned + streakXp,
    newLevel,
    newStreak,
    newBadges,
    moduleComplete,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [lessonProgress, moduleProgress] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId } }),
    prisma.moduleProgress.findMany({ where: { userId } }),
  ]);

  return NextResponse.json({ lessonProgress, moduleProgress });
}
