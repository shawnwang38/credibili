---
phase: quick-260419-jat
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - pnpm-lock.yaml
  - tsconfig.json
  - next.config.ts
  - postcss.config.mjs
  - components.json
  - .gitignore
  - app/layout.tsx
  - app/globals.css
  - app/page.tsx
  - app/live/page.tsx
  - app/depth/page.tsx
  - app/api/live-stream/route.ts
  - app/api/depth-stream/route.ts
  - components/theme-provider.tsx
  - components/tab-nav.tsx
  - components/live/video-panel.tsx
  - components/live/claims-panel.tsx
  - components/live/score-panel.tsx
  - components/live/proceed-dialog.tsx
  - components/depth/analyzing-banner.tsx
  - components/depth/wip-feed.tsx
  - components/depth/background-panel.tsx
  - components/depth/past-credibility-panel.tsx
  - components/depth/present-state-panel.tsx
  - components/depth/future-simulation-panel.tsx
  - components/depth/stakeholder-graph.tsx
  - components/depth/overview-view.tsx
  - components/ui/* (shadcn primitives)
  - lib/store.ts
  - lib/schemas.ts
  - lib/fixtures.ts
  - lib/api-types.ts
autonomous: true
requirements:
  - LIVE-MODE
  - DEPTH-ANALYSIS
  - DEPTH-OVERVIEW
  - TAB-NAV
  - BLOOMBERG-REGISTER

must_haves:
  truths:
    - "User lands on app and sees two top tabs: Live Mode and Depth Mode"
    - "Live Mode shows YouTube video (upper-left), streaming claim list (right), credibility score (lower-left)"
    - "Selecting a claim card sets it as the selected claim for Depth Mode"
    - "Clicking 'Proceed to Depth Mode' opens confirmation dialog; confirming navigates to /depth"
    - "Depth Mode (analysis view) shows 2x2 grid of WIP-feed panels streaming line-by-line"
    - "Future Simulation panel is gated until Past + Present finish; clicking Start renders force graph + sim log"
    - "Notification bell button shows 'We will notify you when ready' toast"
    - "After all panels complete, Depth Mode shows Overview with three score tiles + verdict band + Back button"
    - "App is dark mode by default with sharp edges (zero border-radius), JetBrains Mono primary font, muted-warm OKLCH palette"
    - "No whole-page scroll on any route; only inside panels"
  artifacts:
    - path: "app/layout.tsx"
      provides: "Root layout with ThemeProvider, JetBrains Mono font, tab nav"
    - path: "app/live/page.tsx"
      provides: "Live Mode route — video + claims + score + proceed dialog"
    - path: "app/depth/page.tsx"
      provides: "Depth Mode route — 2x2 analysis grid with state-driven swap to overview"
    - path: "app/api/live-stream/route.ts"
      provides: "AI SDK v5 createUIMessageStream emitting data-claim parts"
    - path: "app/api/depth-stream/route.ts"
      provides: "AI SDK v5 createUIMessageStream emitting data-feed-line + data-score parts"
    - path: "lib/store.ts"
      provides: "Zustand store: selectedClaim, currentView, panelCompletion"
    - path: "lib/schemas.ts"
      provides: "Zod schemas for Claim, PastClaim, PresentState, Stakeholder, Score"
    - path: "lib/fixtures.ts"
      provides: "Hardcoded claim list, WIP feed lines, scores, stakeholders"
    - path: "components/depth/stakeholder-graph.tsx"
      provides: "react-force-graph-2d wrapper with 8-15 stakeholder nodes"
    - path: "app/globals.css"
      provides: "Tailwind v4 @theme tokens — OKLCH muted-warm palette, sharp-edge override, font-mono"
  key_links:
    - from: "components/live/claims-panel.tsx"
      to: "useChat from @ai-sdk/react -> /api/live-stream"
      via: "useChat with typed UIMessage data parts"
      pattern: "useChat.*api/live-stream|data-claim"
    - from: "components/depth/wip-feed.tsx"
      to: "useChat -> /api/depth-stream"
      via: "useChat with typed data-feed-line / data-score parts"
      pattern: "useChat.*api/depth-stream|data-feed-line"
    - from: "components/live/claims-panel.tsx"
      to: "lib/store.ts (setSelectedClaim)"
      via: "Zustand action on card click"
      pattern: "setSelectedClaim|useAppStore"
    - from: "components/live/proceed-dialog.tsx"
      to: "next/navigation router.push('/depth')"
      via: "Confirm button"
      pattern: "router\\.push.*depth"
    - from: "components/depth/future-simulation-panel.tsx"
      to: "panelCompletion.past && panelCompletion.present"
      via: "Zustand selector gates Start button disabled state"
      pattern: "panelCompletion\\.(past|present)"
---

<objective>
Build a complete Bloomberg-terminal-styled scaffold of "Can U Deliver" implementing the user's exact spec: Live Mode (video + streaming claims + score) and Depth Mode (2x2 WIP analysis grid → consumer-friendly overview), with mocked streaming via AI SDK v5 typed data parts.

Purpose: Ship a buildable, deployable, end-to-end demo of both modes in one shot — fixture-driven, no real LLM, but using the production code paths (route handlers as API stub, useChat for streaming, Zustand for UI state).

Output: A running Next.js 16 app at `/live` and `/depth` with full visual register, tab nav, streaming UI, force graph, and overview transition.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@./CLAUDE.md

<interfaces>
<!-- These are the contracts every task must build against. -->

Stack (LOCKED — do not deviate):
- next@^16.2  react@^19.2  react-dom@^19.2  typescript@^5.7
- tailwindcss@^4  @tailwindcss/postcss  tw-animate-css
- shadcn/ui (Tailwind v4 track) — `pnpm dlx shadcn@latest init` then add: button card dialog badge separator tabs table skeleton progress sonner
- next-themes@^0.4
- next/font/google -> JetBrains_Mono (subsets: ['latin'], variable: '--font-mono', display: 'swap')
- ai@^5  @ai-sdk/react@^2  zod@^3
- @tanstack/react-query@^5
- zustand@^5
- react-player@^3
- react-force-graph-2d@^1.48
- motion (only if needed for transitions; trivial CSS preferred)

Hardcoded MVP defaults:
- DEFAULT_VIDEO_ID = "dQw4w9WgXcQ" (placeholder; replace with any earnings call later)
- DEFAULT_COMPANY = { name: "Acme Robotics", ticker: "ACME", sector: "Industrial AI", marketCap: "$8.4B" }
- DEFAULT_CLAIM = "We will achieve positive operating margin by Q4 2026"

Zod schema shapes (lib/schemas.ts):
```ts
export const ClaimSchema = z.object({
  id: z.string(),
  timestamp: z.number(), // seconds into video
  text: z.string(),      // short summary
  verbatim: z.string(),  // full quote
});

export const PastClaimSchema = z.object({
  id: z.string(),
  year: z.number(),
  text: z.string(),
  delivered: z.boolean(),
});

export const PresentStateSchema = z.object({
  financials: z.object({ revenue: z.string(), margin: z.string(), growth: z.string() }),
  currentClaims: z.array(z.string()),
  competitors: z.array(z.object({ name: z.string(), claim: z.string(), revenue: z.string() })),
});

export const StakeholderSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: z.enum(["ceo","board","investor","customer","regulator","competitor","partner","employee"]),
});

export const ScoreSchema = z.object({
  pastDelivery: z.number().min(0).max(100),
  currentMarket: z.number().min(0).max(100),
  futureSimulation: z.number().min(0).max(100).nullable(),
  overall: z.enum(["Likely","Mixed","Unlikely"]),
});
```

AI SDK v5 typed UIMessage data parts (lib/api-types.ts):
```ts
import type { UIMessage } from "ai";
export type AppDataParts = {
  claim: z.infer<typeof ClaimSchema>;
  "feed-line": { panel: "background"|"past"|"present"|"future"; line: string; done?: boolean };
  score: z.infer<typeof ScoreSchema>;
};
export type AppUIMessage = UIMessage<never, AppDataParts>;
```

Route handler streaming pattern (app/api/*/route.ts):
```ts
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
export async function POST(req: Request) {
  const stream = createUIMessageStream<AppUIMessage>({
    execute: async ({ writer }) => {
      for (const c of fixtureClaims) {
        await sleep(800);
        writer.write({ type: "data-claim", id: c.id, data: c });
      }
    },
  });
  return createUIMessageStreamResponse({ stream });
}
```

