"use client";

import { WipFeed } from "@/components/depth/wip-feed";
import { useAppStore } from "@/lib/store";
import { DEFAULT_COMPANY, DEFAULT_CLAIM } from "@/lib/fixtures";

export function BackgroundPanel({
  lines,
  done,
}: {
  lines: string[];
  done: boolean;
}) {
  const selectedClaim = useAppStore((s) => s.selectedClaim);
  const claimText = selectedClaim?.text ?? DEFAULT_CLAIM;

  return (
    <WipFeed title="BACKGROUND" lines={lines} done={done}>
      <div className="grid grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
        <Cell label="COMPANY" value={DEFAULT_COMPANY.name} />
        <Cell label="TICKER" value={DEFAULT_COMPANY.ticker} />
        <Cell label="SECTOR" value={DEFAULT_COMPANY.sector} />
        <Cell label="MARKET CAP" value={DEFAULT_COMPANY.marketCap} />
      </div>
      <div
        className="border-t px-3 py-2"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="text-[9px] uppercase tracking-widest"
          style={{ color: "var(--muted-foreground)" }}
        >
          Claim under analysis
        </div>
        <div className="text-xs" style={{ color: "var(--foreground)" }}>
          {claimText}
        </div>
        <div
          className="mt-1 text-[9px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          src: youtube.com/watch?v=…
        </div>
      </div>
    </WipFeed>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2" style={{ background: "var(--panel)" }}>
      <div
        className="text-[9px] uppercase tracking-widest"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </div>
      <div className="text-sm" style={{ color: "var(--foreground)" }}>
        {value}
      </div>
    </div>
  );
}
