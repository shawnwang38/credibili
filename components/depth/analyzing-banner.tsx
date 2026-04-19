"use client";

import { Bell } from "lucide-react";
import { toast } from "sonner";

export function AnalyzingBanner({ allDone }: { allDone: boolean }) {
  return (
    <div
      className="flex h-10 items-center justify-between border-b px-4 text-[10px] uppercase tracking-widest"
      style={{
        background: "var(--panel)",
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-2 w-2"
          style={{
            background: allDone ? "var(--success)" : "var(--accent)",
            animation: allDone ? "none" : "pulse 1.2s ease-in-out infinite",
          }}
        />
        <span style={{ color: "var(--foreground)" }}>
          {allDone
            ? "ANALYSIS COMPLETE — REVIEW BELOW OR SEE OVERVIEW"
            : "ANALYZING — COME BACK IN A BIT"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => toast("We will notify you when ready")}
        className="flex items-center gap-2 border px-3 py-1 transition-colors"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
          background: "transparent",
        }}
      >
        <Bell className="h-3.5 w-3.5" />
        <span>NOTIFY ME</span>
      </button>
    </div>
  );
}
