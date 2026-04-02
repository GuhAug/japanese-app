import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
  color?: "indigo" | "gold" | "green" | "red";
  size?: "sm" | "md";
  showLabel?: boolean;
}

const colors = {
  indigo: "bg-indigo-500",
  gold: "bg-gold-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

export function ProgressBar({ value, className, color = "indigo", size = "md", showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-slate-200 dark:bg-surface-700 overflow-hidden", size === "sm" ? "h-1.5" : "h-2.5")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted mt-1 text-right">{clamped}%</p>
      )}
    </div>
  );
}
