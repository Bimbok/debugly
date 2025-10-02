# Debugly

Debugly is a lightweight code-review companion built with Next.js App Router, Monaco Editor, and Google Gemini. Paste code, pick a language and theme, and click “Review Code” to get fast, actionable feedback. It’s designed to be simple, private-by-default (your API key stays on the server), and easy to deploy on Vercel.

## Why Debugly?

- Fast and focused: zero-config UI for quick code reviews without complex prompts
- Private-by-default: uses a server route to call Gemini, keeping your API key off the client
- Familiar editor: Monaco Editor with syntax highlighting, themes, and language-based suggestions
- Flexible: selectable Gemini model (defaults to gemini-2.5-flash), language and theme dropdowns
- Production-ready: works locally and on Vercel with SSR-safe guards around client-only features

## Features

- Monaco Editor with popular themes and language auto-suggestions (JS/TS, Python, Go, Rust, C/C++, Lua, and more)
- “Review Code” panel powered by Google Gemini (default: gemini-2.5-flash; override per request)
- Optional 3D background (react-three-fiber/drei) guarded to render only on the client
- Responsive toolbar (Show/Hide Diff, Theme/Language selectors)
- Shadcn/UI components, Tailwind CSS v4, and Recharts already wired up

## Tech Stack

- Next.js 14 (App Router)
- React 19
- Tailwind CSS v4 + shadcn/ui
- Monaco Editor (@monaco-editor/react)
- Google Gemini (via server route POST /api/review)
- Optional: @react-three/fiber and drei for the animated background

## Getting Started

### 1) Prerequisites

- Node.js 18.17+ (or Bun if you prefer)
- A Google Generative Language API key with access to Gemini models

### 2) Environment Variables

Set the following environment variable:

- GEMINI_API_KEY: your Google Generative Language API key

On Vercel:
- Go to Project Settings → Environment Variables
- Add GEMINI_API_KEY
- Redeploy

Locally (standard Next.js):
- Create a file named .env.local in the project root:
  GEMINI_API_KEY=your_api_key_here

Note: In v0’s Next.js runtime, .env files are not supported; set variables in the project settings UI instead.

### 3) Install Dependencies

Use your favorite package manager.

- pnpm:
  pnpm install

- npm:
  npm install

- bun:
  bun install

### 4) Run the App (Development)

- pnpm:
  pnpm dev

- npm:
  npm run dev

- bun:
  bun run dev

Then open http://localhost:3000

### 5) Build and Start (Production)

- pnpm:
  pnpm build
  pnpm start

- npm:
  npm run build
  npm run start

- bun:
  bun run build
  bun run start

## Usage

1) Paste or write your code in the editor
2) Select a language and theme from the dropdowns
3) Click “Review Code” to send your code to the server route and receive feedback
4) Optionally toggle the diff panel if available in your UI

Model selection:
- The API defaults to gemini-2.5-flash
- You can pass an optional model in the request body to override:
  { "code": "...", "language": "typescript", "model": "gemini-1.5-flash" }

## API Reference

POST /api/review
- Body (JSON):
  {
    "code": "string (required)",
    "language": "string (optional, e.g. 'typescript')",
    "model": "string (optional, default 'gemini-2.5-flash')"
  }

- Response (JSON): A structured review object with issues, suggestions, and summaries

Example (curl, hitting your deployed site):
curl -X POST https://your-app.vercel.app/api/review \
  -H "Content-Type: application/json" \
  -d '{"code":"function add(a,b){return a+b}","language":"javascript"}'

Note: The server route uses GEMINI_API_KEY on the server; do not expose your key to the client.

## Troubleshooting

- “Cannot read properties of undefined (reading 'S')”
  - This usually indicates a client-only library trying to run on the server. The 3D background is dynamically imported with SSR disabled and wrapped with safeguards. If you still see issues, temporarily disable the background component in app/page.tsx to isolate the cause.

- Vercel Analytics warnings
  - You may see a console warning if Web Analytics is not enabled or is blocked by an ad blocker. It’s harmless and does not affect the app.

- Monaco Editor doesn’t load or throws errors
  - Hard refresh the page. If using a strict CSP or corporate network, ensure the necessary assets are allowed.

- Gemini errors or empty responses
  - Confirm GEMINI_API_KEY is set (Vercel: Project Settings; Local: .env.local)
  - Check model availability and quotas for your account

## Project Scripts

- dev: next dev
- build: next build
- start: next start
- lint: next lint

## Folder Structure (high-level)

- app/
  - api/review/route.ts — server route for Gemini code reviews
  - page.tsx — main UI page
  - layout.tsx — root layout and providers
- components/
  - code-editor.tsx — Monaco editor wrapper
  - review-panel.tsx — AI review output panel
  - three-background.tsx — optional 3D background (client-only)
  - ui/* — shadcn/ui components
- public/ — static assets

## Contributing

We welcome contributions! To get started:

1) Fork the repo and create a feature branch
   - feat/editor-autocomplete, fix/review-panel-layout, etc.

2) Make your changes
   - Keep changes small and focused
   - Use TypeScript where applicable
   - Prefer existing patterns and utilities (shadcn/ui, Tailwind tokens)

3) Test locally
   - Run dev, exercise the UI and /api/review
   - Ensure no client-only code runs on the server path

4) Commit and open a PR
   - Use clear commit messages (e.g., feat: add Lua suggestions to Monaco)
   - Describe the problem, solution, and any visual/behavioral changes
   - Include screenshots or short notes if it involves UI changes

5) PR checklist
   - No secrets in code or logs
   - No console noise (remove temporary console.log statements)
   - Works with default model and respects GEMINI_API_KEY on server
   - Builds on Vercel

## Roadmap Ideas

- Inline annotations for Monaco diagnostics
- Multi-model compare view
- Shareable review links (with redaction)
- Plugin API for custom checks

## Support

- Deploy on Vercel with one click from your fork or via the Vercel dashboard
- If you encountered bugs, please open an issue or PR with a minimal repro
- For deployment help, see Vercel Docs and project settings (Environment Variables)

---
Happy debugging with Debugly!
