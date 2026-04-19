# CREDIBILI

A retail-investor web app that scores whether a company will actually deliver
on claims made in earnings calls and press articles. Bloomberg-terminal register,
real Claude API backend.

## Quickstart

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — you'll be redirected to `/live`.

## Routes

- `/live` — Live Mode. YouTube earnings call + streaming claim list + credibility score.
- `/depth` — Depth Mode. 2x2 WIP analysis grid (Background / Past / Present / Future) → Overview with verdict.

## Architecture notes

- **Backend with Claude API.** A FastAPI backend in `backend/` calls the
  Claude API (Anthropic) to generate real credibility scores, claim analysis, and
  feed lines. Run it with `pnpm dev:backend` (requires `ANTHROPIC_API_KEY` in
  `backend/.env`). The Next route handlers at `/api/live-stream` and
  `/api/depth-stream` proxy to this backend.
- **Streaming.** AI SDK v6 `createUIMessageStream` with typed `data-claim` /
  `data-feed-line` / `data-score` parts. The client (`useChat<AppUIMessage>`
  + `DefaultChatTransport`) is unchanged whether the backend is live or mocked.
- **State.** Zustand for global UI (selected claim, panel completion, depth view,
  final score). `useChat` owns streaming state.
- **Stack.** Next 16.2 App Router + React 19.2 + Tailwind v4 (CSS-first @theme,
  OKLCH muted-warm palette) + shadcn/ui + JetBrains Mono. Python 3 FastAPI backend.
- **Constraints honored.** Sharp edges everywhere (`--radius: 0` + global
  `border-radius: 0 !important` override). No whole-page scroll —
  `html, body { overflow: hidden }`; scroll lives only inside panels.
- **Hardcoded MVP values.** `DEFAULT_VIDEO_ID = "dQw4w9WgXcQ"` (placeholder),
  `DEFAULT_COMPANY = Acme Robotics (ACME)`, `DEFAULT_CLAIM` is the Q4 2026 margin claim.

## Run

```bash
# Terminal 1 — frontend + backend together
pnpm dev:all

# Or separately:
pnpm dev           # Next.js frontend
pnpm dev:backend   # FastAPI backend (requires backend/.env with ANTHROPIC_API_KEY)
```

The backend must be running for real Claude-powered scores. Without it, the
Next route handlers fall back to fixture data.
