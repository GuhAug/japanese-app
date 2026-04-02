export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function updateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | null
): { newStreak: number; newLongest: number } {
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = currentStreak;

  if (!lastActivityDate) {
    newStreak = 1;
  } else if (lastActivityDate === today) {
    // Already counted today
    newStreak = currentStreak;
  } else if (lastActivityDate === yesterdayStr) {
    // Consecutive day
    newStreak = currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const newLongest = Math.max(longestStreak, newStreak);
  return { newStreak, newLongest };
}
