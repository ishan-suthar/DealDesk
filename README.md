# Deal Desk

**Deal Desk** is a single-user, local-first research workspace designed to help **Nikita** (a Booth MBA recruiting for Investment Banking) find, screen, deeply research, and annotate M&A deals for coffee chats.

Deal Desk is built around strict data integrity: every fact is anchored in primary or reputable secondary sources, raw numbers are never shown without a verification status, and analytical opinions are clearly separated from verified facts.

---

## Key Features

1. **Welcome & Quick Launch (`/`)**: One-click onboarding customized for Nikita, with persistent settings and fast entry into research.
2. **Three-Column Research Dashboard (`/research`)**:
   - **Left Rail (Study List)**: Pinned and saved deals in My Deals, persisted locally across sessions.
   - **Center Column (Discovery Queue)**: Fast M&A deal screening by sector, time window, status, and geography. Organizes deals into On Hold, Restored, and Current results queues with progress bars and collapse controls.
   - **Right Column (Workspace)**: Switches seamlessly between Quick Preview (screening brief with the exact action buttons: `Save to My Deals`, `Hold for review`, `I don't like this deal`) and full Deep Research Reports.
3. **Deep Research Report**:
   - Structured in strict accordance with the IB research template (Snapshot, Companies, Mechanics, Rationale & Valuation, Sources & Verification).
   - Every fact rendered via `FactValue` with transparent verification status chips (`confirmed`, `derived`, `unverified`, `not_disclosed`, `not_available`).
   - Every analytical thesis flagged with `Analysis — not investment advice`.
   - Version history with `Refresh research` capability and non-destructive re-runs.
4. **Field Notebook (`/notebook`)**:
   - Multi-block quote capture directly from research reports.
   - Manual insights, commentary, section tags, search, and pin controls.
   - Drag and keyboard reordering (`Move up` / `Move down`) with 8-second undo toasts.
5. **Multi-Format Export**:
   - Generates beautifully formatted Microsoft Word documents (`.docx`) matching IB banking style guides.
   - Generates clean, standalone Markdown documents (`.md`).
   - Grouped user notes, legend of verification statuses, and indexed source citations.
6. **Recycle Bin (`/recycle-bin`)**:
   - Holds rejected deals for review.
   - Support for `Restore` back to the discovery queue and `Permanently remove`.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Node.js runtime)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS + Radix UI primitives + Lucide Icons
- **Database**: SQLite via `better-sqlite3` + Drizzle ORM + Drizzle migrations
- **Validation**: Zod across all API routes, database models, and provider boundaries
- **Testing**: Vitest (100 unit & contract tests) + Playwright (13 E2E test suites)
- **Document Generation**: `docx` library for Word documents, `react-markdown` (without `rehype-raw`) for text
- **Providers**: Demo provider with 10 fictional fixtures, Anthropic Claude (`@anthropic-ai/sdk`), Google Gemini (`@google/genai`), SEC EDGAR full-text search API

---

## Getting Started

### 1. Prerequisites
- Node.js 18.x or 20.x (LTS recommended)
- npm 9+ or 10+

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Initialize Database
Initialize the SQLite database (`deal_desk.db`) and seed demo fixtures:
```bash
npm run db:migrate
npm run db:seed
```

To reset the database at any time:
```bash
npm run db:reset
```

### 4. Run the Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. The app runs locally on `127.0.0.1`.

---

## Running in Demo Mode

By default, Deal Desk runs entirely in **Demo Mode** with zero external API keys or network access required.

- Uses 10 fictional M&A transaction fixtures across various sectors (Technology, Healthcare, Consumer & Retail, Industrials, Energy).
- All fixture URLs are strictly sandboxed under `https://example.com/demo/...`.
- No real company names or fabricated real-world data are used.
- Displays a persistent `Demo data` badge across all pages.

---

## Configuring Live Research Providers (Optional)

To enable live web search, SEC EDGAR integration, and LLM-assisted deal discovery, copy `.env.example` to `.env.local` and configure your API keys:

```bash
cp .env.example .env.local
```

### Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `RESEARCH_PROVIDER` | Research provider (`demo`, `anthropic`, or `gemini`) | `demo` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key | (optional) |
| `ANTHROPIC_MODEL_FAST` | Haiku model for fast discovery | `claude-haiku-5-5` |
| `ANTHROPIC_MODEL_DEEP` | Sonnet model for deep report generation | `claude-sonnet-5-5` |
| `GEMINI_API_KEY` | Google Gemini API Key | (optional) |
| `GEMINI_MODEL` | Gemini model with Google Search grounding | `gemini-2.5-flash` |
| `SEC_USER_AGENT` | Required user agent for SEC EDGAR API (`Sample Company AdminContact@<sample company domain>.com`) | `DealDesk/1.0 (recruiting-research@chicagobooth.edu)` |
| `DAILY_SEARCH_CAP` | Maximum search/gather requests allowed per calendar day | `300` |

### Live Smoke Test
Test live provider configurations safely without running a full workflow:
```bash
npm run live:smoke
```
*Note: If API keys are missing, the smoke test cleanly informs you and exits with code 0 without failing.*

---

## Verification & Test Commands

Every milestone and release must pass the full test gate:

```bash
# Typecheck TypeScript codebase
npm run typecheck

# Run ESLint
npm run lint

# Run Vitest unit, contract, and security test suites (100 tests)
npm test

# Run Playwright End-to-End integration test suite (13 tests)
npm run test:e2e

# Build production Next.js application
npm run build

# Milestone gate shorthand
npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build
```

---

## Data Integrity, Privacy & Security Guardrails

1. **Zero Hallucination Tolerance**:
   - The server enforces citations through an independent verification engine (`src/server/services/verification.ts`).
   - Sourced facts must link to verified source packs (`S1`, `S2`, ...). Hallucinated or unknown citation IDs are automatically dropped by the server.
   - Raw numbers are never displayed without their source status.
2. **Untrusted Web Content Quarantine**:
   - All live web and SEC search results are treated as untrusted data.
   - LLM prompts explicitly enforce boundaries forbidding execution of user instructions found inside fetched pages.
3. **Local-First Security**:
   - Single-user design with zero external auth requirements.
   - Server-only LLM SDKs: API keys and raw provider SDKs are never bundled or exposed to client-side code.
   - No `dangerouslySetInnerHTML`: all notes and text are rendered as sanitized Markdown or plain text.
4. **SEC Fair Access Policy**:
   - Automated rate limiting guarantees requests to SEC EDGAR maintain ≥150ms spacing (never exceeding 10 req/s).
5. **Analysis Notice**:
   - Deal Desk does not provide investment advice. All analytical commentary is watermarked:
     > **Analysis — not investment advice**

---

## Author & Context

Developed for **Nikita**, a Booth MBA candidate preparing for Investment Banking coffee chats and interviews.
