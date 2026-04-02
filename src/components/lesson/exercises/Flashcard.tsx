"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  onAnswer: (correct: boolean) => void;
  showFeedback: boolean;
}

export function Flashcard({ front, back, onAnswer, showFeedback }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  function handleFlip() { if (!showFeedback) setFlipped(!flipped); }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        className={cn(
          "w-64 h-40 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 select-none",
          flipped
            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400"
            : "bg-white dark:bg-surface-800 border-slate-200 dark:border-surface-600 hover:border-indigo-300"
        )}
        onClick={handleFlip}
      >
        <p className="text-4xl jp font-bold text-slate-900 dark:text-white">{flipped ? back : front}</p>
      </div>
      {!flipped ? (
        <p className="text-sm text-muted">Clique no cartão para ver a resposta</p>
      ) : !showFeedback ? (
        <div className="flex gap-3">
          <button onClick={() => onAnswer(false)} className="px-5 py-2.5 rounded-xl border-2 border-red-300 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Errei
          </button>
          <button onClick={() => onAnswer(false)} className="px-5 py-2.5 rounded-xl border-2 border-orange-300 text-orange-600 dark:text-orange-400 font-medium text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
            Difícil
          </button>
          <button onClick={() => onAnswer(true)} className="px-5 py-2.5 rounded-xl border-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
            Sabia!
          </button>
        </div>
      ) : null}
    </div>
  );
}
