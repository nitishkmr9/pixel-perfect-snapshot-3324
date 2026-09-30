import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ACTION_STYLES, currency, type Txn } from "@/lib/terraguard-data";

let audioCtx: AudioContext | null = null;
function ping() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  } catch {
    /* audio unavailable */
  }
}

export function AlertFeed({ alerts }: { alerts: Txn[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const lastId = useRef<string | null>(null);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const top = alerts[0];
    if (!top || top.id === lastId.current) return;
    const isFirst = lastId.current === null;
    lastId.current = top.id;
    if (!isFirst && sound && top.action === "BLOCK") ping();
    const el = scrollRef.current;
    if (el && pinned.current) el.scrollTo({ top: 0, behavior: "smooth" });
  }, [alerts, sound]);

  return (
    <section className="panel flex h-[420px] flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Alert Feed
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">latest 40 · auto-scroll</span>
          <button
            type="button"
            onClick={() => {
              setSound((s) => !s);
              audioCtx ??= new AudioContext();
            }}
            aria-label={sound ? "Mute block alerts" : "Unmute block alerts"}
            className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground"
          >
            {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          pinned.current = e.currentTarget.scrollTop < 24;
        }}
        className="mt-3 min-h-0 flex-1 overflow-y-auto"
      >
        <table className="w-full border-separate border-spacing-0 text-left text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <th className="py-2 pr-2 font-medium">Txn ID</th>
              <th className="py-2 pr-2 font-medium">Merchant</th>
              <th className="py-2 pr-2 text-right font-medium">Amount</th>
              <th className="py-2 pr-2 text-right font-medium">Risk</th>
              <th className="py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center font-sans text-muted-foreground">
                  Monitoring the stream — no flagged transactions yet.
                </td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id} className="flash-row border-t border-border/60">
                  <td className="py-2 pr-2 text-muted-foreground">{a.id}</td>
                  <td className="py-2 pr-2 font-sans text-foreground">
                    {a.merchant}
                    <span className="block text-[10px] text-muted-foreground">{a.city}</span>
                  </td>
                  <td className="py-2 pr-2 text-right text-foreground">{currency(a.amount)}</td>
                  <td
                    className={`py-2 pr-2 text-right ${a.risk > 0.75 ? "text-danger" : "text-warning"}`}
                  >
                    {Math.round(a.risk * 100)}%
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold tracking-wide ${ACTION_STYLES[a.action]}`}
                    >
                      {a.action}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