Zustand store shape (lib/store.ts):
```ts
type AppState = {
  selectedClaim: Claim | null;
  setSelectedClaim: (c: Claim) => void;
  panelCompletion: { background: boolean; past: boolean; present: boolean; future: boolean };
  markPanelDone: (p: keyof AppState["panelCompletion"]) => void;
  depthView: "analysis" | "overview";
  setDepthView: (v: "analysis"|"overview") => void;
  videoTime: number;
  setVideoTime: (t: number) => void;
};
```

Tailwind v4 globals.css contract:
- `@import "tailwindcss";`
- `@import "tw-animate-css";`
- `@theme` block with OKLCH muted-warm tokens (background, foreground, panel, border, accent — warm neutrals like oklch(0.18 0.01 60) for dark bg)
- Global `* { border-radius: 0 !important; }` override OR `--radius: 0` shadcn token
- `font-family: var(--font-mono), ui-monospace, monospace;` on body
- `:root { --background, --foreground, ... }` light + `.dark { ... }` dark variant
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Next.js 16 + Tailwind v4 + TS + JetBrains Mono + theme shell</name>
  <files>package.json, tsconfig.json, next.config.ts, postcss.config.mjs, .gitignore, app/layout.tsx, app/globals.css, app/page.tsx, components/theme-provider.tsx, components/tab-nav.tsx</files>
  <action>
