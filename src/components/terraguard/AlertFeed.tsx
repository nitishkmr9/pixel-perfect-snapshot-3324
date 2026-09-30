import { useEffect, useRef } from "react";
import { ACTION_STYLES, currency, type Txn } from "@/lib/terraguard-data";

export function AlertFeed({ alerts }: { alerts: Txn[] }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const seenAlertIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const enableAudio = () => {
      const audioContext = new AudioContext();
      void audioContext.resume();
      audioContextRef.current = audioContext;
      document.removeEventListener("pointerdown", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };

    document.addEventListener("pointerdown", enableAudio, { once: true });
    document.addEventListener("keydown", enableAudio, { once: true });

    return () => {
      document.removeEventListener("pointerdown", enableAudio);
      document.removeEventListener("keydown", enableAudio);
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext) void audioContext.close();
    };
  }, []);

  useEffect(() => {
    const unseenAlerts = alerts.filter(
      (alert) => !seenAlertIdsRef.current.has(alert.id),
    );
    alerts.forEach((alert) => seenAlertIdsRef.current.add(alert.id));

    if (!unseenAlerts.some((alert) => alert.action === "BLOCK")) return;

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== "running") return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.17);
  }, [alerts]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || alerts.length === 0) return;
    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [alerts]);

  return (
    <section className="panel flex h-[420px] flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          Alert Feed
        </h2>
        <span className="text-xs text-muted-foreground">latest 40</span>
      </div>

      <div ref={scrollAreaRef} className="mt-3 min-h-0 flex-1 overflow-y-auto">
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
