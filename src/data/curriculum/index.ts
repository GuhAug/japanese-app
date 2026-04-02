import { Block } from "@/types/curriculum";
import { hiraganaModule1, hiraganaModule2 } from "./block1-hiragana";
import { katakanaModule } from "./block1-katakana";
import { phrasesModule } from "./block1-phrases";

export const CURRICULUM: Block[] = [
  {
    id: "b1",
    title: "Bloco 1 — Fundamentos (Kana)",
    description: "Hiragana completo, Katakana completo, pronúncia e primeiras frases",
    modules: [hiraganaModule1, hiraganaModule2, katakanaModule, phrasesModule],
  },
];

export function getLessonById(lessonId: string) {
  for (const block of CURRICULUM) {
    for (const mod of block.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return null;
}

export function getModuleById(moduleId: string) {
  for (const block of CURRICULUM) {
    const mod = block.modules.find((m) => m.id === moduleId);
    if (mod) return mod;
  }
  return null;
}

export function getAllLessonIds(): string[] {
  return CURRICULUM.flatMap((b) => b.modules.flatMap((m) => m.lessons.map((l) => l.id)));
}

export function getFirstLessonId(): string {
  return CURRICULUM[0].modules[0].lessons[0].id;
}

export function getNextLessonId(currentLessonId: string): string | null {
  const allIds = getAllLessonIds();
  const idx = allIds.indexOf(currentLessonId);
  if (idx === -1 || idx === allIds.length - 1) return null;
  return allIds[idx + 1];
}

export function isFirstLessonOfModule(lessonId: string): boolean {
  for (const block of CURRICULUM) {
    for (const mod of block.modules) {
      if (mod.lessons[0]?.id === lessonId) return true;
    }
  }
  return false;
}

export function getModuleForLesson(lessonId: string) {
  for (const block of CURRICULUM) {
    for (const mod of block.modules) {
      if (mod.lessons.some((l) => l.id === lessonId)) return mod;
    }
  }
  return null;
}

export function areAllLessonsInModuleCompleted(
  moduleId: string,
  completedLessonIds: string[]
): boolean {
  const mod = getModuleById(moduleId);
  if (!mod) return false;
  return mod.lessons.every((l) => completedLessonIds.includes(l.id));
}
