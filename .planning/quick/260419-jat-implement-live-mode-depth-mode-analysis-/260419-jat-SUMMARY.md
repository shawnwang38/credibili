---
phase: quick-260419-jat
plan: 01
subsystem: scaffold
tags: [scaffold, live-mode, depth-mode, ai-sdk, streaming, force-graph]
requires: []
provides:
  - live-mode-route
  - depth-mode-route
  - depth-overview-route
  - live-stream-api
  - depth-stream-api
  - typed-ui-message-parts
  - app-store
affects: [whole-app]
tech-stack:
  added:
    - next@16.2.4
    - react@19.2.5
    - react-dom@19.2.5
    - typescript@5.9.3
    - tailwindcss@4.2.2
    - tw-animate-css@1.4.0
    - shadcn (base-ui radix track) + primitives: button, card, dialog, badge, separator, tabs, table, skeleton, progress, sonner
    - next-themes@0.4.6
    - ai@6.0.168
    - "@ai-sdk/react@3.0.170"
    - zod@4.3.6
    - "@tanstack/react-query@5.99.2"
    - zustand@5.0.12
    - react-player@3.4.0
    - react-force-graph-2d@1.29.1
    - lucide-react (transitive via shadcn)
  patterns:
    - "Tailwind v4 CSS-first @theme inline with OKLCH muted-warm tokens"
    - "AI SDK v6 createUIMessageStream + DefaultChatTransport for typed UI parts"
    - "Zustand global UI store, useChat owns streaming state"
key-files:
  created:
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
    - components/ui/button.tsx
    - components/ui/card.tsx
    - components/ui/dialog.tsx
    - components/ui/badge.tsx
    - components/ui/separator.tsx
    - components/ui/tabs.tsx
    - components/ui/table.tsx
    - components/ui/skeleton.tsx
    - components/ui/progress.tsx
    - components/ui/sonner.tsx
    - lib/schemas.ts
    - lib/api-types.ts
    - lib/fixtures.ts
    - lib/store.ts
    - lib/utils.ts
    - components.json
    - package.json
    - pnpm-lock.yaml
    - tsconfig.json
    - next.config.ts
    - postcss.config.mjs
    - .gitignore
    - README.md
  modified: []
decisions:
  - "Used AI SDK v6 (latest installed) with DefaultChatTransport instead of plan's v5 useChat({ api }) shape — v6 requires explicit transport class. Same data-part contract."
  - "Bootstrapped package.json + tsconfig manually rather than running create-next-app to avoid interactive prompts."
  - "Added pulse + blink keyframes inline in globals.css (rather than installing motion) — trivial CSS animation only."
  - "Future panel uses a SECOND useChat instance with a transport whose body has runFuture:true, so the same /api/depth-stream handler routes to the future-only branch."
  - "ReactPlayer v3 onTimeUpdate (HTMLMediaElement event) replaces v2's onProgress — adapted client-side."
metrics:
  duration: ~14m30s
  completed: 2026-04-19
---

# Phase quick-260419-jat Plan 01: Live Mode + Depth Mode Analysis Scaffold Summary

Bootstrapped a complete Bloomberg-terminal-styled Next.js 16 + Tailwind v4 + AI SDK v6 demo of "Can U Deliver" with mocked streaming via typed UIMessage data parts, force-directed stakeholder graph, and a state-driven Depth Mode (analysis 2x2 grid → consumer-friendly overview with verdict).

## What Shipped

### Routes
- `/` — server component, redirects to `/live`
- `/live` — Live Mode 2x2 layout: video upper-left, score lower-left, streaming claims right-half
- `/depth` — Depth Mode: 2x2 WIP grid that auto-swaps to Overview after final score arrives (1.5s delay)
- `/api/live-stream` (POST) — streams 6 fixture `data-claim` parts with 1.2s gaps
- `/api/depth-stream` (POST) — body `{ runFuture?: boolean }`. Default: background sequential then past+present concurrent then `data-score` (futureSim=null). With `runFuture:true`: future panel only then `data-score` (futureSim=78).

