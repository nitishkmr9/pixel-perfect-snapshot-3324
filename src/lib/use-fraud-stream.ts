import { useEffect, useRef, useState } from "react";
import { txnAt, type Txn } from "./terraguard-data";

export type Tick = { t: number; txns: number; threats: number };

export type StreamState = {
  scored: number;
  threats: number;
  lossPrevented: number;
  latency: number;
  latest: Txn | null;
  ticks: Tick[];
  buckets: number[];
  alerts: Txn[];
};

const INITIAL: StreamState = {
  scored: 0,
  threats: 0,
  lossPrevented: 0,
  latency: 4.2,
  latest: null,
  ticks: [],
  buckets: Array(10).fill(0),
  alerts: [],
};

export function useFraudStream(intervalMs = 900, perTick = 2) {
  const [state, setState] = useState<StreamState>(INITIAL);
  const cursor = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const batch: Txn[] = [];
        for (let i = 0; i < perTick; i++) batch.push(txnAt(cursor.current++));

        const buckets = [...prev.buckets];
        let threats = 0;
        let loss = 0;
        const newAlerts: Txn[] = [];

        for (const t of batch) {
          buckets[Math.min(9, Math.floor(t.risk * 10))]! += 1;
          if (t.action !== "ALLOW") {
            threats += 1;
            newAlerts.push(t);
          }
          if (t.action === "BLOCK") loss += t.amount;
        }

        tick.current += 1;
        const ticks = [
          ...prev.ticks,
          { t: tick.current, txns: batch.length, threats },
        ].slice(-40);

        const latest = batch[batch.length - 1] ?? null;

        return {
          scored: prev.scored + batch.length,
          threats: prev.threats + threats,
          lossPrevented: prev.lossPrevented + loss,
          latency:
            Math.round(
              (prev.latency * 0.8 + (latest?.latency_ms ?? 4.2) * 0.2) * 10,
            ) / 10,
          latest,
          ticks,
          buckets,
          alerts: [...newAlerts.reverse(), ...prev.alerts].slice(0, 40),
        };
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, perTick]);

  return state;
}
