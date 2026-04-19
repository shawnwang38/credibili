# Requirements: Can U Deliver

**Defined:** 2026-04-19
**Core Value:** Give ordinary investors a credible, non-overwhelming verdict — *can this company deliver this claim?* — backed by visible reasoning they can trust.

## v1 Requirements

### Foundation

- [ ] **FND-01**: Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui v4 project initialized and deployable on Vercel
- [ ] **FND-02**: Dark and light mode toggle via `next-themes`; both themes complete across all surfaces with no FOUC
- [ ] **FND-03**: Muted warm OKLCH palette encoded as CSS variables; `--radius: 0` sharp-edge override applied globally (no rounded corners on cards, panels, buttons, inputs)
- [ ] **FND-04**: Constrained type scale (3–4 sizes total: body / label / heading-or-number / micro) encoded as design tokens; Bloomberg-terminal-inspired typeface selected and loaded (mono or mono-flavored sans — final pick from IBM Plex, JetBrains Mono + Inter, Berkeley Mono)
- [ ] **FND-05**: Viewport-contained root layout (`h-dvh overflow-hidden`) — no whole-page scroll anywhere; scroll permitted only inside individual modules/panels
- [ ] **FND-06**: ESLint rule banning raw hex/rgb in component files (enforce tokens only)

### API Layer (Mocked Backend)

- [ ] **API-01**: Zod schemas for Claim, Verdict, DepthRun, Stakeholder, SubstepEvent as single source of truth
- [ ] **API-02**: Typed API client with adapter pattern (`FixtureAdapter` | `HttpAdapter`) selectable via env var — real backend swap requires zero component changes
- [ ] **API-03**: Next route handlers backing `/api/claims/[videoId]`, `/api/verdict/[claimId]`, `/api/depth/[claimId]`, streaming `/api/runs/[runId]/stream`
- [ ] **API-04**: Each endpoint supports `?mock=success|empty|partial|slow|error` variants for exhaustive state coverage
- [ ] **API-05**: `Result<T, E>` return type; errors surface distinguishably in the UI
- [ ] **API-06**: Realistic fixture data — 20+ sample claims across 3+ companies, 5-year past-claim history, 30–50 stakeholder nodes, substep message catalog

### Streaming Primitive

- [ ] **STR-01**: `useRunStream` hook built on Vercel AI SDK v5 typed `UIMessage` data parts over SSE-on-POST
- [ ] **STR-02**: Streams typed `data-progress`, `data-claim`, `data-verdict` events; consumers parse by type
- [ ] **STR-03**: Hook supports cancel/abort via AbortController; cancel button appears after 3 seconds of activity
- [ ] **STR-04**: Hook pauses/resumes on `visibilitychange`; recovers gracefully from tab-throttling
- [ ] **STR-05**: Substeps stream real server-sent text (never client-simulated); elapsed time shown after 5 seconds
- [ ] **STR-06**: Progress never moves backward and never stalls for more than N seconds without a substep update

### Global Chrome

- [ ] **CHR-01**: Top-bar stepper component rendered on every route
- [ ] **CHR-02**: Video entry shows stages `Live → Depth → Overview`; article entry shows `Depth → Overview` with "Live" stage hidden or rendered disabled
- [ ] **CHR-03**: Stepper reflects current route as the active stage
- [ ] **CHR-04**: Transitioning from Live → Overview prompts a "Generate Overview?" confirmation; confirming ends live tracking and navigates to Overview
- [ ] **CHR-05**: Persistent non-dismissible disclaimer on every verdict-adjacent surface (Live, Depth, Overview); methodology link always visible

### Live Earnings-Call Surface

- [ ] **LIV-01**: Route `/watch/[videoId]` embeds YouTube via `react-player` v3 with muted autoplay + `playsinline` + `youtube-nocookie.com`
- [ ] **LIV-02**: Transcript panel shows only the current line and the previous line (2-line rolling window); does not scroll
- [ ] **LIV-03**: Claim rail on the side lists key claims as short summarized cards (summary text, not verbatim quote); rail scrolls internally, page does not
- [ ] **LIV-04**: Clicking a claim card expands it in place (or opens a side panel) to reveal the verbatim quote, speaker attribution, and live credibility check
- [ ] **LIV-05**: Per-card streaming state machine: Extracting → Checking past → Scored (muted visuals, no red/green flashing)
- [ ] **LIV-06**: Each expanded card shows inline comparison with the closest matching past claim and its delivery outcome
- [ ] **LIV-07**: "Run depth analysis" action on any expanded claim navigates to `/depth/[claimId]?step=A`
- [ ] **LIV-08**: Timestamp sync between player time and claim activation uses visibility-gated polling (~4Hz), ±2s activation window, pauses when tab is hidden
- [ ] **LIV-09**: Handles YouTube `onError` codes 2/5/100/101/150 with human-readable fallback states
- [ ] **LIV-10**: Entire Live route is viewport-contained (no whole-page scroll)

