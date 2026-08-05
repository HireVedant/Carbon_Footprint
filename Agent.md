# EcoTrack AI — AI Agent Operations & Instructions (`Agent.md`)

## 🤖 Identity & Purpose
This document is the **primary instruction set and memory anchor** for any AI Agent working on the EcoTrack AI repository.

---

## 🎯 Core Operating Principles & Rules

### 1. "Refactor Without Regression"
- **NEVER** remove features, pages, components, calculations, datasets, or Firestore collections.
- **NEVER** change business logic, scientific datasets (EPA, IPCC, DEFRA), or GHG calculation formulas without explicit user direction.
- **NEVER** break backward compatibility.

### 2. Security Non-Negotiables
- Client writes to global aggregate collections (`communityStats`, `communityReports`, `communityLeaderboard`) are **STRICTLY PROHIBITED**.
- Aggregation must **ONLY** occur via Firebase Cloud Functions in `/functions`.
- Admin authentication must rely on Custom Claims (`request.auth.token.admin == true`) or database roles—never hardcoded email strings.

### 3. Architecture & Code Style
- **Modularity:** Keep files focused (< 300 lines where possible). Break monolithic pages into `/pages/{pageName}/components/`.
- **Styling:** Use Tailwind CSS utility classes combined with `cn()` from `src/utils/cn.ts`.
- **Design Tokens:** Reference centralized design tokens in `src/utils/design.ts`.

---

## 📁 Key File Map for AI Navigation
- `firestore.rules` — Firestore security rules.
- `functions/src/index.ts` — Server-side aggregation Cloud Functions.
- `src/services/communityAnalyticsService.ts` — Real-time community statistics listener API.
- `src/context/CalculatorContext.tsx` — Client assessment state and calculation engine interface.
- `src/utils/cn.ts` — Class string merger.
- `src/utils/design.ts` — Design tokens and Framer Motion animation variants.
- `/docs/ai/` — Detailed sub-system documentation (Architecture, Backend, Security, DataFlow, Performance, Future).

---

## 🧪 Definition of Done (DoD)
Before marking any AI task complete:
1. `npx tsc --noEmit` must pass with zero errors.
2. `npm run build` must succeed.
3. All original user options and features must be intact.
4. AI documentation in `/docs/ai/` must be updated if architectural changes occurred.
