# Contributing to Pak Railway

Thank you for helping improve Pak Railway. This guide explains the workflow expected for documentation, frontend, backend, and collaboration changes.

## Branching Rules

- `main` is the stable release branch.
- `dev` is the integration branch for active development.
- Create feature branches from `dev`.
- Use clear branch names:
  - `feature/readable-feature-name`
  - `bugfix/readable-bug-name`
  - `docs/readable-doc-name`
- Keep each branch focused on one issue or closely related set of changes.

## Commit Message Rules

- Use short, meaningful commit messages.
- Prefer a conventional prefix when it fits:
  - `docs:` for documentation.
  - `feat:` for new features.
  - `fix:` for bug fixes.
  - `chore:` for maintenance.
  - `test:` for test updates.
- Explain the result of the change, not only the file touched.
- Examples:
  - `docs: add setup instructions to README`
  - `fix: ignore local environment files`
  - `feat: add booking status filter`

## Pull Request Rules

- Open pull requests against `dev` unless the change is an urgent release fix.
- Link the related GitHub issue in the PR description.
- Mention whether the change affects the frontend, backend, documentation, or repository workflow.
- Include a concise summary of changes.
- Include the checks performed, such as `npm run build`, route testing, or documentation review.
- Keep PRs small enough for a reviewer to understand quickly.
- Do not merge your own PR without review when team review is required.

## Code Review Rules

- Reviewers should check correctness, readability, security, and maintainability.
- For frontend changes, verify responsive behavior and user flow.
- For backend changes, verify API behavior, validation, authentication, and database impact.
- Comment on specific lines when possible.
- Approve only after required fixes are complete or clearly deferred.
- Do not impersonate another reviewer. Reviews must come from a real teammate or instructor account.

## Conflict Resolution Guidelines

- Pull the latest `dev` before starting new work.
- If a conflict occurs, inspect both versions carefully before editing.
- Resolve conflicts in the smallest affected section.
- Keep the final content clear and consistent with project conventions.
- Run relevant checks after resolving the conflict.
- Commit the conflict resolution with a message such as `docs: resolve README workflow conflict`.

## Local Development Expectations

- Do not commit secrets, tokens, passwords, or private connection strings.
- Keep `.env` files local.
- Install dependencies separately in `client/` and `server/`.
- Prefer documentation changes for workflow labs unless a functional requirement explicitly needs code changes.
