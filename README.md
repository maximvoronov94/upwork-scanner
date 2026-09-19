# Upwork Scanner

Max's personal Upwork opportunity scanner. A private, single-user tool — no
accounts, no billing, no multi-tenant anything. It reads a full job post,
semantically compares it against Max's real profile, computes a deterministic
score, classifies the job, and drafts a proposal.

## Requirements

- Node.js 20+
- PostgreSQL 14+ (local or hosted)
- [Ollama](https://ollama.com) running locally (default, free, no API key) —
  or an Anthropic/OpenAI API key if you'd rather use a paid provider

## Installation

```bash
npm install
```

## Ollama setup (default, fully local, no paid API)

This app defaults to a local [Ollama](https://ollama.com) model, so it works
with zero API keys and zero billing.

1. Install Ollama:

   ```bash
   brew install ollama
   ```

   (or download the installer from https://ollama.com/download)

2. Start the Ollama server:

   ```bash
   ollama serve
   ```

   Leave this running in its own terminal (or install it as a background
   service per Ollama's docs).

3. Pull the default model:

   ```bash
   ollama pull qwen2.5-coder:7b
   ```

4. Verify it's reachable:

   ```bash
   curl http://localhost:11434/api/tags
   ```

With `AI_PROVIDER=ollama` (the default), job analysis and proposal
generation run entirely on your machine — nothing is sent to Anthropic,
OpenAI, or any other third party. Once the app is running, you can confirm
the model is ready from `GET /api/health/ai`.

Anthropic and OpenAI remain fully supported as optional providers (see
"How to configure Claude/OpenAI/Ollama" below) if you want to switch to a
paid model later — that code is untouched, just not required.

## PostgreSQL setup

Create a local database:

```bash
createdb upwork_scanner
```

Or use any hosted Postgres (Supabase, Neon, Railway, etc.) — just set
`DATABASE_URL` accordingly.

## Environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=postgresql://user:password@localhost:5432/upwork_scanner?schema=public

AI_PROVIDER=ollama            # or "anthropic" / "openai"

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b
OLLAMA_TIMEOUT_MS=120000

ANTHROPIC_API_KEY=            # only needed if AI_PROVIDER=anthropic
OPENAI_API_KEY=               # only needed if AI_PROVIDER=openai

TELEGRAM_BOT_TOKEN=          # optional
TELEGRAM_CHAT_ID=            # optional

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

With the default `AI_PROVIDER=ollama`, no API key is required at all. AI
keys (when used) are read server-side only and are never sent to the client.

## Prisma migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

`migrate dev` creates the database schema (`Job`, `AppSettings`) and generates
the client. Re-run `npx prisma generate` any time `prisma/schema.prisma`
changes.

## Running the development server

```bash
npm run dev
```

Open http://localhost:3000.

## How manual analysis works

1. Click "Analyze Job" on the dashboard.
2. Paste the job title and full description (required). Optionally fill in
   URL, budget, skills, posted date, proposal count, client info, and
   location requirements.
3. Press ANALYZE.
4. The server saves the job, sends the full title + description + Max's
   profile to the configured AI provider, and asks it to judge — not
   keyword-match — whether Max can realistically do the work.
5. Deterministic scoring (see below) computes the final Opportunity Score and
   status. A proposal is generated automatically for APPLY_NOW and HIDDEN
   jobs.
6. Everything is persisted in PostgreSQL and shown immediately.

Importing the same `externalId`/`url` again updates the existing job instead
of duplicating it, and only re-runs the (paid) AI analysis if the title or
description actually changed — tracked via a content hash.

## How scoring works

The AI never sets the final score. It only returns `technicalMatch`,
`portfolioMatch`, and qualitative judgement (reasons, missing skills, risks,
hard blockers). Everything else is deterministic, in
`src/lib/jobs/scoring.ts`:

- **Freshness** — steps down from 100 (0–15 min old) to 5 (480+ min).
- **Competition** — steps down from 100 (<5 proposals) to 0 (50+), using the
  midpoint of Upwork's proposal ranges ("5 to 10", "50+", etc.) when an exact
  count isn't known. Unknown proposal counts get a neutral score, never zero.
- **Client score** — payment verification, rating, spend, hire history.
- **Location score** — 0 if the client has excluded Max's location, else 100.

The final **Opportunity Score** is a weighted blend:

```
technicalMatch   40%
competitionScore 20%
freshnessScore   15%
portfolioMatch   10%
clientScore      10%
locationScore    5%
```

Classification (`src/lib/jobs/classifier.ts`) then applies the thresholds
from Settings to assign `APPLY_NOW`, `HIDDEN`, `MAYBE`, or `SKIP`. All
thresholds are editable from the Settings page and stored in `AppSettings`.

## How to edit Max's profile

Edit `src/data/max-profile.json` directly — skills, projects, portfolio URL,
and `weakOrUnverified` list. No rebuild step needed beyond a normal restart;
Next.js will pick up the change. The AI prompt is built from this file every
time, so keep it accurate — the AI is explicitly instructed never to claim
experience that isn't listed here.

## How to configure Claude/OpenAI/Ollama

Set `AI_PROVIDER` to `anthropic`, `openai`, or `ollama` in `.env`, or change
it from the Settings page (persisted in `AppSettings.aiProvider`, but the
actual API calls still read `AI_PROVIDER` from the environment — update both
if you switch providers permanently). Provide the matching API key
(`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`).

For `ollama`, no API key is needed — instead run a local Ollama server
yourself:

```bash
ollama serve
ollama pull qwen2.5-coder:7b
```

and set `OLLAMA_BASE_URL` (default `http://localhost:11434`),
`OLLAMA_MODEL` (default `qwen2.5-coder:7b`), and `OLLAMA_TIMEOUT_MS`
(default `120000`) in `.env`. This is the default, fully free/local path —
nothing is sent to a third party, no billing, no API key. Analysis quality
is weaker than Claude/GPT but requires no paid account at all.

Check `GET /api/health/ai` any time to confirm the active provider is
actually usable — for Ollama it verifies the server is reachable and the
model is pulled; for Anthropic/OpenAI it just checks the API key is set.

Ollama analysis calls use Ollama's `/api/chat` endpoint with
`format: "json"` to bias toward valid JSON, and all providers get the same
strict Zod validation (`src/lib/ai/schemas.ts`). If a response fails to
parse or validate, the app retries once with a repair prompt that hands the
model its own invalid output and asks it to fix it — it does not just blindly
resend the original prompt. Ollama requests also have a hard timeout
(`OLLAMA_TIMEOUT_MS`) and raise a clear, specific error — distinguishing
"Ollama isn't running" from "the request timed out" from "the model isn't
pulled" — instead of a generic network failure.

The provider abstraction lives in `src/lib/ai/provider.ts`, with
implementation-specific code in `anthropic.ts`, `openai.ts`, and `ollama.ts`.
All three are swappable behind the same interface; Anthropic/OpenAI are kept
fully working and available for later, they're just not required.

## How Telegram works

Telegram notifications are optional and never block the app if unset. Set
`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`, and enable
`telegramEnabled` in Settings. `src/lib/telegram.ts` exposes
`notifyJobOpportunity()`, intended to fire whenever a new `APPLY_NOW` or
`HIDDEN` job is discovered by a future automatic scanner. Missing env vars
simply make notification calls a no-op.

## Future scanner integration

Automatic Upwork collection is intentionally not built yet. The app depends
only on the `JobSource` interface (`src/lib/sources/job-source.ts`):

```ts
interface JobSource {
  fetchJobs(): Promise<NormalizedJob[]>;
}
```

`src/lib/sources/manual-source.ts` is the only implementation today (manual
form submissions go straight to `POST /api/jobs/import`). A future
allowed feed/API/browser-based source can implement the same interface and
push `NormalizedJob[]` through the same import + dedupe + analysis pipeline
without touching the rest of the app.

## Dashboard refresh

The job list polls `GET /api/jobs` every 5 seconds client-side. This is a
placeholder for real-time updates and can be swapped for SSE later without
changing the API surface. This UI polling is independent of (and much more
frequent than) any future external Upwork collection frequency.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
npx prisma studio  # inspect the database visually
```

## Intentionally postponed

- Automatic Upwork scraping/collection (see "Future scanner integration").
- SSE-based live updates (polling is used for now).
- Sending Telegram notifications automatically on new APPLY_NOW/HIDDEN jobs —
  the utility exists and is wired to Settings, but nothing calls it yet since
  there's no background scanner to trigger it from.
