# Dependency Audit

## Installed Packages

### Dependencies
- **chart.js (^4.5.1) & react-chartjs-2 (^5.3.1):** Used for rendering graphs in the Dashboard and Community views.
- **firebase (^12.15.0):** Core backend provider (Auth, Firestore).
- **framer-motion (^11.18.0):** Animation library used for page transitions and element reveals.
- **jspdf (^4.2.1) & jspdf-autotable (^5.0.8):** Used for generating downloadable carbon footprint reports.
- **lottie-react (^2.4.1):** Rendering Lottie animations (likely loading or success states).
- **lucide-react (^0.468.0):** SVG icon library.
- **prop-types (^15.8.1):** Runtime type checking.
- **react (^19.0.0) & react-dom (^19.0.0):** Core framework.
- **react-router-dom (^7.1.0):** Application routing.
- **react-simple-maps (^3.0.0):** Map visualization (used in Community dashboard).

### DevDependencies
- **Vite & Vitest:** Build and testing tools.
- **Tailwind CSS & Autoprefixer:** Utility-first styling.
- **TypeScript:** Static typing.

## Audit Findings

- **Unused/Redundant Packages:** `prop-types` is installed but likely redundant given this is a TypeScript project.
- **Duplicate Packages:** None found at the top level.
- **Potential Upgrade Candidates:** None required immediately. React 19 is bleeding-edge.
- **Bundle Impact:** `framer-motion`, `chart.js`, and `firebase` are the heaviest dependencies. They should be lazy-loaded or tree-shaken where possible.

*Note: No upgrades or removals will be performed at this stage.*
