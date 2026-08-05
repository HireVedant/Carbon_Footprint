# Contributing to EcoTrack AI

## Development Workflow
1. Clone the repository and install dependencies: `npm install`.
2. Ensure environment variables are copied: `cp .env.example .env`.
3. Start local development server: `npm run dev`.
4. Before submitting code, run type checks: `npx tsc --noEmit`.

## Code Quality Standards
- Write clean, self-documenting code with meaningful JSDoc comments explaining *why* decisions were made.
- Always use `cn()` from `src/utils/cn.ts` for dynamic class names.
- Update `/docs/user/` and `/docs/ai/` when introducing major architectural changes.
