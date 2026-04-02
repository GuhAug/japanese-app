"use client";
import { useReducer, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lesson, Exercise } from "@/types/curriculum";
import { LessonState, LessonAction } from "@/types/lesson";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { MultipleChoice } from "./exercises/MultipleChoice";
import { Flashcard } from "./exercises/Flashcard";
import { TypingExercise } from "./exercises/TypingExercise";
import { WordOrdering } from "./exercises/WordOrdering";
import { cn } from "@/lib/utils";

function initState(lesson: Lesson): LessonState {
  const half = Math.ceil(lesson.exercises.length / 2);
  return {
    phase: "theory",
    lesson,
    currentSlideIndex: 0,
    currentExerciseIndex: 0,
    answers: {},
    isCorrect: {},
    score: null,
    xpEarned: null,
    showFeedback: false,
    lastAnswerCorrect: null,
    practiceExercises: lesson.exercises.slice(0, half),
    testExercises: lesson.exercises.slice(half),
  };
}

function reducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case "NEXT_SLIDE": {
      const slides = state.lesson!.theorySlides;
      if (state.currentSlideIndex < slides.length - 1) {
        return { ...state, currentSlideIndex: state.currentSlideIndex + 1 };
      }
      return { ...state, phase: "guided_practice", currentExerciseIndex: 0 };
    }
    case "ANSWER_EXERCISE": {
      return {
        ...state,
        answers: { ...state.answers, [action.payload.exerciseId]: action.payload.answer },
        isCorrect: { ...state.isCorrect, [action.payload.exerciseId]: action.payload.correct },
        showFeedback: true,
        lastAnswerCorrect: action.payload.correct,
      };
    }
    case "NEXT_EXERCISE": {
      const list = state.phase === "guided_practice" ? state.practiceExercises : state.testExercises;
      const nextIdx = state.currentExerciseIndex + 1;
      if (nextIdx < list.length) {
        return { ...state, currentExerciseIndex: nextIdx, showFeedback: false, lastAnswerCorrect: null };
      }
      if (state.phase === "guided_practice") {
        return { ...state, phase: "mini_test", currentExerciseIndex: 0, showFeedback: false, lastAnswerCorrect: null };
      }
      return state;
    }
    case "SUBMIT_TEST":
      return { ...state, phase: "summary", score: action.payload.score, xpEarned: action.payload.xpEarned };
    default:
      return state;
  }
}

