import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { xpProgressInLevel, getLevelTitle } from "@/lib/xp";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { BADGES, getBadgeById } from "@/data/badges";
import { CURRICULUM } from "@/data/curriculum";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const [user, lessonProgress, userBadges, activityLog, srsCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.lessonProgress.findMany({ where: { userId, status: "completed" } }),
    prisma.userBadge.findMany({ where: { userId } }),
    prisma.activityLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
    prisma.sRSItem.count({ where: { userId } }),
  ]);

  if (!user) redirect("/login");

  const { current, needed } = xpProgressInLevel(user.xp);
  const title = getLevelTitle(user.level);
  const totalLessons = CURRICULUM.flatMap((b) => b.modules.flatMap((m) => m.lessons)).length;
  const earnedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Meu Perfil</h1>

      {/* Level Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white shadow-lg">
            <span className="text-2xl font-bold">{user.level}</span>
            <span className="text-xs">nível</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm jp text-indigo-600 dark:text-indigo-400">{title.jp} — {title.pt}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>XP: {user.xp.toLocaleString()}</span>
                <span>{current} / {needed} XP para próximo nível</span>
              </div>
              <ProgressBar value={Math.round((current / needed) * 100)} color="indigo" />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gold-500">{user.streakDays}</p>
          <p className="text-xs text-muted mt-1">🔥 Streak atual</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{lessonProgress.length}</p>
          <p className="text-xs text-muted mt-1">📖 Lições</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-500">{srsCount}</p>
          <p className="text-xs text-muted mt-1">🃏 Itens no SRS</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-indigo-500">{user.longestStreak}</p>
          <p className="text-xs text-muted mt-1">🏆 Maior streak</p>
        </Card>
      </div>

      {/* Activity log */}
      <Card className="mb-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Atividade Recente (30 dias)</h2>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const dateStr = d.toISOString().split("T")[0];
            const log = activityLog.find((a) => a.date === dateStr);
            const xp = log?.xpEarned ?? 0;
            const intensity = xp === 0 ? "bg-slate-100 dark:bg-surface-700" :
              xp < 30 ? "bg-indigo-200 dark:bg-indigo-800" :
              xp < 60 ? "bg-indigo-400 dark:bg-indigo-600" : "bg-indigo-600 dark:bg-indigo-400";
            return (
              <div key={dateStr} title={`${dateStr}: ${xp} XP`}
                className={`w-6 h-6 rounded-sm ${intensity} transition-all`} />
            );
          })}
        </div>
        <p className="text-xs text-muted mt-2">Cada quadrado = 1 dia. Quanto mais escuro, mais XP ganho.</p>
      </Card>

      {/* Badges */}
      <Card>
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Conquistas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div key={badge.id} className={`rounded-xl p-3 border-2 transition-all ${earned ? "border-gold-400 bg-amber-50 dark:bg-amber-900/20" : "border-slate-200 dark:border-surface-600 opacity-40 grayscale"}`}>
                <div className="text-2xl jp mb-1">{badge.icon}</div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{badge.name}</p>
                <p className="text-xs text-muted mt-0.5">{badge.description}</p>
                {earned && <p className="text-xs text-gold-500 font-medium mt-1">✓ Conquistado</p>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
