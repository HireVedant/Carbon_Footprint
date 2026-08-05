# Component Inventory

## 1. UI Primitives
*Currently lacking standardized boundaries. Many are inline.*
- **Button:** Needs standardization (variants, sizes).
- **Card:** Repeatedly created inline using `bg-white/10 backdrop-blur-md rounded-2xl`. Needs refactoring into `<Card>`.
- **Input:** Used in `Login.tsx` and `Register.tsx`. Repeated logic for labels, error states, and icons. Needs refactoring into `<Input>`.

## 2. Layout
- **Navbar:** `src/components/layout/Navbar.tsx`. Handles routing and auth state display. (Priority: Low)
- **Footer:** `src/components/layout/Footer.tsx`. (Priority: Low)

## 3. Calculator (Assessment)
- **TransportSection:** Embedded within `Assessment.tsx`. (Needs Refactor: High. Extract to component).
- **FoodSection:** Embedded within `Assessment.tsx`. (Needs Refactor: High. Extract to component).
- **EnergySection:** Embedded within `Assessment.tsx`. (Needs Refactor: High. Extract to component).

## 4. Charts
- **DoughnutChart:** Used in Dashboard. Relies on `react-chartjs-2`.
- **IndiaMap:** Used in `Community.tsx` via `react-simple-maps`.

## 5. Community & Dashboard
- **StatCard:** Inline blocks in `Community.tsx`. Should be extracted to `<StatCard title={...} value={...} />`.
- **LeaderboardList:** Inline inside `Community.tsx`. Needs extraction.

## Duplicate Components & Logic
- Similar form inputs are defined separately in Login, Register, and Assessment flows.
- Glassmorphism containers are duplicated across Home, Dashboard, and Community pages with slight inconsistencies in border radii and opacity.
