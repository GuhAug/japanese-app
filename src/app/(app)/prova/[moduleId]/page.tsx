import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getModuleById } from "@/data/curriculum";
import { redirect, notFound } from "next/navigation";
import { ExamShell } from "@/components/exam/ExamShell";

export default async function ProvaPage({ params }: { params: { moduleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const mod = getModuleById(params.moduleId);
  if (!mod) notFound();

  const modProgress = await prisma.moduleProgress.findUnique({
    where: { userId_moduleId: { userId: session.user.id, moduleId: params.moduleId } },
  });

  if (!modProgress || modProgress.status === "locked") redirect("/trilha");

  // Shuffle questions
  const questions = [...mod.examQuestions].sort(() => Math.random() - 0.5).slice(0, 15);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ExamShell
        moduleId={params.moduleId}
        moduleTitle={mod.title}
        questions={questions}
        passThreshold={mod.passThreshold}
      />
    </div>
  );
}
