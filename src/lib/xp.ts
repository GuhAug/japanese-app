export const XP_REWARDS = {
  EXERCISE_CORRECT: 5,
  LESSON_COMPLETE_BASE: 20,
  LESSON_COMPLETE_BONUS_80: 10,
  LESSON_COMPLETE_BONUS_100: 5,
  SRS_CORRECT: 3,
  EXAM_PASSED: 50,
  STREAK_DAILY: 10,
};

export const LEVEL_TITLES: Record<string, string> = {
  "1-5": "初心者",
  "6-10": "見習い",
  "11-20": "学生",
  "21-30": "修行中",
  "31-40": "上級者",
  "41-49": "達人",
  "50": "日本語マスター",
};

export const LEVEL_TITLES_PT: Record<string, string> = {
  "1-5": "Iniciante",
  "6-10": "Aprendiz",
  "11-20": "Estudante",
  "21-30": "Praticante",
  "31-40": "Habilidoso",
  "41-49": "Mestre",
  "50": "Nihongo Master",
};

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let total = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (total + needed > xp) break;
    total += needed;
    level++;
    if (level >= 50) return 50;
  }
  return level;
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; level: number } {
  const level = levelFromXp(xp);
  const totalAtLevel = totalXpForLevel(level);
  const needed = xpForLevel(level);
  const current = xp - totalAtLevel;
  return { current, needed, level };
}

export function getLevelTitle(level: number): { jp: string; pt: string } {
  if (level <= 5) return { jp: LEVEL_TITLES["1-5"], pt: LEVEL_TITLES_PT["1-5"] };
  if (level <= 10) return { jp: LEVEL_TITLES["6-10"], pt: LEVEL_TITLES_PT["6-10"] };
  if (level <= 20) return { jp: LEVEL_TITLES["11-20"], pt: LEVEL_TITLES_PT["11-20"] };
  if (level <= 30) return { jp: LEVEL_TITLES["21-30"], pt: LEVEL_TITLES_PT["21-30"] };
  if (level <= 40) return { jp: LEVEL_TITLES["31-40"], pt: LEVEL_TITLES_PT["31-40"] };
  if (level <= 49) return { jp: LEVEL_TITLES["41-49"], pt: LEVEL_TITLES_PT["41-49"] };
  return { jp: LEVEL_TITLES["50"], pt: LEVEL_TITLES_PT["50"] };
}

export function calculateLessonXp(score: number): number {
  let xp = XP_REWARDS.LESSON_COMPLETE_BASE;
  if (score >= 80) xp += XP_REWARDS.LESSON_COMPLETE_BONUS_80;
  if (score === 100) xp += XP_REWARDS.LESSON_COMPLETE_BONUS_100;
  return xp;
}
