# Performance Baseline

## Largest Pages & Components
- **`Assessment.tsx`:** Extremely large file size (~48KB). Handles multiple complex forms, heavy state, and rendering all in one go.
- **`Community.tsx`:** Large file size (~42KB). Renders an SVG map (`IndiaMap`) and establishes real-time Firestore listeners.

## Heavy Libraries
- `chart.js` & `react-chartjs-2`
- `framer-motion`
- `firebase` SDK

## Identified Bottlenecks
- **Unnecessary Re-renders:** monolithic components (like `Assessment.tsx`) passing vast state objects cause child sections (e.g., Food, Transport) to re-render even when their specific state hasn't changed.
- **Firestore Read Intensity:** The Community page mounts `useCommunityStats` which triggers a snapshot listener. If multiple users load this frequently, it costs 1 read per active connection per update. (Backend aggregation mitigates this well, but the client still holds open connections).
- **Bundle Loading:** No route-based code splitting (React `lazy` / `Suspense`) appears to be implemented for the main application routes, meaning users download the map and charting libraries before they even log in.

## Performance Risks
- Adding more sections to the calculator will further bloat `Assessment.tsx` and reduce form responsiveness.
- Lack of memoization (`useMemo`, `useCallback`) across complex data transforms for the charts.
