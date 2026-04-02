"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WordOrderingProps {
  prompt: string;
  words: string[];
  correct: string;
  onAnswer: (answer: string) => void;
  showFeedback: boolean;
  userAnswer: string;
}

export function WordOrdering({ prompt, words, correct, onAnswer, showFeedback, userAnswer }: WordOrderingProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([...words]);

  function addWord(word: string, idx: number) {
    if (showFeedback) return;
    setSelected([...selected, word]);
    setRemaining(remaining.filter((_, i) => i !== idx));
  }

  function removeWord(word: string, idx: number) {
    if (showFeedback) return;
    setRemaining([...remaining, word]);
    setSelected(selected.filter((_, i) => i !== idx));
  }

  const answer = selected.join("");
  const isCorrect = answer === correct;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-semibold text-slate-900 dark:text-white text-center">{prompt}</p>

      {/* Answer zone */}
      <div className={cn(
        "min-h-14 rounded-xl border-2 px-4 py-3 flex flex-wrap gap-2 items-center justify-center transition-all",
        showFeedback && isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30" :
        showFeedback && !isCorrect ? "border-red-400 bg-red-50 dark:bg-red-900/30" :
        "border-dashed border-slate-300 dark:border-surface-600 bg-slate-50 dark:bg-surface-800"
      )}>
        {showFeedback ? (
          <span className="jp text-xl font-bold text-slate-800 dark:text-white">{userAnswer || answer}</span>
        ) : selected.length === 0 ? (
          <span className="text-sm text-muted">Clique nas palavras abaixo para montar a frase</span>
        ) : (
          selected.map((w, i) => (
            <button key={i} onClick={() => removeWord(w, i)} className="jp bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 rounded-lg px-3 py-1.5 text-base font-medium hover:bg-indigo-200 transition-colors">
              {w}
            </button>
          ))
        )}
      </div>

      {showFeedback && !isCorrect && (
        <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 jp">
          Resposta correta: <strong>{correct}</strong>
        </p>
      )}

      {/* Word bank */}
      {!showFeedback && (
        <>
          <div className="flex flex-wrap gap-2 justify-center">
            {remaining.map((w, i) => (
              <button key={i} onClick={() => addWord(w, i)} className="jp bg-white dark:bg-surface-800 border-2 border-slate-200 dark:border-surface-600 hover:border-indigo-400 rounded-lg px-3 py-1.5 text-base font-medium text-slate-800 dark:text-slate-100 transition-colors">
                {w}
              </button>
            ))}
          </div>
          <button
            onClick={() => selected.length > 0 && onAnswer(answer)}
            disabled={selected.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Confirmar
          </button>
        </>
      )}
    </div>
  );
}
