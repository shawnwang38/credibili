# Roadmap: Can U Deliver

**Milestone:** v1 MVP
**Created:** 2026-04-19
**Granularity:** coarse (4–5 phases)
**Core Value:** Give ordinary investors a credible, non-overwhelming verdict — *can this company deliver this claim?* — backed by visible reasoning they can trust.

## Phases

- [ ] **Phase 1: Foundation** — Design system, typed API + mock backend, streaming hook, global stepper chrome, compliance scaffolding
- [ ] **Phase 2: Overview Surface** — Verdict page (plain-English claim, whole-% score, 4-axis breakdown, disclaimer + methodology)
- [ ] **Phase 3: Live Surface** — YouTube-embedded earnings-call viewer with claim rail and per-card credibility streaming
- [ ] **Phase 4: Depth Swipe Flow** — `/depth/[claimId]` stepwise A → B → C → D with force-directed stakeholder graph
- [ ] **Phase 5: Polish & Launch Gate** — A11y, bundle budget, visual regression, mobile-survival, legal sign-off

## Phase Details

### Phase 1: Foundation
**Goal**: The chassis everything else plugs into — design tokens, typed API contract, mock backend, streaming primitive, global top-bar stepper, compliance scaffolding — all landed before a single feature surface is built.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, API-01, API-02, API-03, API-04, API-05, API-06, STR-01, STR-02, STR-03, STR-04, STR-05, STR-06, CHR-01, CHR-02, CHR-03, CHR-04, CHR-05, CMP-01, CMP-02, CMP-03
**Success Criteria** (what must be TRUE):
  1. Every route in the app renders inside a viewport-contained shell (no whole-page scroll; `h-dvh overflow-hidden` at root) with dark/light toggle switching both themes completely with no FOUC.
  2. The global top-bar stepper is visible on every route, shows `Live → Depth → Overview` for video entries and `Depth → Overview` (with "Live" hidden/disabled) for article entries, reflects the active stage, and presents the "Generate Overview?" confirmation when leaving Live.
  3. A developer can hit `/api/claims/[videoId]`, `/api/verdict/[claimId]`, `/api/depth/[claimId]`, and the streaming run endpoint, append `?mock=success|empty|partial|slow|error`, and observe each variant render a distinguishable UI state validated by Zod at the boundary.
  4. A test harness page can call `useRunStream` against a mocked SSE run and see typed `data-progress` / `data-claim` / `data-verdict` events arrive, cancel-on-abort works after 3s, elapsed-time appears after 5s, and the stream survives a tab `visibilitychange` round-trip without progress moving backward.
  5. Sharp edges (`--radius: 0`), the constrained 3–4-size type scale, and the chosen Bloomberg-terminal typeface are encoded as tokens; an ESLint rule fails the build on raw hex/rgb in component files; the methodology stub page is reachable and non-empty; the banned-verb copy list is enforced and scores are wired to attach to claims, never to people.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Overview Surface
**Goal**: The simplest, most restrained surface — a trustworthy verdict page — validates the entire schema → fixture → RSC → UI pipeline end-to-end and produces the components reused in Live card expansions downstream.
**Depends on**: Phase 1
**Requirements**: VER-01, VER-02, VER-03, VER-04, VER-05, VER-06, VER-07, VER-08, VER-09, VER-10, VER-11
**Success Criteria** (what must be TRUE):
  1. Navigating to `/overview/[claimId]` renders a viewport-contained page showing the plain-English claim restatement, a whole-number percentage (never a decimal) paired with a verdict band label (Likely to deliver / Mixed signals / Unlikely to deliver / Insufficient history), and a "Based on N signals" confidence qualifier.
  2. The 4-axis score breakdown (Transparency / Accuracy / Consistency / Industry state) renders as four distinct nutrition-label-style tiles, each with its own score, alongside a single historical-delivery headline stat (e.g., "Delivered 11 of 18 past claims") and a last-analyzed timestamp.
  3. A persistent non-dismissible "Not investment advice" disclaimer and a visible methodology link are present on the page; clicking methodology opens the stub page explaining the 4-axis scoring, sample sources, freshness, and limitations.
  4. The Overview surface is reachable by completing Depth Step D *and* by confirming "Generate Overview?" from Live (wired, even if the originating surfaces are not yet built — the route accepts entry from either).
**Plans**: TBD
**UI hint**: yes

### Phase 3: Live Surface
**Goal**: Users can watch an earnings-call video and see short summarized claims stream into a side rail with per-card credibility signals — calm, dense, no red/green flashing, no whole-page scroll.
**Depends on**: Phase 1, Phase 2
**Requirements**: LIV-01, LIV-02, LIV-03, LIV-04, LIV-05, LIV-06, LIV-07, LIV-08, LIV-09, LIV-10
**Success Criteria** (what must be TRUE):
  1. On `/watch/[videoId]` a muted-autoplay YouTube embed plays via `react-player` against `youtube-nocookie.com` with `playsinline`; the transcript panel shows only the current line and the previous line as a 2-line rolling window with no scroll.
  2. The claim rail lists short summarized claims (not verbatim quotes), scrolls internally while the page does not, and as video time crosses a claim's activation window (~±2s, polled at ~4Hz, paused on tab hide) the matching card activates.
  3. Clicking a claim card expands it in place to reveal the verbatim quote, speaker attribution, a live credibility check that streams Extracting → Checking past → Scored with muted visuals, and an inline comparison against the closest matching past claim with its delivery outcome.
  4. The "Run depth analysis" action on an expanded claim navigates to `/depth/[claimId]?step=A` and the top-bar stepper shows "Live" as the active stage; YouTube error codes 2/5/100/101/150 surface as human-readable fallback states rather than a broken embed.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Depth Swipe Flow
