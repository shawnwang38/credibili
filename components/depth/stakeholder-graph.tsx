"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { fixtureStakeholders } from "@/lib/fixtures";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const ROLE_COLOR: Record<string, string> = {
  ceo: "#d4a373",
  board: "#c89b6f",
  investor: "#b08968",
  customer: "#9a8c98",
  regulator: "#a98467",
  competitor: "#bc6c25",
  partner: "#caa472",
  employee: "#8d8775",
};

export function StakeholderGraph() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(() => {
      const r = wrapperRef.current!.getBoundingClientRect();
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(wrapperRef.current);
    const r = wrapperRef.current.getBoundingClientRect();
    setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {size.w > 0 && size.h > 0 && (
        <ForceGraph2D
          width={size.w}
          height={size.h}
          graphData={fixtureStakeholders}
          backgroundColor="rgba(0,0,0,0)"
          nodeRelSize={5}
          linkColor={() => "rgba(180,160,130,0.35)"}
          linkWidth={1}
          cooldownTicks={120}
          nodeCanvasObject={(node, ctx, globalScale) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const n = node as any;
            const role = n.role as string;
            const color = ROLE_COLOR[role] ?? "#caa472";
            ctx.beginPath();
            ctx.arc(n.x, n.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            const label = n.label as string;
            const fontSize = 10 / Math.max(globalScale, 0.6);
            ctx.font = `${fontSize}px JetBrains Mono, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(230,220,200,0.9)";
            ctx.fillText(label, n.x, n.y + 7);
          }}
          nodeCanvasObjectMode={() => "after"}
        />
      )}
    </div>
  );
}
