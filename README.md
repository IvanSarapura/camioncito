# My Provisional Frontend

A lightweight, professional Next.js starting point for marketing sites, portfolios, and small business websites. It keeps the quality gates that catch expensive mistakes without adding a heavy component system, visual-regression suite, or blocking Git hooks.

## Quick start

Use Node 24 (see `.nvmrc`), then install and start the site:

```bash
npm ci
npm run dev
```

The repository's `.npmrc` enables `engine-strict`, so npm refuses to install dependencies with an unsupported Node.js major version instead of allowing local and CI environments to drift.

Open [http://localhost:3000](http://localhost:3000). Before deployment, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the canonical production URL.

For Vercel, add `NEXT_PUBLIC_SITE_URL` as a **Production** environment variable with the canonical HTTPS URL. Production builds fail with a clear error when it is missing or not HTTPS; local development and Preview deployments keep the localhost fallback so projects can start quickly.

## Make it yours

- Change site identity, URL, locale, navigation, and contact email in `src/config/site.ts`. The `locale` value controls the document's `lang` attribute.
- Replace the starter sections in `src/components/sections/` with the project's content.
- Keep the small UI primitives in `src/components/ui/` or replace them as the product needs evolve.
- Connect the contact form only when a project selects its provider or server action. It intentionally does not submit data yet.
- Add remote image hosts to `next.config.ts` only when they are actually used.

## Quality commands

| Command                | Purpose                                                |
| ---------------------- | ------------------------------------------------------ |
| `npm run format`       | Format files locally.                                  |
| `npm run format:check` | Verify formatting without editing.                     |
| `npm run lint`         | Run Next.js and accessibility lint rules.              |
| `npm run typecheck`    | Generate Next types and run TypeScript.                |
| `npm test`             | Run focused unit tests.                                |
| `npm run build`        | Build the production app.                              |
| `npm run test:e2e`     | Build, serve, and test the production app in Chromium. |

Run the browser once locally before E2E testing:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright builds and starts the production application automatically when run locally. In CI it reuses the production build created earlier in its job, avoiding duplicate work.

GitHub Actions uses two focused jobs for pull requests and `main`:

1. `Quality checks` runs the blocking production-dependency security audit, format check, lint, typecheck, and unit tests.
2. `Production smoke` starts only after `Quality checks` succeeds, then builds the production application and runs the Chromium smoke test.

This dependency keeps failures easy to diagnose and avoids spending time on browser setup when a faster quality gate has already failed. The production build and E2E test stay in the same job, so no build artifact needs to be transferred between runners. Dependabot creates one grouped update pull request per week. ESLint warnings fail both CI and staged-file checks so warnings cannot accumulate silently.

Every commit runs a fast, staged-file-only check through Husky and lint-staged: JavaScript and TypeScript files receive ESLint fixes followed by Prettier, while CSS, JSON, Markdown, and YAML files are formatted with Prettier. Full-project checks remain in CI, so commits stay fast.

The production build explicitly uses Webpack. Next.js 16 defaults to Turbopack, but this opt-out keeps builds reliable in restricted local environments; revisit it when the project no longer needs that compatibility path. The build also disables Next's experimental TypeScript CLI checker because this boilerplate pins TypeScript 5.9, whose JavaScript compiler API is the compatible checker for the current Next version.

The default security headers include a static CSP and HSTS. The CSP keeps static rendering and CDN caching intact, but integrations such as analytics, a CMS, remote fonts, or a form provider must add their exact trusted origins to the relevant directive in `next.config.ts`. Do not introduce CSP nonces unless a project needs their extra XSS protection: nonces require per-request dynamic rendering and add operational complexity.

## Protect the default branch

The recommended `main` branch protection is versioned in [`.github/rulesets/main.json`](.github/rulesets/main.json). Committing this file does **not** activate it in GitHub. A repository administrator must apply it once from **Settings → Rules → Rulesets → New ruleset → Import a ruleset**, then select that file. Alternatively, with GitHub CLI authenticated for the repository:

```bash
gh api --method POST repos/OWNER/REPOSITORY/rulesets \
  --input .github/rulesets/main.json
```

The ruleset requires pull requests, resolved review conversations, up-to-date `Quality checks` and `Production smoke` statuses, and prevents force pushes and branch deletion. It intentionally requires zero approvals so a solo-maintained MVP is not blocked; raise `required_approving_review_count` to `1` when another reviewer is available. After importing it, verify that the ruleset is active under the repository's Rulesets settings.

## Add complexity only when needed

Authentication, CMS/data clients, analytics, a real form endpoint, Storybook, visual snapshots, coverage targets, multi-browser E2E, CSP nonces, and API mocks are deliberately not defaults. Add them when a concrete project requirement justifies their maintenance cost.
