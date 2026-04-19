"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function WipFeed({
  title,
  lines,
  done,
  children,
  status,
}: {
  title: string;
  lines: string[];
  done: boolean;
  children?: ReactNode;
  status?: "idle" | "streaming" | "complete";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  const effectiveStatus =
    status ?? (done ? "complete" : lines.length > 0 ? "streaming" : "idle");

  const statusColor =
    effectiveStatus === "complete"
      ? "var(--success)"
      : effectiveStatus === "streaming"
        ? "var(--accent)"
        : "var(--muted-foreground)";
  const statusText =
    effectiveStatus === "complete"
      ? "COMPLETE"
      : effectiveStatus === "streaming"
        ? "STREAMING…"
        : "IDLE";

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
        <span style={{ color: "var(--foreground)" }}>▸ {title}</span>
        <span style={{ color: statusColor }}>{statusText}</span>
      </div>

      {children && (
        <div
          className="overflow-y-auto border-b"
          style={{ borderColor: "var(--border)", maxHeight: "55%" }}
        >
          {children}
        </div>
      )}

      <div
        ref={ref}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed"
        style={{ color: "var(--muted-foreground)" }}
      >
        {lines.map((l, i) => {
          const isLast = i === lines.length - 1;
          return (
            <div key={i} className="whitespace-pre-wrap">
              <span style={{ color: "var(--accent)" }}>&gt; </span>
              <span
                style={{
                  color:
                    isLast && !done
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {l}
              </span>
              {isLast && !done && (
                <span
                  className="ml-1 inline-block h-3 w-1.5 align-middle"
                  style={{
                    background: "var(--accent)",
                    animation: "blink 1s steps(2) infinite",
                  }}
                />
              )}
            </div>
          );
        })}
        {lines.length === 0 && (
          <div style={{ color: "var(--muted-foreground)" }}>
            Awaiting stream...
          </div>
        )}
      </div>
    </div>
  );
}
