# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

## Backend Contracts

- `backend/src/modules/structure` (Companies, Organization Units) is served over GraphQL only; it has no REST controller and there is no OData tier. Staff and Job stay on REST. See `backend/docs/adr/0002-graphql-replaces-odata-and-rest-for-structure.md`
- GraphQL is code-first with an in-memory schema; new collections extend the generic resolver in `backend/src/modules/common/generic/base.resolver.ts`, mirroring the generic REST controller. Fields are published opt-in, one `@Field` at a time
- Company and Organization Unit are separate collections. A Holding is a Company with `isHolding` set (`backend/docs/adr/0001-holding-is-a-flagged-company.md`)
- Reference naming: `parentId` names the parent in the same collection; `companyId` names the owning Company and is carried directly on every record that belongs to one
- Guards, response interceptor, exception filter, and validation pipes are registered as providers in `backend/src/app.module.ts`, not in `main.ts`, and are transport-aware (HTTP and GraphQL)
- The generic REST controller exposes an id-scoped `DELETE /:id` (`deleteById`, never `deleteMany`); the generic GraphQL resolver still has no delete. A Staff member's Organization Unit (and derived `companyId`) is optional
- `NODE_ENV` is one of `development`, `production` or `test`; the env validator rejects anything else. Production gating uses `isProduction()` (`backend/src/modules/common/utils/is-production.ts`)

- External integrations (Telegram, Redis, S3, SMS, Pusher) are optional and no-op when their env vars are unset; see `backend/docs/adr/0003-optional-integrations.md` and `backend/src/modules/common/AGENTS.md`

## Frontend Contracts

- `frontend/` is Vue 3 + Vite + Tailwind v4 + shadcn-vue + vue-router only (no Pinia, no GraphQL client); see `frontend/docs/adr/0001-frontend-stack.md`
- All backend traffic goes through `frontend/src/lib/api.ts` (base `/api`, proxied by Vite to `:3003`); auth is email + password only, the JWT lives in localStorage, and any 401 redirects to `/login`
- Themes: the default lives in `src/assets/main.css`; each extra theme is a `[data-theme]` block pair in `src/assets/themes.css` plus an entry in `src/composables/useTheme.ts`. Users pick theme and dark mode on the Settings page

## Deployment

- `bin/` (repo root) holds server scripts: `setup.sh` (one-time: bun, node, pm2, serve, Docker), `deploy.sh` (git reset to `origin/<branch>`, `bun install --frozen-lockfile`, `bun run build`, `pm2 startOrReload ecosystem.config.js`), `sync.sh` (rsync alternative to git), `update-deps.sh`
- `ecosystem.config.js` runs `app-backend` (bun, `backend/dist/main.js`, env from `backend/.env`) and `app-frontend` (`serve` of `frontend/dist` on :8080, SPA mode). The frontend calls `/api`, so the reverse proxy must map `/api` to the backend port with the prefix stripped (as Vite does in dev)

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: root `CONTEXT-MAP.md` points to `backend/CONTEXT.md` (and `frontend/CONTEXT.md` once it exists). Backend ADRs live in `backend/docs/adr/`. See `docs/agents/domain.md`.

## Child DOX Index

Partially indexed; add further children as folders become durable boundaries.

- `backend/src/modules/common/AGENTS.md`: shared REST layers, logger, validators and optional integrations (Telegram, Redis, S3, SMS, Pusher, rate limiting)
