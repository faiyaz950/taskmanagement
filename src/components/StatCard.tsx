import type { LucideIcon } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";

const TONE_STYLE: Record<string, { bg: string; fg: string }> = {
  primary: { bg: "color-mix(in srgb, var(--primary) 14%, transparent)", fg: "var(--primary)" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning)" },
  info: { bg: "var(--info-bg)", fg: "var(--info)" },
  success: { bg: "var(--success-bg)", fg: "var(--success)" },
  danger: { bg: "var(--danger-bg)", fg: "var(--danger)" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: keyof typeof TONE_STYLE;
}) {
  const style = TONE_STYLE[tone];
  return (
    <div className="card card-interactive p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
        <span
          className="icon-tile h-7 w-7"
          style={{ background: style.bg, color: style.fg }}
        >
          <Icon size={14} strokeWidth={2.5} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}
