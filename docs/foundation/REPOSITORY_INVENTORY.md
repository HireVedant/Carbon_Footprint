# Repository Inventory

## Project Structure

### Pages (`src/pages/`)
- **Purpose:** Top-level view components (Home, Dashboard, Community, Assessment, Login, Register, History, About, Landing).
- **Dependencies:** React Router, Layouts, Contexts, Hooks.
- **Responsibilities:** Routing entry points, fetching initial data, wrapping layouts.
- **Potential Risks:** Monolithic files (e.g., Assessment.tsx, Community.tsx) handle too much state and UI rendering, leading to re-render cascades and difficult testing.

### Components (`src/components/`)
- **Purpose:** Reusable UI and domain-specific elements.
- **Subdirectories:**
  - `auth/`: Authentication forms.
  - `calculator/`: Forms and sections for the carbon calculator.
  - `dashboard/`: User-specific data visualization.
  - `layout/`: Navbar, Footer, wrappers.
  - `ui/`: Primitives (buttons, cards).
- **Potential Risks:** Weak boundaries between UI primitives and domain components. Lack of standardized UI primitives (often using inline HTML+Tailwind).

### Contexts (`src/context/`)
- **Purpose:** Global state management.
- **Dependencies:** React Context API, Firebase Auth, Firestore.
- **Responsibilities:** Provide Auth state, Calculator state, and Assessment flow data.
- **Potential Risks:** Overlapping responsibilities between CalculatorContext and AssessmentContext.

### Hooks (`src/hooks/`)
- **Purpose:** Extract reusable logic.
- **Responsibilities:** Listeners (e.g., `useCommunityStats`), form handling, auth state derivation.

### Services (`src/services/`)
- **Purpose:** External API integrations and specialized business logic.
- **Files:** `aiCoachService.ts`, `auditService.ts`, `communityAnalyticsService.ts`, `newsletterService.ts`, `seiDatasetService.ts`.
- **Potential Risks:** AI Coach relying directly on Gemini APIs without strong fallback guarantees.

### Firebase (`src/firebase/`)
- **Purpose:** Client SDK configuration.
- **Files:** `firebase.ts`, `auth.ts`, `firestore.ts`.
- **Potential Risks:** Direct Firestore calls bypassing the Data Provider layer if not carefully monitored.

### Cloud Functions (`functions/src/`)
- **Purpose:** Secure backend aggregation.
- **Files:** `index.ts`.
- **Responsibilities:** Securely aggregate `communityStats` when an assessment is created, updated, or deleted.

### Data Providers (`src/data/providers/`)
- **Purpose:** Abstracting datasets from UI components.
- **Dependencies:** `src/data/datasets/`.

### Calculation Engine (`src/core/calculation/`)
- **Purpose:** Deterministic calculation formulas.
- **Files:** transport, energy, food, waste, shopping, etc.
- **Responsibilities:** Pure functions taking user inputs and returning kgCO2e.

### Styling & Design (`src/design/`, `index.css`, `tailwind.config.js`)
- **Purpose:** Design tokens and global CSS.
- **Potential Risks:** Tokens are defined but routinely bypassed in favor of hardcoded inline Tailwind classes.
