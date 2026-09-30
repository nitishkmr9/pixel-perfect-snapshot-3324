const FLOW = [
  "CICS / IMS txn",
  "SMF real-time feed",
  "Kafka on Z",
  "WMLz scoring",
  "Alert API",
  "Dashboard",
];

export function Thresholds() {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Decision Thresholds
      </h2>
      <ul className="mt-3 space-y-2 text-xs">
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-muted-foreground">
            <span className="font-mono text-foreground">&lt; 50%</span> → auto-approve
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">
            <span className="font-mono text-foreground">50–75%</span> → step-up auth / review
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          <span className="text-muted-foreground">
            <span className="font-mono text-foreground">&gt; 75%</span> → block in-transaction
          </span>
        </li>
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        Inference runs inside the transaction path on IBM z/OS (WMLz scoring service,
        &lt;10 ms p99) — no data ever leaves the mainframe.
      </p>
    </section>
  );
}

export function Architecture() {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">
        Scoring Path Architecture
      </h2>
      <ol className="mt-4 space-y-2">
        {FLOW.map((node, i) => (
          <li key={node} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">
              {i + 1}
            </span>
            <span className="flex-1 rounded-md border border-border bg-secondary/60 px-3 py-2 text-xs text-foreground">
              {node}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StoryFooter() {
  return (
    <footer className="panel p-6">
      <h2 className="text-sm font-semibold tracking-wide text-primary">
        Why IBM Z
      </h2>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground">
        TerraGuard embeds ML inference directly on the IBM Z mainframe where transactions
        execute — scoring happens in-transaction via IBM Watson Machine Learning for z/OS
        before settlement. Zero data movement, PII never leaves the mainframe, tens of
        thousands of txns/sec at 99.99999% availability.
      </p>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-foreground">
        <span className="font-semibold text-success">AI for Good:</span> fraud hits
        low-income users and small merchants hardest — every blocked transaction protects a
        livelihood.
      </p>
    </footer>
  );
}
