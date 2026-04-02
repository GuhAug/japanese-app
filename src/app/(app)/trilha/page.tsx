import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CURRICULUM } from "@/data/curriculum";
import { cn } from "@/lib/utils";

export default async function TrilhaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [lessonProgress, moduleProgress] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId: session.user.id } }),
    prisma.moduleProgress.findMany({ where: { userId: session.user.id } }),
  ]);

  const lpMap = new Map(lessonProgress.map((p) => [p.lessonId, p]));
  const mpMap = new Map(moduleProgress.map((p) => [p.moduleId, p]));

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Trilha de Aprendizado</h1>
      <p className="text-muted text-sm mb-8">Seu caminho do zero ao japonês intermediário</p>

      {CURRICULUM.map((block) => (
        <div key={block.id} className="mb-10">
          <div className="card-bg rounded-2xl p-4 mb-6 border-l-4 border-indigo-500">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">{block.title}</h2>
            <p className="text-sm text-muted">{block.description}</p>
          </div>

          {block.modules.map((mod, modIdx) => {
            const mp = mpMap.get(mod.id);
            const allCompleted = mod.lessons.every((l) => lpMap.get(l.id)?.status === "completed");
            const anyAvailable = mod.lessons.some((l) => lpMap.get(l.id)?.status === "available");
            const isLocked = !allCompleted && !anyAvailable && mod.lessons.every((l) => !lpMap.has(l.id));

            return (
              <div key={mod.id} className="mb-6">
                {/* Module header */}
                <div className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 mb-3",
                  allCompleted ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-50 dark:bg-surface-700"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{allCompleted ? "✅" : anyAvailable ? "📖" : "🔒"}</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{mod.title}</p>
                      <p className="text-xs text-muted">{mod.lessons.length} lições</p>
                    </div>
                  </div>
                  {allCompleted && (
                    <Link
                      href={`/prova/${mod.id}`}
                      className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                        mp?.examPassed
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      )}
                    >
                      {mp?.examPassed ? `✓ Prova: ${mp.examScore}%` : "Fazer prova →"}
                    </Link>
                  )}
                </div>

                {/* Lessons */}
                <div className="flex flex-col gap-2 pl-4">
                  {mod.lessons.map((lesson, lessonIdx) => {
                    const lp = lpMap.get(lesson.id);
                    const status = lp?.status ?? "locked";

                    return (
                      <div key={lesson.id} className="flex items-center gap-3">
                        {/* Connector line */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                            status === "completed" ? "bg-indigo-600 border-indigo-600 text-white" :
                            status === "available" ? "bg-white dark:bg-surface-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 animate-pulse-glow" :
                            "bg-slate-100 dark:bg-surface-700 border-slate-300 dark:border-surface-600 text-slate-400"
                          )}>
                            {status === "completed" ? "✓" : lessonIdx + 1}
                          </div>
                          {lessonIdx < mod.lessons.length - 1 && (
                            <div className={cn("w-0.5 h-4 mt-0.5", status === "completed" ? "bg-indigo-400" : "bg-slate-200 dark:bg-surface-600")} />
                          )}
                        </div>

                        {status !== "locked" ? (
                          <Link
                            href={`/lesson/${lesson.id}`}
                            className="flex-1 card-bg rounded-xl px-4 py-2.5 hover:shadow-sm transition-all hover:-translate-y-0.5"
                          >
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{lesson.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted">⏱ {lesson.estimatedMinutes}min</span>
                              {status === "completed" && lp && lp.score !== null && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  {lp.score}% no mini-teste
                                </span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="flex-1 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-surface-800 opacity-50">
                            <p className="font-medium text-sm text-slate-500 dark:text-slate-400">{lesson.title}</p>
                            <p className="text-xs text-muted">🔒 Bloqueada</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