export function LessonShell({ lesson }: { lesson: Lesson }) {
  const [state, dispatch] = useReducer(reducer, lesson, initState);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const isTestPhase = state.phase === "mini_test";
  const exerciseList = isTestPhase ? state.testExercises : state.practiceExercises;
  const currentExercise = exerciseList[state.currentExerciseIndex];
  const totalSlides = lesson.theorySlides.length;
  const totalSteps = totalSlides + state.practiceExercises.length + state.testExercises.length;

  let currentStep = 0;
  if (state.phase === "theory") currentStep = state.currentSlideIndex;
  else if (state.phase === "guided_practice") currentStep = totalSlides + state.currentExerciseIndex;
  else if (state.phase === "mini_test") currentStep = totalSlides + state.practiceExercises.length + state.currentExerciseIndex;
  else currentStep = totalSteps;

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  function handleAnswer(exerciseId: string, answer: string, correct: boolean) {
    dispatch({ type: "ANSWER_EXERCISE", payload: { exerciseId, answer, correct } });
    if (isTestPhase && state.currentExerciseIndex === exerciseList.length - 1) {
      const allAnswers = { ...state.answers, [exerciseId]: answer };
      const allCorrect = { ...state.isCorrect, [exerciseId]: correct };
      submitTest(allAnswers, allCorrect);
    }
  }

  async function submitTest(answers: Record<string, string>, correctMap: Record<string, boolean>) {
    setSubmitting(true);
    const totalQ = state.testExercises.length;
    const testIds = new Set(state.testExercises.map((e) => e.id));
    const correctCount = Object.entries(correctMap)
      .filter(([id]) => testIds.has(id))
      .filter(([, v]) => v).length;
    const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 100;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, score }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      dispatch({ type: "SUBMIT_TEST", payload: { score, xpEarned: data.xpEarned ?? 20 } });
    } catch {
      dispatch({ type: "SUBMIT_TEST", payload: { score, xpEarned: 20 } });
    }
    setSubmitting(false);
  }

  function handleNextExercise() {
    if (isTestPhase && state.currentExerciseIndex >= state.testExercises.length - 1) return;
    dispatch({ type: "NEXT_EXERCISE" });
  }

  if (state.phase === "summary") {
    return <LessonSummary score={state.score!} xpEarned={state.xpEarned!} lessonTitle={lesson.title} onContinue={() => router.push("/trilha")} />;
  }

  return (
    <div className="max-w-xl mx-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          ←
        </button>
        <div className="flex-1">
          <ProgressBar value={progressPct} size="sm" color="indigo" />
        </div>
        <span className="text-xs text-muted">{progressPct}%</span>
      </div>

      {/* Phase label */}
      <div className="text-center mb-6">
        <span className={cn("text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full",
          state.phase === "theory" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" :
          state.phase === "guided_practice" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        )}>
          {state.phase === "theory" ? "📚 Teoria" : state.phase === "guided_practice" ? "✏️ Prática Guiada" : "🎯 Mini-teste"}
        </span>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{lesson.title}</h1>
      </div>

      {/* Theory phase */}
      {state.phase === "theory" && (
        <TheoryView
          slide={lesson.theorySlides[state.currentSlideIndex]}
          slideIndex={state.currentSlideIndex}
          total={totalSlides}
          onNext={() => dispatch({ type: "NEXT_SLIDE" })}
        />
      )}

      {/* Exercise phases */}
      {(state.phase === "guided_practice" || state.phase === "mini_test") && currentExercise && (
        <ExerciseView
          exercise={currentExercise}
          isTest={isTestPhase}
          showFeedback={state.showFeedback}
          userAnswer={state.answers[currentExercise.id] ?? ""}
          isCorrect={state.isCorrect[currentExercise.id] ?? false}
          exerciseNum={state.currentExerciseIndex + 1}
          total={exerciseList.length}
          onAnswer={(answer, correct) => handleAnswer(currentExercise.id, answer, correct)}
          onNext={handleNextExercise}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function TheoryView({ slide, slideIndex, total, onNext }: {
  slide: Lesson["theorySlides"][0]; slideIndex: number; total: number; onNext: () => void;
}) {
  return (
    <div className="animate-slide-up">
      <div className="card-bg rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{slide.title}</h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{slide.content}</p>
        {slide.rows && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {slide.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-50 dark:bg-surface-700/50" : ""}>
                    <td className="jp text-2xl font-bold px-3 py-2 text-slate-900 dark:text-white">{row.character}</td>
                    <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400 font-medium">{row.romaji}</td>
                    {row.mnemonic && <td className="px-3 py-2 text-muted text-xs">{row.mnemonic}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {slide.tip && (
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-sm text-amber-700 dark:text-amber-300">💡 {slide.tip}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">Slide {slideIndex + 1} de {total}</span>
        <Button onClick={onNext}>{slideIndex < total - 1 ? "Próximo →" : "Ir para exercícios →"}</Button>
      </div>
    </div>
  );
}

function ExerciseView({ exercise, isTest, showFeedback, userAnswer, isCorrect, exerciseNum, total, onAnswer, onNext, submitting }: {
  exercise: Exercise; isTest: boolean; showFeedback: boolean; userAnswer: string; isCorrect: boolean;
  exerciseNum: number; total: number; onAnswer: (answer: string, correct: boolean) => void; onNext: () => void; submitting: boolean;
}) {
  function checkAnswer(answer: string) {
    const correct = answer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
    onAnswer(answer, correct);
  }

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between text-xs text-muted mb-4">
        <span>Questão {exerciseNum} de {total}</span>
        <span>{isTest ? "🎯 Teste" : "✏️ Prática"}</span>
      </div>

      <div className="card-bg rounded-2xl p-6 mb-4">
        {exercise.type === "multiple-choice" && (
          <MultipleChoice
            prompt={exercise.prompt}
            options={exercise.options ?? []}
            selected={userAnswer || null}
            correct={exercise.answer}
            showFeedback={showFeedback}
            onSelect={checkAnswer}
          />
        )}
        {exercise.type === "flashcard" && (
          <Flashcard
            front={exercise.prompt}
            back={exercise.answer}
            onAnswer={(correct) => onAnswer(correct ? exercise.answer : "", correct)}
            showFeedback={showFeedback}
          />
        )}
        {exercise.type === "typing" && (
          <TypingExercise
            key={exercise.id}
            prompt={exercise.prompt}
            correct={exercise.answer}
            onAnswer={checkAnswer}
            showFeedback={showFeedback}
            userAnswer={userAnswer}
          />
        )}
        {exercise.type === "word-ordering" && (
          <WordOrdering
            prompt={exercise.prompt}
            words={exercise.words ?? []}
            correct={exercise.answer}
            onAnswer={checkAnswer}
            showFeedback={showFeedback}
            userAnswer={userAnswer}
          />
        )}
      </div>

      {/* Feedback bar */}
      {showFeedback && (
        <div className={cn("rounded-xl px-5 py-3 mb-4 flex items-center justify-between",
          isCorrect ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"
        )}>
          <span className={cn("font-semibold text-sm", isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400")}>
            {isCorrect ? "✓ Correto! +5 XP" : `✗ A resposta era: ${exercise.answer}`}
          </span>
          {!isTest && <Button size="sm" onClick={onNext} loading={submitting}>Próximo →</Button>}
          {isTest && exerciseNum < total && <Button size="sm" onClick={onNext} loading={submitting}>Próximo →</Button>}
          {isTest && exerciseNum === total && <Button size="sm" loading={submitting}>{submitting ? "Enviando..." : "Ver resultado"}</Button>}
        </div>
      )}
    </div>
  );
}

function LessonSummary({ score, xpEarned, lessonTitle, onContinue }: {
  score: number; xpEarned: number; lessonTitle: string; onContinue: () => void;
}) {
  const emoji = score === 100 ? "🌟" : score >= 80 ? "🎉" : score >= 60 ? "👍" : "📖";
  return (
    <div className="max-w-xl mx-auto p-6 text-center animate-bounce-in">
      <div className="text-7xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lição Concluída!</h1>
      <p className="text-muted mb-6">{lessonTitle}</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card-bg rounded-2xl p-4">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{score}%</p>
          <p className="text-sm text-muted mt-1">no mini-teste</p>
        </div>
        <div className="card-bg rounded-2xl p-4">
          <p className="text-3xl font-bold text-gold-500">+{xpEarned}</p>
          <p className="text-sm text-muted mt-1">XP ganhos</p>
        </div>
      </div>
      <Button size="lg" onClick={onContinue} className="w-full">
        Continuar →
      </Button>
    </div>
  );
}
