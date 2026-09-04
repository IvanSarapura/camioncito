# My Provisional Frontend

A lightweight, professional Next.js starting point for marketing sites, portfolios, and small business websites. It keeps the quality gates that catch expensive mistakes without adding a heavy component system, visual-regression suite, or blocking Git hooks.

## Quick start

Use Node 24 (see `.nvmrc`), then install and start the site:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Before deployment, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the canonical production URL.

For Vercel, add `NEXT_PUBLIC_SITE_URL` as a **Production** environment variable with the canonical HTTPS URL. Production builds fail with a clear error when it is missing or not HTTPS; local development and Preview deployments keep the localhost fallback so projects can start quickly.

## Make it yours

- Change site identity, URL, locale, navigation, and contact email in `src/config/site.ts`. The `locale` value controls the document's `lang` attribute.
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

GitHub Actions runs format, lint, types, unit tests, build, and the Chromium smoke test for pull requests and `main`. Dependabot creates one grouped update pull request per week.

The production build explicitly uses Webpack. Next.js 16 defaults to Turbopack, but this opt-out keeps builds reliable in restricted local environments; revisit it when the project no longer needs that compatibility path. The build also disables Next's experimental TypeScript CLI checker because this boilerplate pins TypeScript 5.9, whose JavaScript compiler API is the compatible checker for the current Next version.

The default security headers include a static CSP and HSTS. The CSP keeps static rendering and CDN caching intact, but integrations such as analytics, a CMS, remote fonts, or a form provider must add their exact trusted origins to the relevant directive in `next.config.ts`. Do not introduce CSP nonces unless a project needs their extra XSS protection: nonces require per-request dynamic rendering and add operational complexity.

## Add complexity only when needed

Authentication, CMS/data clients, analytics, a real form endpoint, Storybook, visual snapshots, coverage targets, multi-browser E2E, CSP nonces, and API mocks are deliberately not defaults. Add them when a concrete project requirement justifies their maintenance cost.
