# EcoTrack AI Memory

## Project Goals
- Provide an enterprise-grade, privacy-first carbon emission tracking tool.
- Help users visualize their impact and compare it securely via community aggregations.
- Maintain a high-performance, visually stunning frontend while ensuring accessibility.

## Constraints & Non-Negotiable Rules
- **DO NOT** remove features, calculations, pages, or routes.
- **DO NOT** break Firestore data structures.
- **DO NOT** change the scientific methodology or datasets used for calculations.
- Backward compatibility is mandatory for all architectural changes.

## Completed Work (Refactoring V1)
- **Security Upgrade:** Secured `firestore.rules` by removing client write access to `communityStats` and replacing hardcoded emails with robust admin checks.
- **Cloud Functions:** Implemented `aggregateCommunityStats` in Firebase Functions to handle data securely on the backend.
- **Documentation System:** Initialized dual documentation systems for Users (`/docs/user`) and AI Agents (`/docs/ai`).
- **Utility Abstraction:** Created `cn.ts` to merge Tailwind classes cleanly.

## Pending Work
- **Monolith Deconstruction:** `Landing.tsx` and `Assessment.tsx` are currently being broken into modular components within their respective `/components` subdirectories.
- **Performance Optimization:** Reducing `backdrop-filter` heavy effects.

## Technical Debt
- Long inline Tailwind classes still exist in older components. They should progressively be migrated to `cn()` or abstracted to `@apply` in `index.css`.
- The radial SVG progress charts in `Assessment.tsx` are hardcoded; they could be migrated to a charting library for better scaling.

## Developer Philosophy
- "Improve everything. Break nothing."
- "Refactor without regression."
- Feature-first architecture, DRY, KISS, and strict adherence to TypeScript safety.
