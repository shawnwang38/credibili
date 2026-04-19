"use client";

// Placeholder — populated in Task 8.
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function OverviewView() {
  const setDepthView = useAppStore((s) => s.setDepthView);
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div style={{ color: "var(--foreground)" }}>OVERVIEW PLACEHOLDER</div>
        <Button onClick={() => setDepthView("analysis")}>Back</Button>
      </div>
    </div>
  );
}
