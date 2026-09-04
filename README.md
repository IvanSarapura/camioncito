# My Provisional Frontend

A lightweight, professional Next.js starting point for marketing sites, portfolios, and small business websites. It keeps the quality gates that catch expensive mistakes without adding a heavy component system, visual-regression suite, or blocking Git hooks.

## Quick start

Use Node 22.22.2 (see `.nvmrc`), then install and start the site:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before deployment, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the canonical production URL.

## Make it yours

- Change site identity, URL, navigation, and contact email in `src/config/site.ts`.
- Replace the starter sections in `src/components/sections/` with the project's content.
- Keep the small UI primitives in `src/components/ui/` or replace them as the product needs evolve.
- Connect the contact form only when a project selects its provider or server action. It intentionally does not submit data yet.
- Add remote image hosts to `next.config.ts` only when they are actually used.

## Quality commands

| Command                | Purpose                                                 |
| ---------------------- | ------------------------------------------------------- |
| `npm run format`       | Format files locally.                                   |
| `npm run format:check` | Verify formatting without editing.                      |
| `npm run lint`         | Run Next.js and accessibility lint rules.               |
| `npm run typecheck`    | Generate Next types and run TypeScript.                 |
| `npm test`             | Run focused unit tests.                                 |
| `npm run build`        | Build the production app.                               |
| `npm run test:e2e`     | Run the Chromium smoke test against a production build. |

Run the browser once locally before E2E testing:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

GitHub Actions runs format, lint, types, unit tests, build, and the Chromium smoke test for pull requests and `main`. Dependabot creates one grouped update pull request per month.

The production build explicitly uses Webpack. Next.js 16 defaults to Turbopack, but this opt-out keeps builds reliable in restricted local environments; revisit it when the project no longer needs that compatibility path.

## Add complexity only when needed

Authentication, CMS/data clients, analytics, internationalization, a real form endpoint, Storybook, visual snapshots, coverage targets, multi-browser E2E, CSP nonces, and API mocks are deliberately not defaults. Add them when a concrete project requirement justifies their maintenance cost.
