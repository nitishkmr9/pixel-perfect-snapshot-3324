import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StreamState } from "@/lib/use-fraud-stream";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function RateChart({ ticks }: { ticks: StreamState["ticks"] }) {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Transaction Rate &amp; Threats
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          live window · last 40 ticks
        </span>
      </h2>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={ticks} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="txnFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="t" {...axis} />
            <YAxis allowDecimals={false} {...axis} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="txns"
              name="Txns / tick"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#txnFill)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="threats"
              name="Threats"
              stroke="var(--danger)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const LABELS = Array.from(
  { length: 10 },
  (_, i) => `${i * 10}-${i * 10 + 10}%`,
);

export function RiskDistribution({ buckets }: { buckets: number[] }) {
  const data = buckets.map((count, i) => ({ bucket: LABELS[i], count, i }));

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Risk Score Distribution
      </h2>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" interval={0} {...axis} fontSize={9} />
            <YAxis allowDecimals={false} {...axis} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell
                  key={d.bucket}
                  fill={
                    d.i >= 8
                      ? "var(--danger)"
                      : d.i >= 5
                        ? "var(--warning)"
                        : "var(--success)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
