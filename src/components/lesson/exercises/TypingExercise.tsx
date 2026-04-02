"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TypingExerciseProps {
  prompt: string;
  correct: string;
  onAnswer: (answer: string) => void;
  showFeedback: boolean;
  userAnswer: string;
}

export function TypingExercise({ prompt, correct, onAnswer, showFeedback, userAnswer }: TypingExerciseProps) {
  const [value, setValue] = useState(userAnswer || "");
  const isCorrect = userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-slate-900 dark:text-white text-center jp">{prompt}</p>
      <div className="relative">
        <input
          type="text"
          value={showFeedback ? userAnswer : value}
          onChange={(e) => !showFeedback && setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !showFeedback && value.trim()) onAnswer(value.trim()); }}
          disabled={showFeedback}
          placeholder="Digite sua resposta em rōmaji..."
          className={cn(
            "w-full rounded-xl border-2 px-4 py-3 text-center text-lg font-medium jp focus:outline-none transition-all bg-white dark:bg-surface-800",
            showFeedback && isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" :
            showFeedback && !isCorrect ? "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
            "border-slate-200 dark:border-surface-600 focus:border-indigo-400 text-slate-900 dark:text-slate-100"
          )}
        />
      </div>
      {showFeedback && !isCorrect && (
        <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 jp">
          Resposta correta: <strong>{correct}</strong>
        </p>
      )}
      {!showFeedback && (
        <button
          onClick={() => value.trim() && onAnswer(value.trim())}
          disabled={!value.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
        >
          Confirmar
        </button>
      )}
    </div>
  );
}
