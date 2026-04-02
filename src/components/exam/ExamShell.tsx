"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExamQuestion } from "@/types/curriculum";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ExamShellProps {
  moduleId: string;
  moduleTitle: string;
  questions: ExamQuestion[];
  passThreshold: number;
}

export function ExamShell({ moduleId, moduleTitle, questions, passThreshold }: ExamShellProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ score: number; passed: boolean; details: Record<string, { correct: boolean; correctAnswer: string }> } | null>(null);
  const [loading, setLoading] = useState(false);

  const current = questions[index];
  const progress = Math.round(((index) / questions.length) * 100);

  function answerMC(opt: string) {
    setAnswers((a) => ({ ...a, [current.id]: opt }));
  }

  function nextQuestion() {
    const answer = current.type === "typing" ? input.trim() : answers[current.id] ?? "";
    if (!answer) return;
    const newAnswers = { ...answers, [current.id]: answer };
    setAnswers(newAnswers);
    setInput("");
    if (index + 1 < questions.length) {
      setIndex(i => i + 1);
    } else {
      submitExam(newAnswers);
    }
  }

  async function submitExam(finalAnswers: Record<string, string>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/exam/${moduleId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      setResults({ score: data.score, passed: data.passed, details: data.results });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
      setResults({ score: 0, passed: false, details: {} });
    }
    setLoading(false);
  }

  if (submitted && results) {
    return <ExamResults score={results.score} passed={results.passed} passThreshold={passThreshold} moduleTitle={moduleTitle} onContinue={() => router.push("/trilha")} />;
  }

  const hasAnswer = current.type === "multiple-choice" ? !!answers[current.id] : !!input.trim();

  return (
    <div className="max-w-xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-muted hover:text-slate-700 dark:hover:text-slate-200">←</button>
        <div className="flex-1"><ProgressBar value={progress} size="sm" color="gold" /></div>
        <span className="text-xs text-muted">{index + 1}/{questions.length}</span>
      </div>

      <div className="text-center mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          🎯 Prova — {moduleTitle}
        </span>
        <p className="text-xs text-muted mt-2">Mínimo para passar: {Math.round(passThreshold * 100)}%</p>
      </div>

      <div className="card-bg rounded-2xl p-6 mb-6">
        <p className="text-base font-semibold text-slate-900 dark:text-white mb-6 jp">{current.prompt}</p>

        {current.type === "multiple-choice" && (
          <div className="grid grid-cols-2 gap-3">
            {current.options!.map((opt) => (
              <button
                key={opt}
                onClick={() => answerMC(opt)}
                className={cn(
                  "border-2 rounded-xl py-3 px-4 text-sm font-medium jp transition-all",
                  answers[current.id] === opt
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "border-slate-200 dark:border-surface-600 hover:border-indigo-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {current.type === "typing" && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hasAnswer && nextQuestion()}
              placeholder="Digite sua resposta..."
              className="w-full rounded-xl border-2 border-slate-200 dark:border-surface-600 bg-white dark:bg-surface-800 px-4 py-3 text-center text-lg font-medium jp focus:outline-none focus:border-indigo-400 text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>
        )}
      </div>

      <Button
        onClick={nextQuestion}
        disabled={!hasAnswer}
        loading={loading && index === questions.length - 1}
        size="lg"
        className="w-full"
      >
        {index < questions.length - 1 ? "Próxima →" : "Finalizar prova"}
      </Button>
    </div>
  );
}

function ExamResults({ score, passed, passThreshold, moduleTitle, onContinue }: {
  score: number; passed: boolean; passThreshold: number; moduleTitle: string; onContinue: () => void;
}) {
  const emoji = passed ? (score >= 90 ? "🌟" : "🎉") : "📖";
  return (
    <div className="max-w-md mx-auto p-6 text-center animate-bounce-in">
      <div className="text-7xl mb-4">{emoji}</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {passed ? "Prova Aprovada!" : "Não foi dessa vez"}
      </h1>
      <p className="text-muted mb-6">{moduleTitle}</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-bg rounded-2xl p-4">
          <p className={`text-4xl font-bold ${passed ? "text-emerald-500" : "text-red-500"}`}>{score}%</p>
          <p className="text-xs text-muted mt-1">Resultado</p>
        </div>
        <div className="card-bg rounded-2xl p-4">
          <p className="text-4xl font-bold text-slate-500">{Math.round(passThreshold * 100)}%</p>
          <p className="text-xs text-muted mt-1">Mínimo</p>
        </div>
      </div>
      {passed ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-6">+50 XP · Próximo módulo desbloqueado!</p>
      ) : (
        <p className="text-sm text-muted mb-6">Revise as lições do módulo e tente novamente.</p>
      )}
      <Button size="lg" onClick={onContinue} className="w-full">
        {passed ? "Continuar →" : "Revisar módulo"}
      </Button>
    </div>
  );
}
