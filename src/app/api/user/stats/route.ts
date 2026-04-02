import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpProgressInLevel, getLevelTitle } from "@/lib/xp";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, level: true, streakDays: true, longestStreak: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { current, needed } = xpProgressInLevel(user.xp);
  const title = getLevelTitle(user.level);

  const [lessonsCompleted, srsCount, badges] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId: session.user.id, status: "completed" } }),
    prisma.sRSItem.count({ where: { userId: session.user.id } }),
    prisma.userBadge.findMany({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    xp: user.xp,
    level: user.level,
    xpInLevel: current,
    xpNeeded: needed,
    streakDays: user.streakDays,
    longestStreak: user.longestStreak,
    title,
    lessonsCompleted,
    srsCount,
    badges: badges.map((b) => b.badgeId),
  });
}