Initialize the project from zero in the repo root.

1. Bootstrap with pnpm (do NOT use create-next-app interactive — write files directly to avoid interactive prompts):
   - Create `package.json` with scripts: `dev`, `build`, `start`, `lint`. Dependencies: next@^16.2, react@^19.2, react-dom@^19.2, next-themes@^0.4. Dev: typescript@^5.7, @types/react, @types/node, tailwindcss@^4, @tailwindcss/postcss, tw-animate-css.
   - `pnpm install`
2. Create `tsconfig.json` (standard Next 16 strict config, paths `@/*` -> `./*`).
3. Create `next.config.ts` minimal `export default {} satisfies NextConfig`.
4. Create `postcss.config.mjs` with `@tailwindcss/postcss` plugin (Tailwind v4 way).
5. Create `app/globals.css`:
   - `@import "tailwindcss";`
   - `@import "tw-animate-css";`
   - `@custom-variant dark (&:where(.dark, .dark *));`
   - `@theme inline` block defining OKLCH muted-warm tokens: `--color-background`, `--color-foreground`, `--color-panel`, `--color-border`, `--color-muted`, `--color-accent` (use values like `oklch(0.16 0.008 60)` for dark bg, `oklch(0.92 0.01 75)` for light bg, warm neutral hues 50-80).
   - Light/dark variable sets via `:root` and `.dark`.
   - Body: `font-family: var(--font-mono), ui-monospace, monospace; background: var(--color-background); color: var(--color-foreground);`
   - Global sharp-edge override: `*, *::before, *::after { border-radius: 0 !important; }`
   - `html, body { height: 100%; overflow: hidden; }` to enforce no whole-page scroll.
6. Add JetBrains Mono via `next/font/google` in `app/layout.tsx`:
   ```ts
   import { JetBrains_Mono } from "next/font/google";
   const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
   ```
   Apply `mono.variable` to `<html className={`${mono.variable} dark`}>`.
7. Create `components/theme-provider.tsx` — thin wrapper around `next-themes` ThemeProvider with `attribute="class"`, `defaultTheme="dark"`, `disableTransitionOnChange`.
8. Wrap children in `app/layout.tsx` with ThemeProvider + render `<TabNav />` at the top.
9. Create `components/tab-nav.tsx` — client component with two `Link`s ("Live Mode" -> `/live`, "Depth Mode" -> `/depth`); uses `usePathname` to apply active styling (border-bottom accent). Sharp uppercase labels, mono font, ~48px tall, panel-background.
10. Create `app/page.tsx` that uses `redirect("/live")` from `next/navigation` (server component).

