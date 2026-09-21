# Vue 3 + Vite + TypeScript frontend, styled with Tailwind v4 and shadcn-vue, managed with bun

The frontend workspace was a placeholder with no framework chosen (its README listed React, Vue, and Next.js as open options). We picked Vue 3 via the official `create-vue` Vite scaffold, TypeScript, Tailwind CSS v4, and shadcn-vue for UI components, deliberately starting bare — no Router, Pinia, or test runner — until one is actually needed. Package management uses bun, matching the root workspace's existing `bun run --cwd frontend ...` scripts, even though `backend/package.json` pins pnpm; that backend inconsistency is a separate, unresolved issue and not addressed here.

## Considered Options

- **React/Next.js** — the other framework left open by the placeholder; not chosen.
- **pnpm** — would match backend's `packageManager` field, but root orchestration already assumes bun and reconciling backend's own pnpm/bun mismatch was treated as out of scope for this decision.

## Update

vue-router was added for the login, dashboard, users and settings pages. Pinia is still not needed: session state is one ref, and the API client is plain `fetch` (`src/lib/api.ts`).
