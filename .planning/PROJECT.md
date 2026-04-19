# Can U Deliver

## What This Is

A retail-investor web app that scores whether a company will actually deliver on claims made in earnings calls and press articles. Users arrive via a Chrome extension (assumed working) that redirects from a YouTube video or article URL; the app extracts the claim, analyzes past delivery, current signals, and future stakeholder dynamics, and returns a clear credibility verdict. Built for non-technical, non-finance retail investors who want a serious-looking tool that doesn't drown them in dashboards.

## Core Value

Give ordinary investors a credible, non-overwhelming verdict — *can this company deliver this claim?* — backed by visible reasoning they can trust.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Surface 1 — Earnings Call Live Checker (minimalist)**
- [ ] Large embedded YouTube player as the focal point
- [ ] Side rail of "key claim" cards populated as the call progresses
- [ ] Each claim card shows a live credibility check (streaming/partial states)
- [ ] "Run depth analysis" action on any claim → launches Surface 2
- [ ] Calm, quiet UI — user will be watching for extended periods

**Surface 2 — Depth Claim Checker (maximalist modular dashboard)**
- [ ] Past module: 5-year history of company claims + CEO personal claims, each matched against delivery outcome
- [ ] Present module: current claim, company financials, industry signals, competitor context
- [ ] Future module: Mirrorfish-style AI agent network — force-directed graph of stakeholder nodes (competitors, partners, execs, regulators) simulating reactions and outcomes
- [ ] Modules are visually modular (swappable / resizable tiles feel)
- [ ] Entry from article URL OR from "depth" action on a video claim

**Surface 3 — Progress UI (both patterns)**
- [ ] Inline/overlaid progress inside Surface 1 claim cards (short form, streaming states)
- [ ] Full dedicated progress screen for Surface 2 runs — 3-step pipeline: Past delivery → Present state → Future simulation — with granular substeps (e.g., "scraping claim from 2022 Q3 call", "matched 14/18 past claims")
- [ ] Transitions cleanly into Surface 2 or Surface 4 when done

**Surface 4 — Verdict Overview (minimalist)**
- [ ] Shown after closing video or when depth analysis completes
- [ ] Headline: core claim in plain English
- [ ] Credibility: **percentage + verdict label** (e.g., "72% — Likely to deliver")
- [ ] Score breakdown: Transparency / Accuracy / Consistency / Industry state
- [ ] Historical delivery rate (headline stat)
- [ ] Deliberately under-stated — no 20 dashboards, no vibe-coded metrics

**Cross-cutting design**
- [ ] Dark mode and light mode
- [ ] Muted warm color palette
- [ ] Modern sans-serif typography
- [ ] Clear visual language differentiating **analysis/progress modules** (maximalist) from **high-level insight modules** (minimalist) — via color, density, and type scale
- [ ] Modular dashboard feel throughout

**Technical foundation**
- [ ] Next.js App Router + TypeScript + Tailwind + shadcn/ui
- [ ] Typed API client hitting mocked endpoints (Next route handlers or MSW), swap to real backend later
- [ ] Streaming-capable UI patterns (progress, claim cards, score breakdown)
- [ ] Deployable on Vercel

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Chrome extension build — user says "assume it works"; web app is the scope
- Real AI/backend analysis pipeline — frontend consumes a mocked API layer; real backend is a downstream integration
- Authentication / user accounts — not mentioned; verdict flow is per-URL, assume anonymous for v1
- Portfolio tracking / saved verdicts history — out of scope until after MVP validates demand
- Mobile-first layouts — desktop-first given the dashboard density; must not break on mobile but not optimized
- Financial advice language / disclaimers — will need legal review later, stub-only for MVP

## Context

- **Audience:** non-technical, non-finance retail investors. They want something that *looks serious* but doesn't assume finance literacy.
- **UX thesis:** users distrust "vibe-coded index metrics" and 20-dashboard overloads. Clarity and restraint beat information density for the final verdict. Analysis surfaces can be dense *because they're opt-in* (depth view).
- **Two contrasting UX registers:** the live earnings-call view and verdict page are *quiet*; the depth dashboard and progress screen are *rich*. The system's visual language must make this duality intentional, not accidental.
- **Mirrorfish reference:** user pointed to Mirrorfish as the mental model for the future-simulation module — an AI agent network where each node is a stakeholder with a persona informed by past behavior. Force-directed graph was the chosen visual.
- **Credibility score:** user wants a hard-coded math component (not a pure AI score) with a visible breakdown — Transparency / Accuracy / Consistency / Industry state. Breakdown is a first-class UI element, not a hidden detail.
- **Data assumed available from backend (mocked for now):** extracted claim text, historical claim-vs-delivery pairs (company + CEO), current financials, competitor context, industry trend signals, stakeholder persona graph, agent simulation outcomes.
- **Directory name:** `canudeliver` — product name "Can U Deliver" / "Can U Deliver?".

## Constraints

- **Tech stack**: Next.js App Router + TypeScript + Tailwind + shadcn/ui — chosen for speed + Vercel-native deploy + design-system flexibility.
- **Backend integration**: mocked API layer (typed client, fixtures via route handlers or MSW) — real backend does not yet exist / is separate track. All data shapes must be defined as if a real API will swap in.
- **Design register**: must clearly differentiate minimalist surfaces (live checker, verdict) from maximalist surfaces (depth dashboard, progress) via color, type, and density — cross-cutting constraint on every component.
- **Theming**: dark + light mode, muted warm palette, modern sans-serif — non-negotiable.
- **Audience literacy**: copy and data visualization must be readable by non-finance retail investors. No jargon without explanation.
- **Platform**: desktop-first; must not break on mobile but optimization is deferred.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scope: MVP for real users (not demo) | User wants production-grade frontend, not a throwaway clickable prototype | — Pending |
| Backend: mock API layer (typed client + fixtures) | Real backend is separate track; typed layer lets us swap in later without rewriting UI | — Pending |
| Stack: Next.js + Tailwind + shadcn | Speed, Vercel-native, design-system flexibility, user confirmed | — Pending |
| Progress UX: both inline and dedicated screen | Live earnings view needs short-form progress in cards; depth analysis needs its own explanatory screen | — Pending |
| Credibility score format: percentage + verdict + 4-part breakdown | Non-technical readers understand %, verdict label frames it, breakdown surfaces transparency | — Pending |
| Stakeholder network viz: force-directed graph | User chose — feels alive, matches Mirrorfish reference; likely react-flow or d3-force | — Pending |
| Four distinct surfaces (live / depth / progress / verdict) | Mirrors the user's stated mental model; each has a clear job and register | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-19 after initialization*
