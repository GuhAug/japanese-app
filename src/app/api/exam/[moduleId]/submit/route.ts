import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getModuleById } from "@/data/curriculum";
import { prisma } from "@/lib/prisma";
import { XP_REWARDS, levelFromXp } from "@/lib/xp";
import { getTodayString } from "@/lib/streak";
import { z } from "zod";

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const mod = getModuleById(params.moduleId);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const userId = session.user.id;
  const { answers } = parsed.data;

  // Grade answers
  let correct = 0;
  const results: Record<string, { correct: boolean; correctAnswer: string }> = {};
  for (const q of mod.examQuestions) {
    if (answers[q.id] !== undefined) {
      const isCorrect = answers[q.id].trim().toLowerCase() === q.answer.trim().toLowerCase();
      if (isCorrect) correct++;
      results[q.id] = { correct: isCorrect, correctAnswer: q.answer };
    }
  }

  const total = Object.keys(answers).length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score / 100 >= mod.passThreshold;

  await prisma.examAttempt.create({ data: { userId, moduleId: params.moduleId, score, passed } });

  if (passed) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId: params.moduleId } },
      create: { userId, moduleId: params.moduleId, status: "completed", examPassed: true, examScore: score },
      update: { examPassed: true, examScore: score },
    });

    // Award XP
    const today = getTodayString();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
    if (user) {
      const newXp = user.xp + XP_REWARDS.EXAM_PASSED;
      await prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: levelFromXp(newXp) } });
      await prisma.activityLog.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, xpEarned: XP_REWARDS.EXAM_PASSED, lessons: 0, reviews: 0 },
        update: { xpEarned: { increment: XP_REWARDS.EXAM_PASSED } },
      });
    }

    // Check block1 graduate badge
    const block1ModuleIds = ["b1-m1", "b1-m2", "b1-m3", "b1-m4"];
    const passedExams = await prisma.moduleProgress.count({
      where: { userId, moduleId: { in: block1ModuleIds }, examPassed: true },
    });
    if (passedExams >= 4) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: "block1-graduate" } },
        create: { userId, badgeId: "block1-graduate" },
        update: {},
      });
    }
  }

  return NextResponse.json({ score, passed, results, passThreshold: mod.passThreshold });
}