### Components
- **Live:** `VideoPanel` (react-player YouTube embed with onTimeUpdate→store), `ClaimsPanel` (useChat → /api/live-stream, data-claim extraction, click sets selectedClaim, sticky Proceed button), `ScorePanel` (72/MIXED + 4 attribute bars), `ProceedDialog` (Confirm resets panels + router.push('/depth')).
- **Depth:** `AnalyzingBanner` (pulsing indicator + Bell→sonner toast), `WipFeed` (terminal log with cursor blink), four panel components, `StakeholderGraph` (canvas force graph, 12 nodes, role-coloured), `OverviewView` (3 score tiles + verdict band + Back).

### Design register
- **OKLCH muted-warm palette**, hue 50-80, low chroma. Dark default.
- **Sharp edges:** `--radius: 0` plus global `border-radius: 0 !important` override defeats any shadcn rounded-* utility.
- **No whole-page scroll:** `html, body { overflow: hidden }`; scroll lives only inside panels (claims list, WIP feeds, past-claims list, overview body).
- **JetBrains Mono** everywhere via `next/font/google`; `--font-sans` aliased to `--font-mono` so shadcn primitives inherit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] AI SDK v6 (not v5) installed; useChat API shape differs**
- **Found during:** Task 6 (writing claims-panel.tsx)
- **Issue:** Plan called for `useChat({ api: '/api/live-stream' })` (v5 shape). `@ai-sdk/react@3` (peer of `ai@6`) requires `useChat({ transport })` where `transport = new DefaultChatTransport({ api })`.
- **Fix:** Verified against `node_modules/ai/dist/index.d.ts` and `node_modules/@ai-sdk/react/dist/index.d.ts`. Used `DefaultChatTransport` in both ClaimsPanel and DepthPage.
- **Files modified:** `components/live/claims-panel.tsx`, `app/depth/page.tsx`
- **Commit:** `8babd2e`, `d0b72d9`

**2. [Rule 1 — Bug] react-player v3 dropped onProgress in favour of HTMLMediaElement events**
- **Found during:** Task 6
- **Issue:** Plan calls `onProgress={({ playedSeconds }) => ...}`; v3's exports use `onTimeUpdate` with native event signature.
- **Fix:** Used `onTimeUpdate={(e) => setVideoTime((e.currentTarget as HTMLMediaElement).currentTime)}`.
- **Files modified:** `components/live/video-panel.tsx`
- **Commit:** `8babd2e`

**3. [Rule 2 — Critical UX] Future-panel runFuture body wiring**
- **Found during:** Task 7
- **Issue:** Initial draft used `sendMessage({ metadata: { runFuture: true } })` which `useChat` does not forward into the request body for the route handler to read.
- **Fix:** Configured the future `DefaultChatTransport` with `body: { runFuture: true }` so the depth route's `req.json()` sees the flag.
- **Files modified:** `app/depth/page.tsx`
- **Commit:** `d0b72d9`

**4. [Rule 2 — Critical visual] shadcn init wrote neutral grayscale tokens; sharp-edge override missing on shadcn rounded utilities**
- **Found during:** Task 2
- **Issue:** `shadcn init` overwrote `app/globals.css` with neutral hsl OKLCH tokens, `--radius: 0.625rem`, and added Geist font (plan dictates JetBrains Mono everywhere).
- **Fix:** Re-wrote globals.css preserving shadcn's required token names but replacing all values with muted-warm OKLCH hue 50-80, set `--radius: 0` and aliased `--font-sans = --font-heading = var(--font-mono)`. Layout file reverted to JetBrains Mono only.
- **Files modified:** `app/globals.css`, `app/layout.tsx`
- **Commit:** `fce6a97`

