import { useEffect, useRef, useState } from "react";
import { currency } from "@/lib/terraguard-data";
import type { StreamState } from "@/lib/use-fraud-stream";

function Kpi({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger" | "primary";
  hint?: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "primary"
          ? "text-primary"
          : "text-foreground";

  return (
    <div className="panel p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function KpiRow({ state }: { state: StreamState }) {
  const risk = state.latest ? Math.round(state.latest.risk * 100) : 0;
  const [displayedLoss, setDisplayedLoss] = useState(state.lossPrevented);
  const displayedLossRef = useRef(state.lossPrevented);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayedLossRef.current = state.lossPrevented;
      setDisplayedLoss(state.lossPrevented);
      return;
    }

    const startValue = displayedLossRef.current;
    const difference = state.lossPrevented - startValue;
    if (difference === 0) return;

    const startedAt = performance.now();
    const duration = 600;
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + difference * eased;
      displayedLossRef.current = nextValue;
      setDisplayedLoss(nextValue);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [state.lossPrevented]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Kpi
        label="Transactions Scored"
        value={state.scored.toLocaleString()}
        tone="primary"
        hint="in-transaction, on z/OS"
      />
      <Kpi
        label="Threats Blocked"
        value={state.threats.toLocaleString()}
        tone="danger"
        hint="review + block decisions"
      />
      <Kpi
        label="Loss Prevented"
        value={currency(displayedLoss)}
        tone="success"
        hint="blocked transaction value"
      />
      <Kpi
        label="Avg Inference Latency"
        value={`${state.latency.toFixed(1)} ms`}
        hint="WMLz scoring service"
      />
      <Kpi
        label="Latest Risk Score"
        value={`${risk}%`}
        tone={risk > 75 ? "danger" : risk >= 50 ? "default" : "success"}
        hint={state.latest ? state.latest.merchant : "awaiting stream"}
      />
    </div>
  );
}
