export type TheorySlide = {
  type: "explanation" | "table" | "examples";
  title: string;
  content: string;
  rows?: { character: string; romaji: string; mnemonic?: string }[];
  tip?: string;
};

export type Exercise = {
  id: string;
  type: "multiple-choice" | "flashcard" | "typing" | "word-ordering";
  prompt: string;
  promptJp?: string;
  answer: string;
  options?: string[];
  words?: string[];
  hint?: string;
  xpReward: number;
};

export type ExamQuestion = {
  id: string;
  type: "multiple-choice" | "typing";
  prompt: string;
  answer: string;
  options?: string[];
};

export type Lesson = {
  id: string;
  moduleId: string;
  blockId: string;
  title: string;
  subtitle?: string;
  estimatedMinutes: number;
  theorySlides: TheorySlide[];
  exercises: Exercise[];
  srsItemIds: string[];
  xpReward: number;
};

export type Module = {
  id: string;
  blockId: string;
  title: string;
  description: string;
  lessons: Lesson[];
  examQuestions: ExamQuestion[];
  passThreshold: number;
};

export type Block = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};
