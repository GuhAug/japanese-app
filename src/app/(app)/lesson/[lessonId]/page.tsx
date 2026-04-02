import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLessonById } from "@/data/curriculum";
import { redirect, notFound } from "next/navigation";
import { LessonShell } from "@/components/lesson/LessonShell";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const lesson = getLessonById(params.lessonId);
  if (!lesson) notFound();

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: params.lessonId } },
  });

  if (!progress || progress.status === "locked") redirect("/trilha");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LessonShell lesson={lesson} />
    </div>
  );
}