### Depth Analysis Surface (Stepwise Swipe Flow)

- [ ] **DEP-01**: Single route `/depth/[claimId]` with step state via `?step=A|B|C|D`
- [ ] **DEP-02**: Entry from article surfaces THE extracted claim; entry from video surfaces the list of claims to pick from, then user clicks Analyze on one
- [ ] **DEP-03**: Step A (Company Background) renders full-screen: company profile, sector, context research relevant to the claim
- [ ] **DEP-04**: Transitioning to Step B swipes Step A left and splits the screen 50/50
- [ ] **DEP-05**: Step B Left — Past module: claim-vs-delivery table covering 5 years, with CEO personal claims split from company claims; each row links to evidence
- [ ] **DEP-06**: Step B Right — Present module: current financials, industry signals, competitor context — 2–3 headline numbers with one-line plain-English explainers and 3–5 peer comparisons
- [ ] **DEP-07**: Transitioning to Step C swipes B left; Step C renders full-screen future AI-network analysis
- [ ] **DEP-08**: Step C stakeholder force-directed graph uses `react-force-graph-2d` canvas; 30–50 nodes; deterministic seed; frozen positions after settle; per-node persona tooltip; side-panel detail on node click; edge weight visualized as opacity/thickness
- [ ] **DEP-09**: Step C graph has a table fallback for accessibility; `prefers-reduced-motion` disables simulation
- [ ] **DEP-10**: Persistent left/right arrow affordances on the screen edges; keyboard arrow keys also navigate; user can go back to any prior step
- [ ] **DEP-11**: Motion-based horizontal swipe transitions between steps
- [ ] **DEP-12**: Substep telemetry streams into the currently active step panel (real text like "Matched 14/18 past claims"), consuming the `useRunStream` hook
- [ ] **DEP-13**: Step D is the "Generate Overview" hand-off — user confirms and navigates to `/overview/[claimId]`
- [ ] **DEP-14**: Entire Depth route is viewport-contained; each step panel may scroll internally if needed
- [ ] **DEP-15**: Citation/source markers (`[1][2]`) inline in panel text; shared citations pane per step

### Overview / Verdict Surface

- [ ] **VER-01**: Route `/overview/[claimId]` — mostly RSC
- [ ] **VER-02**: Plain-English restatement of the core claim at the top
- [ ] **VER-03**: Credibility score displayed as a **whole-number percentage** (never a decimal) paired with a verdict band label (recommended bands: "Likely to deliver" / "Mixed signals" / "Unlikely to deliver" / "Insufficient history")
- [ ] **VER-04**: 4-axis score breakdown as distinct tiles: Transparency / Accuracy / Consistency / Industry state — each with its own score
- [ ] **VER-05**: Historical delivery rate shown as a single headline stat (e.g., "Delivered 11 of 18 past claims")
- [ ] **VER-06**: "Based on N signals" confidence qualifier next to the score
- [ ] **VER-07**: Last-analyzed timestamp shown
- [ ] **VER-08**: Methodology link visible; clicking opens a methodology stub page explaining how scores are computed
- [ ] **VER-09**: Persistent non-dismissible disclaimer: "Not investment advice" (or equivalent copy meeting legal guidance)
- [ ] **VER-10**: Entire Overview route is viewport-contained; deliberately restrained — no extra dashboards or metrics beyond what's listed
- [ ] **VER-11**: Overview surface reachable via (a) confirming "Generate Overview?" from Live, (b) completing Depth Step D

### Copy / Compliance

- [ ] **CMP-01**: Copy audit — banned verbs list enforced across the app: no "buy," "invest," "profit," "opportunity," or comparable advice language
- [ ] **CMP-02**: Scores attach to claims, never to people — CEO past claims shown as evidence only, not scored independently in the user-facing score
- [ ] **CMP-03**: Methodology stub page shipped in v1 (not a dead link) — explains the 4-axis scoring, sample sources, data freshness, limitations
- [ ] **CMP-04**: Legal-review gate scheduled before launch; disclaimer copy must be reviewed and signed off

### Quality / Polish

- [ ] **QUA-01**: Axe-core automated accessibility scan clean on all four routes
- [ ] **QUA-02**: Keyboard-complete navigation on Live (claim rail, expand, run depth) and Depth (step arrows, graph node selection via table fallback)
- [ ] **QUA-03**: Bundle-size budget under 250KB per-route first-load (CI-enforced)
- [ ] **QUA-04**: Visual regression coverage on dark + light across all four routes
- [ ] **QUA-05**: Must not break on mobile (layout survives at 375px width even if not optimized)
- [ ] **QUA-06**: Storybook or equivalent coverage for error / empty / partial / slow fixture variants on every streaming or data-bound component

## v2 Requirements

Deferred to future release.

### Auth / History

