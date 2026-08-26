# Nota Bene Sztuka

[![CI](https://github.com/mszczepanskigit/nota-bene-sztuka-www/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/mszczepanskigit/nota-bene-sztuka-www/actions/workflows/ci.yml)

Static marketing and lead-generation website for Nota Bene Sztuka, an online art-history tutoring
business operated by Marta Miller.

- Production: <https://notabenesztuka.pl>
- Stack: Astro, strict TypeScript, Bun, Vitest, ESLint, and Prettier
- Hosting: Vercel
- Primary language: Polish

## Requirements

- [Bun](https://bun.sh/)
- Node.js 22, as pinned in `.node-version`, for parity with Astro tooling and CI

Install the locked dependencies:

```sh
bun install --frozen-lockfile
```

## Local configuration

The site has safe development fallbacks for most public links, but webinar registration and the
contact form require valid public integration values for end-to-end testing.

```sh
cp .env.example .env
```

Only copy public, non-sensitive values into local `PUBLIC_*` variables. Astro exposes these values
to browser code. Never store a private secret in them and never commit `.env` files.

| Variable                  | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `PUBLIC_INSTAGRAM_URL`    | Instagram profile URL                    |
| `PUBLIC_SUPERPROF_URL`    | Superprof profile URL                    |
| `PUBLIC_CONTACT_EMAIL`    | Public contact address                   |
| `PUBLIC_WEBINAR_FORM_URL` | Webinar registration form URL            |
| `PUBLIC_WEB3FORMS_KEY`    | Public Web3Forms browser integration key |

## Development

```sh
bun run dev
```

Astro prints the local URL when the server starts. The default is <http://localhost:4321>.

## Quality commands

| Command                  | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `bun run format`         | Format supported files with Prettier                |
| `bun run format:check`   | Verify formatting without writing files             |
| `bun run lint`           | Run ESLint                                          |
| `bun run typecheck`      | Run Astro and TypeScript diagnostics                |
| `bun run test`           | Run Vitest unit tests                               |
| `bun run check`          | Run formatting, linting, type checks, and tests     |
| `bun run build`          | Produce the static production build in `dist/`      |
| `bun run preview`        | Serve the production build locally                  |
| `bun audit`              | Audit dependencies                                  |
| `bun run convert-images` | Convert explicitly configured source images to WebP |

For code and configuration changes, the required local quality gate is:

```sh
bun run check
bun run build
```

Run `bun audit` as well when dependencies or `bun.lock` change. User-visible changes also require
manual browser verification at mobile, tablet, and desktop widths.

CI runs `bun audit` separately before `bun run check`, so a passing local check alone is not full
CI parity. Current baseline audit findings are recorded in `docs/deferred-review.md`.

## Repository structure

```text
src/pages/               Astro routes and Polish page content
src/layouts/             Shared page shell and metadata
src/config/              Public environment-backed configuration
src/scripts/             Browser-side interactions
src/lib/                 Reusable TypeScript logic and unit tests
public/                  Static source assets
scripts/                 Development utilities
.github/workflows/       Continuous integration
```

`dist/` and `.astro/` are generated and must not be edited.

## Delivery workflow

Work is developed on feature branches. Changes are promoted to `test` for Vercel preview
validation and then to `master` for production. Repository agents may inspect Git state but must
never perform Git write operations; the maintainer owns branching, staging, commits, merges, and
pushes.
