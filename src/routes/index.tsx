import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KpiRow } from "@/components/terraguard/KpiRow";
import { RateChart, RiskDistribution } from "@/components/terraguard/Charts";
import { AlertFeed } from "@/components/terraguard/AlertFeed";
import { Architecture, StoryFooter, Thresholds } from "@/components/terraguard/SidePanels";
import { useFraudStream } from "@/lib/use-fraud-stream";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraGuard AI — Real-Time Risk Intelligence" },
      {
        name: "description",
        content:
          "Live fraud detection operations dashboard scoring transactions in-path on IBM z/OS with WMLz inference under 10 ms.",
      },
      { property: "og:title", content: "TerraGuard AI — Real-Time Risk Intelligence" },
      {
        property: "og:description",
        content:
          "Real-time transaction scoring, threat alerts and loss-prevention metrics powered by in-transaction ML on IBM Z.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString("en-GB"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-sm text-foreground tabular-nums">{now}</span>;
}

function Dashboard() {
  const state = useFraudStream();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-5 py-4">
          <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            🛡️ TerraGuard AI — Real-Time Risk Intelligence
          </h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-success">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-success" />
            Live
          </span>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              IBM z/OS Scoring Engine
            </span>
            <Clock />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-5 px-5 py-6">
        <KpiRow state={state} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <RateChart ticks={state.ticks} />
            <RiskDistribution buckets={state.buckets} />
          </div>
          <div className="space-y-5">
            <AlertFeed alerts={state.alerts} />
            <Thresholds />
            <Architecture />
          </div>
        </div>

        <StoryFooter />
      </main>
    </div>
  );
}
