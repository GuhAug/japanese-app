"use client";
import { cn } from "@/lib/utils";

interface MultipleChoiceProps {
  prompt: string;
  options: string[];
  selected: string | null;
  correct: string;
  showFeedback: boolean;
  onSelect: (opt: string) => void;
}

export function MultipleChoice({ prompt, options, selected, correct, showFeedback, onSelect }: MultipleChoiceProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-slate-900 dark:text-white text-center jp">{prompt}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correct;
          let style = "border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 hover:border-indigo-400";
          if (showFeedback && isSelected && isCorrect) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
          else if (showFeedback && isSelected && !isCorrect) style = "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400";
          else if (showFeedback && isCorrect) style = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
          else if (isSelected) style = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
          return (
            <button
              key={opt}
              onClick={() => !showFeedback && onSelect(opt)}
              disabled={showFeedback}
              className={cn("border-2 rounded-xl py-3 px-4 text-sm font-medium jp transition-all text-center", style)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
