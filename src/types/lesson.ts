import { Lesson, Exercise } from "./curriculum";

export type LessonPhase =
  | "loading"
  | "theory"
  | "guided_practice"
  | "mini_test"
  | "summary";

export type LessonState = {
  phase: LessonPhase;
  lesson: Lesson | null;
  currentSlideIndex: number;
  currentExerciseIndex: number;
  answers: Record<string, string>;
  isCorrect: Record<string, boolean>;
  score: number | null;
  xpEarned: number | null;
  showFeedback: boolean;
  lastAnswerCorrect: boolean | null;
  practiceExercises: Exercise[];
  testExercises: Exercise[];
};

export type LessonAction =
  | { type: "LESSON_LOADED"; payload: Lesson }
  | { type: "NEXT_SLIDE" }
  | { type: "START_PRACTICE" }
  | { type: "ANSWER_EXERCISE"; payload: { exerciseId: string; answer: string; correct: boolean } }
  | { type: "NEXT_EXERCISE" }
  | { type: "START_TEST" }
  | { type: "SUBMIT_TEST"; payload: { score: number; xpEarned: number } };