Do NOT install shadcn yet (next task). Do NOT install AI/zustand/etc yet (later tasks) — keep this task focused on a buildable shell.
  </action>
  <verify>
    <automated>pnpm install &amp;&amp; pnpm build</automated>
  </verify>
  <done>`pnpm build` succeeds. `pnpm dev` serves `/` -> redirects to `/live` (404 expected for /live, that's fine — placeholder created next). Tab nav renders with mono font, dark mode, sharp edges. No whole-page scroll on root.</done>
</task>

<task type="auto">
  <name>Task 2: Install shadcn/ui v4 + primitives + verify theme tokens</name>
  <files>components.json, components/ui/button.tsx, components/ui/card.tsx, components/ui/dialog.tsx, components/ui/badge.tsx, components/ui/separator.tsx, components/ui/tabs.tsx, components/ui/table.tsx, components/ui/skeleton.tsx, components/ui/progress.tsx, components/ui/sonner.tsx, app/globals.css (extend), app/layout.tsx (Toaster mount)</files>
  <action>
1. Run `pnpm dlx shadcn@latest init` non-interactively where possible. Choices: style=new-york, base color=neutral, CSS variables=yes. This will write `components.json` and patch `app/globals.css` with shadcn's `:root` / `.dark` token blocks.
2. After init, AUDIT `app/globals.css`: shadcn's defaults will use `hsl()` — REPLACE all shadcn token values with OKLCH muted-warm equivalents while keeping the same token NAMES (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, etc.). Use warm hue 50-80, low chroma 0.005-0.02. Keep our `--radius: 0` override.
3. Re-assert global sharp-edge rule (`*, *::before, *::after { border-radius: 0 !important; }`) AFTER shadcn's CSS — shadcn writes `--radius: 0.5rem`, override to `--radius: 0`.
4. Add primitives: `pnpm dlx shadcn@latest add button card dialog badge separator tabs table skeleton progress sonner`.
5. Mount `<Toaster />` from `components/ui/sonner.tsx` in `app/layout.tsx` (under children).
6. Sanity render: temporarily render a `<Button>Test</Button>` in a placeholder `app/live/page.tsx` to confirm primitives import and theme correctly.

Verify shadcn primitives use the muted-warm palette (no blue/indigo defaults bleeding through).
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm build` succeeds. `/live` renders shadcn Button with sharp edges, mono font, muted-warm dark theme. `components/ui/*.tsx` files exist. Toaster mounted.</done>
</task>

<task type="auto">
  <name>Task 3: Install runtime deps + zod schemas + fixtures + Zustand store + typed AI message types</name>
  <files>package.json (deps), lib/schemas.ts, lib/fixtures.ts, lib/store.ts, lib/api-types.ts</files>
  <action>
1. Install runtime deps:
   `pnpm add ai @ai-sdk/react zod @tanstack/react-query zustand react-player react-force-graph-2d`
2. Create `lib/schemas.ts` with the exact Zod schemas from the `<interfaces>` block above (Claim, PastClaim, PresentState, Stakeholder, Score). Export both schemas and inferred types.
3. Create `lib/api-types.ts`:
   - Import schemas, define `AppDataParts` and `AppUIMessage` exactly as specified in `<interfaces>`.
4. Create `lib/fixtures.ts`:
   - `fixtureClaims: Claim[]` — 6 entries, increasing timestamps 12s/45s/82s/127s/175s/220s, plausible CEO claims about Acme Robotics (margin, R&D spend, customer wins, etc.). Each has id, timestamp, text (short), verbatim (longer quote).
   - `fixturePastClaims: PastClaim[]` — 8 entries spanning years 2021-2025, mix of delivered:true/false. Past delivery rate around 5/8 = 62.5%.
   - `fixturePresentState: PresentState` — financials (revenue "$1.8B", margin "-4%", growth "+22% YoY"), currentClaims (3-4 strings), competitors (3 entries).
   - `fixtureStakeholders: { nodes: Stakeholder[]; links: {source:string;target:string}[] }` — 12 nodes covering all roles, ~18 links.
   - `fixtureFeedLines: Record<"background"|"past"|"present"|"future", string[]>` — 6-10 plausible WIP lines per panel (terminal-style: "Fetching SEC 10-K filings...", "Matched 14/18 past claims...", "Computing Herfindahl index...", etc.). Last line of each non-future panel set should signal completion.
   - `fixtureScore: Score` — pastDelivery 62, currentMarket 54, futureSimulation null (set when sim runs), overall "Mixed".
5. Create `lib/store.ts` with Zustand store matching the shape in `<interfaces>`. Use `create` from zustand, no middleware needed.

Type-check everything with strict TS.
  </action>
  <verify>
    <automated>pnpm tsc --noEmit</automated>
  </verify>
  <done>`pnpm tsc --noEmit` clean. All fixtures parse against their zod schemas (add a quick `ClaimSchema.array().parse(fixtureClaims)` in a `__schema_check.ts` if helpful, or assert via `satisfies`). Store importable from any client component.</done>
</task>

<task type="auto">
  <name>Task 4: Streaming route handler /api/live-stream — emits data-claim parts</name>
  <files>app/api/live-stream/route.ts</files>
  <action>
Create POST handler at `app/api/live-stream/route.ts`:

```ts
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import type { AppUIMessage } from "@/lib/api-types";
import { fixtureClaims } from "@/lib/fixtures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const stream = createUIMessageStream<AppUIMessage>({
    execute: async ({ writer }) => {
      for (const claim of fixtureClaims) {
        await new Promise(r => setTimeout(r, 1200));
        writer.write({ type: "data-claim", id: claim.id, data: claim });
      }
    },
  });
  return createUIMessageStreamResponse({ stream });
}
```

Verify the AI SDK v5 export names against installed `ai` package — if `createUIMessageStreamResponse` is named differently in the installed version, adjust accordingly (consult node_modules/ai/dist types). The pattern is: create stream → return SSE response.
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm build` succeeds. `curl -X POST http://localhost:3000/api/live-stream` (during `pnpm dev`) streams SSE chunks containing the 6 fixture claims with ~1.2s gaps.</done>
</task>

<task type="auto">
  <name>Task 5: Streaming route handler /api/depth-stream — emits data-feed-line per panel + final data-score</name>
  <files>app/api/depth-stream/route.ts</files>
  <action>
Create POST handler at `app/api/depth-stream/route.ts`. Accept JSON body `{ runFuture: boolean }` (defaults false).

Logic:
1. Stream `data-feed-line` parts for the `background` panel sequentially (200-400ms gaps), last line marked `done: true`.
2. Stream `past` panel lines in parallel-ish — interleave with `present` panel lines so both progress concurrently. Each line: `{ panel: "past"|"present", line: "...", done?: true }`. Mark final line of each panel `done: true`.
3. If `runFuture === true` (only when client requests): after past + present complete, stream `future` panel lines + final `done`.
4. After all requested panels done, write `data-score` with the final fixture score (futureSimulation = 78 if runFuture else null; recompute overall accordingly).

Use the same `createUIMessageStream` / `createUIMessageStreamResponse` pattern as Task 4. Each `feed-line` writer.write uses `id: \`${panel}-${idx}\`` so the client can append (NOT reconcile) — for line-by-line streaming we want each line as a distinct part.

```ts
writer.write({ type: "data-feed-line", id: `${panel}-${idx}`, data: { panel, line, done } });
```

Read the body via `await req.json().catch(() => ({}))` and default `runFuture` to `false`.
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm build` succeeds. POSTing to `/api/depth-stream` with `{}` streams 3 panels' feed lines + final score (future=null). POSTing with `{"runFuture":true}` additionally streams future lines and final score has futureSimulation set.</done>
</task>

<task type="auto">
  <name>Task 6: Live Mode page — video + claims (useChat) + score + Proceed dialog</name>
  <files>app/live/page.tsx, components/live/video-panel.tsx, components/live/claims-panel.tsx, components/live/score-panel.tsx, components/live/proceed-dialog.tsx</files>
  <action>
Build the Live Mode route with the user's exact layout. `app/live/page.tsx` is a client component (or server component shelling out to a client wrapper) that renders a CSS grid:

Grid: `grid-cols-2 grid-rows-2` filling the viewport (minus tab nav height). Layout:
- `video-panel` -> `col-start-1 row-start-1` (upper-left quarter)
- `score-panel` -> `col-start-1 row-start-2` (lower-left quarter)
- `claims-panel` -> `col-start-2 row-span-2` (right half full height)

Each panel: 1px border (`border-[var(--color-border)]`), panel background, internal scroll only.

**components/live/video-panel.tsx** (client):
- Dynamic import `react-player` with `ssr: false` (force-graph and player both need client-only).
- Props: none. Hardcoded `url={\`https://www.youtube.com/watch?v=${DEFAULT_VIDEO_ID}\`}`.
- `onProgress={({ playedSeconds }) => useAppStore.getState().setVideoTime(playedSeconds)}` at 500ms interval.
- Fills its panel; `width="100%" height="100%"`.

**components/live/claims-panel.tsx** (client):
- Use `useChat<AppUIMessage>({ api: "/api/live-stream" })` from `@ai-sdk/react` v2. On mount, trigger the stream via `sendMessage()` (no user input — just kick it off in `useEffect`).
- From `messages`, extract `data-claim` parts: `messages.flatMap(m => m.parts.filter(p => p.type === "data-claim").map(p => p.data))`.
- Render header "KEY CLAIMS" (uppercase, mono, label-size). Then a scrollable list of `Card` components, one per claim. Each card shows:
  - Mono timestamp `[mm:ss]`
  - Short claim text
  - Verbatim quote (smaller, muted)
  - Click handler: `useAppStore.getState().setSelectedClaim(claim)`. Selected claim gets accent border-left.
- Bottom of panel (sticky): `<Button onClick={() => setProceedOpen(true)}>PROCEED TO DEPTH MODE →</Button>`. Disabled until at least one claim is selected.
- Renders `<ProceedDialog open={proceedOpen} onOpenChange={setProceedOpen} />`.

**components/live/score-panel.tsx** (client):
- Display `CREDIBILITY SCORE` header.
- Big number: `72` (mono, ~48px — but stay within constrained type scale, use one of the 3-4 sizes).
- Verdict label below: `MIXED`.
- Four bars (Transparency / Accuracy / Consistency / Industry State) — use shadcn `Progress` or simple divs with `bg-[var(--color-accent)]` widths from hardcoded values [68, 74, 61, 80].
- Pure visual (no streaming).

**components/live/proceed-dialog.tsx** (client):
- shadcn `Dialog` with title "End Live Mode?", body "This will end Live mode. Are you sure?", actions: Cancel + Confirm.
- Confirm: `router.push("/depth")` from `next/navigation`.
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm dev` -> `/live` renders 2x2-style layout (video upper-left, score lower-left, claims right-half). Claims stream in over ~7s. Clicking a claim highlights it + enables Proceed button. Proceed opens dialog; Confirm navigates to `/depth`. No whole-page scroll. JetBrains Mono throughout.</done>
</task>

<task type="auto">
  <name>Task 7: Depth Mode analysis view — 2x2 grid + WIP feed panels + analyzing banner + force graph (gated)</name>
  <files>app/depth/page.tsx, components/depth/analyzing-banner.tsx, components/depth/wip-feed.tsx, components/depth/background-panel.tsx, components/depth/past-credibility-panel.tsx, components/depth/present-state-panel.tsx, components/depth/future-simulation-panel.tsx, components/depth/stakeholder-graph.tsx</files>
  <action>
**app/depth/page.tsx** (client component):
- Read `depthView` from store. If `"overview"`, render `<OverviewView />` (built in Task 8). Else render the analysis grid below.
- On mount, kick off `useChat<AppUIMessage>({ api: "/api/depth-stream" })` with `sendMessage({ /* metadata: runFuture: false */ })`. The future panel separately calls a second `useChat` instance (or re-triggers with `runFuture: true`) when user clicks Start.
- Layout: vertical flex. Top: `<AnalyzingBanner />`. Below: `grid grid-cols-2 grid-rows-2 gap-px bg-[var(--color-border)]` filling remaining viewport. Each cell is a panel with `bg-[var(--color-panel)]`.
- Pass relevant feed lines to each panel. Filter `messages` -> `data-feed-line` parts -> group by `panel`. Pass `lines: string[]` and `done: boolean` props down. On a panel's `done`, call `useAppStore.markPanelDone(panel)`.
- On `data-score` part received, set store `setDepthView("overview")` after a 1.5s delay (let user see final state).

**components/depth/analyzing-banner.tsx** (client):
- Sticky top bar (full width, ~40px). Text: "ANALYZING — COME BACK IN A BIT" left-aligned, mono uppercase.
- Right side: bell icon button (use lucide-react `Bell` — already a shadcn dep, or inline SVG). On click: `toast("We will notify you when ready")` from `sonner`.

**components/depth/wip-feed.tsx** (client, generic):
- Props: `title: string`, `lines: string[]`, `done: boolean`, plus optional `children` (for panel-specific content above the feed, e.g., background panel's metadata header).
- Renders panel header: title (uppercase mono label) + status badge ("STREAMING..." pulsing or "COMPLETE" muted).
- Children area (if provided).
- Scrollable feed: each line prefixed with `> ` mono, terminal style. Auto-scroll to bottom on new lines (use a ref + effect).
- Subtle "WIP" disclaimer: the streaming-status badge + cursor-blink on last line communicate this; no extra text needed.

**components/depth/background-panel.tsx** (client):
- Wraps `<WipFeed title="BACKGROUND" lines={lines} done={done}>`.
- Children: small grid header showing DEFAULT_COMPANY (name, ticker, sector, marketCap) + selected claim text from store + a placeholder source URL.

**components/depth/past-credibility-panel.tsx** (client):
- Wraps `<WipFeed title="PAST CREDIBILITY" ...>`.
- Children: scrollable list of `fixturePastClaims`, each row: year, claim text, badge ("MET" / "UNMET" — color via `Badge` variant). At top: "PAST DELIVERY RATE: 62%" big mono.

**components/depth/present-state-panel.tsx** (client):
- Wraps `<WipFeed title="PRESENT STATE" ...>`.
- Children: financials row (3 stats), current claims list, competitor table (shadcn `Table`).

**components/depth/future-simulation-panel.tsx** (client):
- Wraps `<WipFeed title="FUTURE SIMULATION" ...>`.
- State: `started: boolean`. Read `panelCompletion.past && panelCompletion.present` from store -> `canStart`.
- If `!started`: render centered "FUTURE SIMULATION — IDLE" + `<Button disabled={!canStart} onClick={() => { setStarted(true); secondUseChat.sendMessage({ runFuture: true }); }}>START SIMULATION</Button>`. Helper text under disabled button: "Awaiting Past + Present completion".
- If `started`: render `<StakeholderGraph />` taking ~60% of panel height + the WIP feed log below it.
- Note: this panel needs its own `useChat` instance pointing at `/api/depth-stream` with `runFuture: true` body — OR the parent page can manage a second chat. Easiest: parent passes a `triggerFuture()` callback + future-specific lines down as props.

**components/depth/stakeholder-graph.tsx** (client, dynamic import):
- Dynamic import `react-force-graph-2d` with `ssr: false`.
- Pass `graphData={ nodes: fixtureStakeholders.nodes, links: fixtureStakeholders.links }`.
- `nodeLabel="label"`, `nodeColor={() => "var(--color-accent)"}` (via canvas getComputedStyle since canvas can't use CSS vars directly — fall back to a hex like `#c9a877` for warm accent).
- `nodeCanvasObject` to draw small filled circles + label below each.
- Container must have explicit width/height (use a ResizeObserver pattern or pass `width={parent.clientWidth} height={parent.clientHeight}`).
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm dev` -> `/depth` renders 2x2 panels with banner. Background/Past/Present panels stream lines in real-time. Past + Present show their fixture data. Bell button shows toast. Future panel disabled until Past + Present complete; clicking Start renders force graph + future feed lines. After all done, view swaps to overview (Task 8 will provide).</done>
</task>

<task type="auto">
  <name>Task 8: Depth Mode overview view — 3 score tiles + verdict band + back button</name>
  <files>components/depth/overview-view.tsx, app/depth/page.tsx (wire view swap)</files>
  <action>
**components/depth/overview-view.tsx** (client):
- Spacious layout (NOT dense). Centered max-width container, padded.
- Top: "SELECTED CLAIM" label + the selected claim text (mono, larger than body).
- Three tiles side-by-side (`grid grid-cols-3 gap-px bg-border`):
  - Tile 1: "PAST DELIVERY" + big number `62`
  - Tile 2: "CURRENT MARKET" + big number `54`
  - Tile 3: "FUTURE SIMULATION" + big number `78` OR text `NOT RUN` (read from store/score)
- Each tile: panel background, ~120px tall, mono.
- Verdict band below tiles: full-width strip with verdict label (`LIKELY` / `MIXED` / `UNLIKELY`), color-coded via accent variants (warm green for Likely, warm amber for Mixed, warm red for Unlikely — all muted OKLCH).
- Computation rule for verdict: average available scores; >=70 Likely, 50-69 Mixed, <50 Unlikely. Match what the route handler emitted but recompute client-side as fallback for resilience.
- Bottom: `<Button variant="outline" onClick={() => useAppStore.getState().setDepthView("analysis")}>← BACK TO ANALYSIS BREAKDOWN</Button>`.

**app/depth/page.tsx**: ensure conditional rendering already wired in Task 7 — verify it actually swaps to `<OverviewView />` when `depthView === "overview"`.

Make sure overview obeys no-whole-page-scroll (viewport-contained).
  </action>
  <verify>
    <automated>pnpm build</automated>
  </verify>
  <done>`pnpm dev`: complete Live → Depth flow. After all panels finish, page swaps to overview showing 3 tiles + verdict band. Skipping Future shows "NOT RUN" tile. Back button returns to 2x2 grid (state preserved — panels still show their final lines).</done>
</task>

<task type="auto">
  <name>Task 9: Final smoke + tab nav active states + dev README</name>
  <files>components/tab-nav.tsx (refine), app/layout.tsx (verify), README.md</files>
  <action>
1. Verify `TabNav` correctly highlights active tab via `usePathname()`. `/live` -> Live Mode active; `/depth` -> Depth Mode active. Active = bottom border in accent color, mono uppercase. Inactive = muted foreground.
2. Verify root layout wraps everything: html dark class default, mono variable applied, ThemeProvider, TabNav, Toaster.
3. Write a minimal `README.md`:
   - Title, one-line description
   - `pnpm install && pnpm dev` quickstart
   - Notes: mocked streaming via route handlers, no real backend, hardcoded video + claim, dark mode default
   - Routes: `/live`, `/depth`
4. Final pass: run `pnpm build` and walk through the happy path manually, confirming all `must_haves.truths` hold.
  </action>
  <verify>
    <automated>pnpm build &amp;&amp; pnpm tsc --noEmit</automated>
  </verify>
  <done>Build clean, types clean. Tab nav active state visible. README present. Manual walkthrough: load `/live`, claims stream, select one, proceed dialog, navigate `/depth`, panels stream, start future sim, force graph renders, view swaps to overview, back button returns to analysis. All under viewport, mono font, sharp edges, dark muted-warm.</done>
</task>

</tasks>

<verification>
End-to-end manual smoke:
1. `pnpm install && pnpm dev`
2. Visit `http://localhost:3000` → redirects to `/live`
3. Confirm tab nav (Live Mode active, Depth Mode inactive)
4. Video panel renders (YouTube embed loads)
5. Claims stream into right panel over ~7s, six total
6. Click a claim card → accent border-left appears, Proceed button enables
7. Score panel shows 72 + MIXED + four bars (lower-left)
8. Click Proceed → dialog opens → Confirm → navigates to `/depth`
9. Tab nav now shows Depth Mode active
10. Banner reads "ANALYZING — COME BACK IN A BIT" with bell button
11. Bell click → sonner toast
12. Background, Past, Present panels stream WIP lines terminal-style
13. Future panel: Start button disabled until Past + Present complete
14. Click Start → force graph renders with ~12 stakeholder nodes + future feed streams
15. After all panels done + score received, ~1.5s later view swaps to overview
16. Overview shows 3 tiles (62 / 54 / 78), verdict band ("MIXED" or "LIKELY"), back button
17. Back → returns to 2x2 grid with final panel states preserved
18. No vertical page scroll on any route. Sharp edges everywhere. JetBrains Mono everywhere.
19. Toggle browser to light mode (or wire a manual toggle) — palette stays muted-warm, readable.
</verification>

<success_criteria>
- `pnpm build` succeeds with zero errors
- `pnpm tsc --noEmit` clean
- All `must_haves.truths` observable via manual smoke
- All `must_haves.artifacts` exist at specified paths
- All `must_haves.key_links` greppable in source
- App is deployable to Vercel as-is (`vercel deploy` would succeed)
</success_criteria>

<output>
After completion, create `.planning/quick/260419-jat-implement-live-mode-depth-mode-analysis-/260419-jat-SUMMARY.md` documenting:
- Final dependency versions installed (lockfile snapshot of key packages)
- Any AI SDK v5 API name adjustments made (in case createUIMessageStreamResponse import name differed)
- Any shadcn primitive customizations beyond sharp-edge override
- Notes on what to swap when real backend lands (route handlers → proxy)
- Known limitations / hardcoded values (DEFAULT_VIDEO_ID, DEFAULT_COMPANY, fixture content)
</output>
