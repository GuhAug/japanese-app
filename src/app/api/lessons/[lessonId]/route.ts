import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLessonById } from "@/data/curriculum";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lesson = getLessonById(params.lessonId);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
  });

  if (!progress || progress.status === "locked") {
    return NextResponse.json({ error: "Lesson locked" }, { status: 403 });
  }

  return NextResponse.json({ lesson, progress });
}
