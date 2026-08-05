# EcoTrack Frontend Architecture

## Overview
The frontend is built using React 19, TypeScript, and Vite. It utilizes a modular, feature-first component breakdown.

## Pages & Routes

1. **`Landing.tsx` (`/`)**
   - Public landing page with hero banner, live simulator, interactive dashboard preview, real-time community statistics, technology breakdown, methodology, FAQ, and footer.
   - Composed of subcomponents in `src/pages/landing/components/`:
     - `Hero.tsx`
     - `Simulator.tsx`

2. **`Assessment.tsx` (`/assessment`)**
   - Multi-step assessment form guiding users through Transport, Energy, Food, Waste, and Shopping.
   - Saves results into `CalculatorContext` and syncs with Firestore `/users/{uid}/assessments`.

3. **`Dashboard.tsx` (`/dashboard`)**
   - Primary user portal showing total footprint, historical trends, breakdown charts, and goal tracking.

4. **`Community.tsx` (`/community`)**
   - Public community leaderboard and aggregate statistics dashboard listening to real-time Firestore updates.

## State Management
- **`AuthContext`**: Manages user authentication state, login, logout, and profile sync.
- **`CalculatorContext`**: Manages assessment calculation state, current inputs, breakdown figures, and persistence.

## Component Design Principles
- Single Responsibility: Each component renders one primary sub-view or control.
- Reusable Utilities: Dynamic class combination via `src/utils/cn.ts`.
- Design Tokens: Uniform token references via `src/utils/design.ts`.
