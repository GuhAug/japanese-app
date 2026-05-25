export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
};

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "Primeiro Passo",
    description: "Complete sua primeira lição",
    icon: "🌱",
    condition: "Complete 1 lição",
  },
  {
    id: "hiragana-hero",
    name: "Herói do Hiragana",
    description: "Complete todos os módulos de Hiragana",
    icon: "あ",
    condition: "Complete b1-m1 e b1-m2",
  },
  {
    id: "katakana-master",
    name: "Mestre do Katakana",
    description: "Complete o módulo de Katakana",
    icon: "ア",
    condition: "Complete b1-m3",
  },
  {
    id: "streak-3",
    name: "Trio Consecutivo",
    description: "Estude 3 dias seguidos",
    icon: "🔥",
    condition: "streakDays >= 3",
  },
  {
    id: "streak-7",
    name: "Semana Perfeita",
    description: "Estude 7 dias seguidos",
    icon: "⚡",
    condition: "streakDays >= 7",
  },
  {
    id: "streak-30",
    name: "Implacável",
    description: "Estude 30 dias seguidos",
    icon: "💎",
    condition: "streakDays >= 30",
  },
  {
    id: "perfect-score",
    name: "Nota Perfeita",
    description: "Tire 100% em um mini-teste",
    icon: "⭐",
    condition: "score === 100 em um mini-teste",
  },
  {
    id: "srs-100",
    name: "Mestre da Repetição",
    description: "Revise 100 cartões no SRS",
    icon: "🃏",
    condition: "100 revisões SRS",
  },
  {
    id: "block1-graduate",
    name: "Graduado do Bloco 1",
    description: "Passe em todas as provas do Bloco 1",
    icon: "🎓",
    condition: "4 provas de módulo aprovadas no Bloco 1",
  },
  {
    id: "level-10",
    name: "Aprendiz Dedicado",
    description: "Alcance o nível 10",
    icon: "🏆",
    condition: "level >= 10",
  },
  {
    id: "hangul-hero",
    name: "Herói do Hangul",
    description: "Complete os módulos de Vogais e Consoantes do Hangul",
    icon: "한",
    condition: "Complete b2-m1 e b2-m2",
  },
  {
    id: "block2-graduate",
    name: "Graduado do Bloco 2",
    description: "Passe em todas as provas do Bloco 2 (Coreano)",
    icon: "🇰🇷",
    condition: "3 provas de módulo aprovadas no Bloco 2",
  },
  {
    id: "polyglot",
    name: "Poliglota Iniciante",
    description: "Complete pelo menos uma lição em japonês e uma em coreano",
    icon: "🌏",
    condition: "1+ lição completada em cada idioma",
  },
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
