# EcoTrack AI — Architecture Decision Records (ADR)

## ADR 001: Separation of Community Data Aggregation into Firebase Cloud Functions
- **Date:** 2026-07-30
- **Status:** Accepted
- **Context:** Previously, client-side React code executed Firestore `runTransaction` writes directly to global aggregate documents (`/communityStats/global` and `/communityReports`). This exposed the database to malicious client-side data tampering.
- **Decision:** Lock down `firestore.rules` to deny client write permissions on aggregate collections. Create a Firebase Cloud Function (`onAssessmentCreated`) that triggers on assessment document writes to perform server-side aggregations safely in an isolated environment.
- **Consequences:** Eliminates client-side security vulnerabilities. Aggregations execute asynchronously on Firebase infrastructure.

## ADR 002: Modularization of Monolithic Views
- **Date:** 2026-07-30
- **Status:** Accepted
- **Context:** Top-level page files (`Landing.tsx`, `Assessment.tsx`) grew beyond 1,000 lines, combining inline SVG paths, state, and complex UI layouts in single files.
- **Decision:** Extract modular sub-components into dedicated feature component directories (e.g., `src/pages/landing/components/Hero.tsx`, `Simulator.tsx`).
- **Consequences:** Significantly improves code readability, testability, and developer experience.

## ADR 003: Dual Documentation System Architecture
- **Date:** 2026-07-30
- **Status:** Accepted
- **Context:** The repository required both user-facing documentation for end users and deep technical memory for future AI agent pair-programmers.
- **Decision:** Establish `/docs/user` for non-technical user documentation and `/docs/ai` for system memory, architecture diagrams, threat models, and future roadmaps.
- **Consequences:** Ensures seamless onboarding for human developers and immediate context loading for AI assistants.