**Goal**: Users can walk left-to-right through a guided four-step analysis of a single claim — Background → Past+Present split → Future stakeholder graph → Overview hand-off — with substep telemetry streaming into whichever step is active and persistent back-nav.
**Depends on**: Phase 1, Phase 2, Phase 3
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, DEP-06, DEP-07, DEP-08, DEP-09, DEP-10, DEP-11, DEP-12, DEP-13, DEP-14, DEP-15
**Success Criteria** (what must be TRUE):
  1. `/depth/[claimId]` is a single viewport-contained route whose step is driven by `?step=A|B|C|D`; Step A renders full-screen company background, transitioning to Step B swipes A left and presents a 50/50 split (Left: 5-year claim-vs-delivery table with CEO split from company claims and evidence links; Right: 2–3 headline financial/industry numbers with plain-English explainers and 3–5 peer comparisons), and Step D is a "Generate Overview" confirmation that hands off to `/overview/[claimId]`.
  2. Step C renders a `react-force-graph-2d` canvas with 30–50 stakeholder nodes using a deterministic seed, frozen positions after initial settle, per-node persona tooltips, a side-panel detail on node click, and edge weight visualized as opacity/thickness; a table fallback is available for keyboard/screen-reader users and `prefers-reduced-motion` skips the simulation.
  3. Users can navigate between steps via persistent left/right arrow affordances on screen edges *and* keyboard arrow keys, with motion-based horizontal swipe transitions, and can return to any prior step at any time.
  4. While a step is active, real server-sent substep telemetry (e.g., "Matched 14/18 past claims", "Scraping 2022 Q3 call") streams into that step's panel via the `useRunStream` hook — never client-simulated — and inline `[1][2]` citation markers resolve to a shared citations pane for that step.
  5. Entry from an article URL surfaces THE extracted claim directly into Depth; entry from a video surfaces the claim list, user clicks Analyze, and lands on `?step=A` for the chosen claim.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Polish & Launch Gate
**Goal**: The app is demonstrably shippable — accessibility clean, bundle within budget, visuals regression-covered across themes, mobile not-broken, and the disclaimer copy has legal sign-off blocking launch.
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4
**Requirements**: QUA-01, QUA-02, QUA-03, QUA-04, QUA-05, QUA-06, CMP-04
**Success Criteria** (what must be TRUE):
  1. Axe-core automated scans come back clean on all four routes (Live, Depth, Overview, methodology stub) and a keyboard-only user can complete core flows on Live (rail → expand → run depth) and Depth (step arrows → graph node selection via table fallback).
  2. CI enforces a per-route first-load JavaScript budget under 250KB and fails on regressions; the app renders without layout breakage at 375px width even though it is not optimized for mobile.
  3. Visual regression coverage (e.g., Chromatic/Percy) passes on dark and light across all four routes, and Storybook (or equivalent) has stories for the error / empty / partial / slow fixture variants of every streaming or data-bound component.
  4. The legal-review gate on disclaimer copy is closed with documented sign-off before launch is authorized, and a written swap-to-real-backend runbook describes toggling the adapter from `FixtureAdapter` to `HttpAdapter` with zero component changes.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Overview Surface | 0/? | Not started | - |
| 3. Live Surface | 0/? | Not started | - |
| 4. Depth Swipe Flow | 0/? | Not started | - |
| 5. Polish & Launch Gate | 0/? | Not started | - |

## Coverage

- **v1 requirements mapped:** 69/69
- **Orphans:** 0
- **Duplicates:** 0

Note: REQUIREMENTS.md header states "74 total" — actual REQ-ID count is 69 (FND 6 + API 6 + STR 6 + CHR 5 + LIV 10 + DEP 15 + VER 11 + CMP 4 + QUA 6). The "74" figure appears to be an off-by-count in the requirements header and will be corrected during traceability update.

## Phase Ordering Rationale

- **Foundation first** — tokens, API contract, streaming hook, and stepper chrome are cross-cutting; shipping a surface before these forces rewrites.
- **Overview before Live** — Overview is pure RSC and the simplest surface; shipping it first validates the schema → fixture → RSC → UI pipeline end-to-end and produces reusable score/verdict components Live expansions consume.
- **Live before Depth** — Live depends on the streaming hook (Phase 1) and Overview components (Phase 2), and its "Run depth analysis" action is the primary Depth entry point from video.
- **Depth includes Step C (graph)** — under coarse granularity the force-graph is built inside the Depth phase rather than isolated; it is the highest-risk module within that phase.
- **Polish + legal gate last** — a11y, bundle, visual-regression, and disclaimer sign-off are meaningful only against the full surface set.

---
*Roadmap created: 2026-04-19*
