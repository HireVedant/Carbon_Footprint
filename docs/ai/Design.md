# EcoTrack AI Design System & Aesthetics

## Design Philosophy
EcoTrack AI combines modern dark-mode glassmorphism with high-contrast emerald and teal accents. The aesthetic conveys environmental responsibility while retaining a sleek, high-tech, enterprise feel.

## Tokens & Theme

### Colors
- **Void Background:** `var(--bg-void)` (#05080A / ultra-dark void)
- **Primary Eco Accent:** `var(--color-primary)` (#10B981 / Emerald 500)
- **Secondary Accent:** `var(--color-secondary)` (#0DCA8C / Mint Teal)
- **Info Accent:** `var(--color-info)` (#06B6D4 / Cyan 500)
- **Glass Surfaces:** `.glass-eco` (`rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(16px)` and subtle white/10 borders)

### Typography
- **Display Font:** `Space Grotesk` or `Manrope` for bold headers and big numerical indicators.
- **Body Font:** `Inter` for clean legibility across form inputs and dense data tables.

## Accessibility Guidelines (WCAG 2.2 AA)
- Text contrast ratios must meet 4.5:1 against glass surfaces.
- Custom range sliders must include `aria-label`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- All icon-only buttons must provide explicit `aria-label` text for screen readers.
- Keyboard navigation must support standard focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
