# EcoTrack AI Performance & Optimization Architecture

## Bundle Optimization
- **Vite Rollup Chunk Splitting:** `vite.config.ts` splits vendor dependencies into dedicated chunks:
  - `vendor-react`: react, react-dom, react-router-dom
  - `vendor-firebase`: firebase/app, firebase/auth, firebase/firestore
  - `vendor-charts`: chart.js, react-chartjs-2
- **Lazy Loading:** Routes (`/dashboard`, `/assessment`, `/community`) are lazy-loaded via `React.lazy()` with `Suspense` fallback wrappers to ensure initial LCP (Largest Contentful Paint) is under 1.2s.

## Rendering & GPU Optimizations
- **CSS Backdrop Filter Management:** `backdrop-filter: blur()` usage is capped at essential navigation bars and focused cards to avoid GPU compositor layer overload on mobile devices.
- **Animation Performance:** Framer Motion animations strictly utilize GPU-accelerated CSS properties (`transform`, `opacity`). Layout-invalidating animations (like animating `width` or `height`) are minimized or handled via scale transitions.

## Re-render Prevention
- Heavy sub-components accept primitive values or memoized handlers.
- Context providers isolate sub-state objects to prevent unnecessary top-level application re-renders during slider inputs.