**5. [Rule 2 — Critical missing styles] Animations referenced in JSX but not declared in CSS**
- **Found during:** Task 9 (final pass)
- **Issue:** AnalyzingBanner and WipFeed referenced `animation: pulse ...` and `animation: blink ...` but `@keyframes` were never declared.
- **Fix:** Added inline `@keyframes pulse` + `@keyframes blink` to globals.css.
- **Commit:** `bb316ae`

### No architectural deviations (Rule 4) — plan followed exactly otherwise.

## Authentication Gates
None — no real LLM, no auth.

## Known Stubs / Hardcoded Values
| Value | Where | When real |
|---|---|---|
| `DEFAULT_VIDEO_ID = "dQw4w9WgXcQ"` | `lib/fixtures.ts` | Replace with claim-source video id from chrome-extension payload |
| `DEFAULT_COMPANY` (Acme Robotics, ACME, $8.4B) | `lib/fixtures.ts` | Replace with company resolver from extracted ticker |
| `DEFAULT_CLAIM` (Q4 2026 margin) | `lib/fixtures.ts` | Replace with extension-extracted claim text |
| Score panel: 72/MIXED + four bar values | `components/live/score-panel.tsx` | Wire to `/api/live-score` once backend lands |
| `fixturePastClaims`, `fixturePresentState`, `fixtureStakeholders`, `fixtureFeedLines`, `fixtureScore*` | `lib/fixtures.ts` | All replaced when route handlers proxy real backend |

These stubs are intentional and documented — the plan explicitly scopes a fixture-driven scaffold.

## Real-Backend Swap Plan
1. `app/api/live-stream/route.ts`: replace `for (const claim of fixtureClaims)` loop with LLM/transcript-extractor pipeline emitting `writer.write({ type: "data-claim", id, data })`. Client unchanged.
2. `app/api/depth-stream/route.ts`: replace per-panel fixture loops with real analyzer pipelines emitting `data-feed-line` + `data-score`. Client unchanged.
3. Delete `lib/fixtures.ts` once nothing imports it.
4. Replace static score panel values with a third route handler or a TanStack Query call.

## Verification

```
pnpm build  → ✓ Compiled successfully (Next 16.2.4 / Turbopack)
pnpm tsc --noEmit  → clean
```

Routes generated:
- `○ /`, `○ /depth`, `○ /live`, `○ /_not-found`
- `ƒ /api/depth-stream`, `ƒ /api/live-stream` (dynamic, force-dynamic, node runtime)

## Self-Check: PASSED

- File `app/live/page.tsx` — FOUND
- File `app/depth/page.tsx` — FOUND
- File `app/api/live-stream/route.ts` — FOUND
- File `app/api/depth-stream/route.ts` — FOUND
- File `lib/store.ts` — FOUND
- File `lib/schemas.ts` — FOUND
- File `lib/fixtures.ts` — FOUND
- File `lib/api-types.ts` — FOUND
- File `components/depth/stakeholder-graph.tsx` — FOUND
- File `components/depth/overview-view.tsx` — FOUND
- File `components/live/claims-panel.tsx` — FOUND
- File `components/live/proceed-dialog.tsx` — FOUND
- File `app/globals.css` — FOUND
- File `app/layout.tsx` — FOUND
- File `components/theme-provider.tsx` — FOUND
- File `components/tab-nav.tsx` — FOUND
- File `README.md` — FOUND
- Commit `47edf6e` (scaffold) — FOUND
- Commit `fce6a97` (shadcn) — FOUND
- Commit `6a8b0e2` (data) — FOUND
- Commit `e0da4d2` (live-stream API) — FOUND
- Commit `1f43150` (depth-stream API) — FOUND
- Commit `8babd2e` (live mode) — FOUND
- Commit `d0b72d9` (depth mode) — FOUND
- Commit `c84cb9c` (overview) — FOUND
- Commit `bb316ae` (polish) — FOUND