- **AUTH-V2-01**: User authentication (email/password or OAuth)
- **AUTH-V2-02**: Saved verdict history
- **AUTH-V2-03**: Portfolio tracking — link verdicts to user's watched companies

### Advanced Analysis

- **ADV-V2-01**: Animated stakeholder-reaction replay on Step C graph
- **ADV-V2-02**: Intermediate partial-results streaming within a single Depth step
- **ADV-V2-03**: PDF / CSV export of verdict + analysis

### Distribution

- **DIS-V2-01**: Copy/share-link affordance on Overview
- **DIS-V2-02**: Mobile-optimized responsive layouts
- **DIS-V2-03**: Resizable/swappable tile composition in Depth (beyond the guided swipe flow)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Chrome extension build | User assumes it works — web app is the scope |
| Real AI/backend analysis pipeline | Backend is mocked; real pipeline is a separate track |
| Live stock ticker | Anti-feature — signals finance-bro aesthetic the user rejects |
| User-draggable tile layouts | Contradicts the guided swipe flow; Depth is linear by design |
| Radar / spider / gauge visualizations | Fake-precision anti-pattern; nutrition-label tiles only |
| Red/green flashing indicators | Noisy; violates calm-register intent on Live |
| AI chat on Depth | Conflicts with the stepwise narrative |
| 20+ financial-ratio tiles | Explicit user rejection of "vibe-coded metrics" overload |
| Share-to-Twitter | Not v1 priority; privacy surface-area |
| Sentiment word clouds | Low-signal anti-feature |
| Credibility-trend line charts | Implies more history than we have |
| Mobile-optimized layouts | Desktop-first; must not break on mobile but not optimized |
| Investment advice language | Regulatory risk — explicitly banned by copy audit |

## Traceability

Populated 2026-04-19 by roadmapper.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| API-01 | Phase 1 | Pending |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| API-04 | Phase 1 | Pending |
| API-05 | Phase 1 | Pending |
| API-06 | Phase 1 | Pending |
| STR-01 | Phase 1 | Pending |
| STR-02 | Phase 1 | Pending |
| STR-03 | Phase 1 | Pending |
| STR-04 | Phase 1 | Pending |
| STR-05 | Phase 1 | Pending |
| STR-06 | Phase 1 | Pending |
| CHR-01 | Phase 1 | Pending |
| CHR-02 | Phase 1 | Pending |
| CHR-03 | Phase 1 | Pending |
| CHR-04 | Phase 1 | Pending |
| CHR-05 | Phase 1 | Pending |
| CMP-01 | Phase 1 | Pending |
| CMP-02 | Phase 1 | Pending |
| CMP-03 | Phase 1 | Pending |
| VER-01 | Phase 2 | Pending |
| VER-02 | Phase 2 | Pending |
| VER-03 | Phase 2 | Pending |
| VER-04 | Phase 2 | Pending |
| VER-05 | Phase 2 | Pending |
| VER-06 | Phase 2 | Pending |
| VER-07 | Phase 2 | Pending |
| VER-08 | Phase 2 | Pending |
| VER-09 | Phase 2 | Pending |
| VER-10 | Phase 2 | Pending |
| VER-11 | Phase 2 | Pending |
| LIV-01 | Phase 3 | Pending |
| LIV-02 | Phase 3 | Pending |
| LIV-03 | Phase 3 | Pending |
| LIV-04 | Phase 3 | Pending |
| LIV-05 | Phase 3 | Pending |
| LIV-06 | Phase 3 | Pending |
| LIV-07 | Phase 3 | Pending |
| LIV-08 | Phase 3 | Pending |
| LIV-09 | Phase 3 | Pending |
| LIV-10 | Phase 3 | Pending |
| DEP-01 | Phase 4 | Pending |
| DEP-02 | Phase 4 | Pending |
| DEP-03 | Phase 4 | Pending |
| DEP-04 | Phase 4 | Pending |
| DEP-05 | Phase 4 | Pending |
| DEP-06 | Phase 4 | Pending |
| DEP-07 | Phase 4 | Pending |
| DEP-08 | Phase 4 | Pending |
| DEP-09 | Phase 4 | Pending |
| DEP-10 | Phase 4 | Pending |
| DEP-11 | Phase 4 | Pending |
| DEP-12 | Phase 4 | Pending |
| DEP-13 | Phase 4 | Pending |
| DEP-14 | Phase 4 | Pending |
| DEP-15 | Phase 4 | Pending |
| QUA-01 | Phase 5 | Pending |
| QUA-02 | Phase 5 | Pending |
| QUA-03 | Phase 5 | Pending |
| QUA-04 | Phase 5 | Pending |
| QUA-05 | Phase 5 | Pending |
| QUA-06 | Phase 5 | Pending |
| CMP-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 69 total (note: previous header of 74 was an off-by-count — actual REQ-IDs total 69)
- Mapped to phases: 69
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 — traceability populated by roadmapper*
