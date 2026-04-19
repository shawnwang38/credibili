"use client";

import { WipFeed } from "@/components/depth/wip-feed";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { StakeholderGraph } from "@/components/depth/stakeholder-graph";

export function FutureSimulationPanel({
  lines,
  done,
  onStart,
}: {
  lines: string[];
  done: boolean;
  onStart: () => void;
}) {
  const completion = useAppStore((s) => s.panelCompletion);
  const canStart = completion.past && completion.present;
  const started = useAppStore((s) => s.futureStarted);

  if (!started) {
    return (
      <div
        className="flex h-full flex-col"
        style={{ background: "var(--panel)" }}
      >
        <div
          className="flex items-center justify-between border-b px-3 py-2 text-[10px] uppercase tracking-widest"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          <span style={{ color: "var(--foreground)" }}>
            ▸ FUTURE SIMULATION
          </span>
          <span style={{ color: "var(--muted-foreground)" }}>IDLE</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Stakeholder force-simulation · Monte Carlo paths
          </div>
          <Button
            disabled={!canStart}
            onClick={onStart}
            className="uppercase tracking-widest"
            style={{
              background: canStart ? "var(--accent)" : "var(--muted)",
              color: canStart
                ? "var(--accent-foreground)"
                : "var(--muted-foreground)",
            }}
          >
            ▶ Start Simulation
          </Button>
          <div
            className="text-[9px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            {canStart
              ? "Ready to simulate"
              : "Awaiting Past + Present completion"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: "var(--panel)" }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-2 text-[10px] uppercase tracking-widest"
        style={{
          borderColor: "var(--border)",
          color: "var(--muted-foreground)",
        }}
      >
        <span style={{ color: "var(--foreground)" }}>▸ FUTURE SIMULATION</span>
        <span
          style={{
            color: done ? "var(--success)" : "var(--accent)",
          }}
        >
          {done ? "COMPLETE" : "STREAMING…"}
        </span>
      </div>
      <div
        className="overflow-hidden border-b"
        style={{ borderColor: "var(--border)", height: "60%" }}
      >
        <StakeholderGraph />
      </div>
      <div className="flex-1 overflow-hidden">
        <WipFeed
          title="SIM LOG"
          lines={lines}
          done={done}
          status={done ? "complete" : "streaming"}
        />
      </div>
    </div>
  );
}
