import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sm2, getDueDate, SRSQuality } from "@/lib/srs";
import { XP_REWARDS, levelFromXp } from "@/lib/xp";
import { getTodayString } from "@/lib/streak";
import { z } from "zod";

const reviewSchema = z.object({
  itemId: z.string(),
  quality: z.number().min(0).max(5),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { itemId, quality } = parsed.data;
  const userId = session.user.id;

  const item = await prisma.sRSItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const newState = sm2({ easeFactor: item.easeFactor, interval: item.interval, repetitions: item.repetitions }, quality as SRSQuality);
  const dueDate = getDueDate(newState.interval);

  await prisma.sRSItem.update({
    where: { userId_itemId: { userId, itemId } },
    data: { ...newState, dueDate, lastReviewed: new Date() },
  });

  // Award XP for correct reviews (quality >= 3)
  if (quality >= 3) {
    const today = getTodayString();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
    if (user) {
      const newXp = user.xp + XP_REWARDS.SRS_CORRECT;
      await prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: levelFromXp(newXp) } });
      await prisma.activityLog.upsert({
        where: { userId_date: { userId, date: today } },
        create: { userId, date: today, xpEarned: XP_REWARDS.SRS_CORRECT, lessons: 0, reviews: 1 },
        update: { xpEarned: { increment: XP_REWARDS.SRS_CORRECT }, reviews: { increment: 1 } },
      });
    }

    // Check SRS master badge
    const totalReviews = await prisma.activityLog.aggregate({ where: { userId }, _sum: { reviews: true } });
    if ((totalReviews._sum.reviews ?? 0) >= 100) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: "srs-100" } },
        create: { userId, badgeId: "srs-100" },
        update: {},
      });
    }
  }

  return NextResponse.json({ success: true, newState, dueDate });
}
