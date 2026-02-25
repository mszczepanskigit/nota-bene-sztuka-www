# Branching model (simple)

Purpose
- Keep branching rules minimal and predictable so we can move fast while keeping staging and production safe.

Branches
- `master` (production)
  - Protected. Only merges via PR from `test`.
  - Deploys to production.
- `test` (staging)
  - Protected. All feature work is merged here first.
  - Automatic preview deploys (Vercel) enabled for `test` and PRs targeting `test`.
- `feature/<name>`
  - Short-lived branches for individual tasks or features.
  - Base branch: `test`.
- `hotfix/<name>` (optional)
  - For urgent fixes applied directly to `master`, then merged back to `test`.

Workflow (recommended)
1. Create branch:
   - `git checkout test`
   - `git pull`
   - `git checkout -b feature/<short-descriptive-name>`
2. Work locally, commit often with clear messages.
3. Push branch:
   - `git push -u origin feature/<name>`
4. Open PR: `feature/<name>` → `test`
   - Use the PR template.
   - PR title format (recommended): `feat(scope): short description` or `fix(scope): short description`
   - Add reviewers and labels (if used).
5. Validate
   - Run local checks: format, lint, typecheck, tests.
   - Wait for preview deploy (Vercel) and manual review.
6. Merge PR to `test` when green and reviewed.
7. When `test` is stable and ready for release:
   - Open PR: `test` → `main`
   - After passing checks, merge to `main`. Tag release if appropriate (`v1.0.0`).

Merge strategy
- Required "Squash and merge" for feature branches to keep main history tidy. Use descriptive PR titles and bodies to preserve changelog-quality info.

Branch protection (recommended settings)
- Protect `main` and `test`:
  - Require pull requests before merging
  - Require required status checks to pass (CI/lint/tests) — enable after CI is in place
  - Require review (1 reviewer)
  - Require branches to be up-to-date before merging (optional)

Notes
- Keep feature branches short-lived (hours/days, not weeks).
- Link each PR to an Issue (if applicable) and a Milestone (e.g., MVP 1.0.0).