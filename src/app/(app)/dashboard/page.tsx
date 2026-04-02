import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { xpProgressInLevel, getLevelTitle } from "@/lib/xp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { CURRICULUM } from "@/data/curriculum";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, lessonProgress, srsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.lessonProgress.findMany({ where: { userId: session.user.id } }),
    prisma.sRSItem.count({ where: { userId: session.user.id, dueDate: { lte: new Date() } } }),
  ]);

  if (!user) redirect("/login");

  const { current, needed } = xpProgressInLevel(user.xp);
  const levelPct = Math.round((current / needed) * 100);
  const title = getLevelTitle(user.level);

  const completedIds = new Set(lessonProgress.filter((p) => p.status === "completed").map((p) => p.lessonId));
  const availableLesson = lessonProgress.find((p) => p.status === "available");
  const nextLessonId = availableLesson?.lessonId;
  let nextLesson = null;
  if (nextLessonId) {
    for (const b of CURRICULUM) for (const m of b.modules) {
      const l = m.lessons.find((l) => l.id === nextLessonId);
      if (l) { nextLesson = l; break; }
    }
  }

  const totalLessons = CURRICULUM.flatMap((b) => b.modules.flatMap((m) => m.lessons)).length;
  const completedCount = completedIds.size;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {greeting}, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted text-sm mt-1">Continue sua jornada de aprendizado</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{user.level}</p>
          <p className="text-xs text-muted mt-1 jp">{title.jp}</p>
          <p className="text-xs text-muted">{title.pt}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gold-500">{user.streakDays}</p>
          <p className="text-xs text-muted mt-1">🔥 Dias seguidos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-500">{completedCount}</p>
          <p className="text-xs text-muted mt-1">Lições completas</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-500">{srsCount}</p>
          <p className="text-xs text-muted mt-1">Revisões pendentes</p>
        </Card>
      </div>

      {/* XP bar */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nível {user.level} → {user.level + 1}
          </span>
          <span className="text-xs text-muted">{current} / {needed} XP</span>
        </div>
        <ProgressBar value={levelPct} color="indigo" />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next lesson */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">📖 Próxima Lição</h2>
          {nextLesson ? (
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{nextLesson.title}</p>
              <p className="text-sm text-muted mt-1">{nextLesson.subtitle}</p>
              <p className="text-xs text-muted mt-1">⏱ ~{nextLesson.estimatedMinutes} min</p>
              <Link
                href={`/lesson/${nextLesson.id}`}
                className="mt-4 inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                Começar lição →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {completedCount === 0 ? (
                <Link href="/trilha" className="text-indigo-600 hover:underline">Veja a trilha para começar →</Link>
              ) : "🎉 Você completou todas as lições disponíveis!"}
            </p>
          )}
        </Card>

        {/* SRS widget */}
        <Card>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">🃏 Revisão SRS</h2>
          {srsCount > 0 ? (
            <div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{srsCount}</p>
              <p className="text-sm text-muted mb-4">cartões aguardando revisão</p>
              <Link
                href="/revisao"
                className="inline-flex items-center justify-center w-full bg-purple-600 hover:bg-purple-500 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                Revisar agora →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-muted">Sem revisões pendentes hoje.</p>
              <p className="text-xs text-muted mt-1">Continue as lições para adicionar itens ao SRS.</p>
            </div>
          )}
        </Card>

        {/* Block progress */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">🗺️ Progresso Geral</h2>
            <Link href="/trilha" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Ver trilha →</Link>
          </div>
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>{completedCount} de {totalLessons} lições</span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} color="gold" />
        </Card>
      </div>
    </div>
  );
}
