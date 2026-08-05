# Motion Inventory

## Motion Library Usage
- **Library:** Framer Motion (`framer-motion`) is heavily utilized across the application.
- **Primary Use Case:** Page transitions (`<motion.div>`), mounting reveals, and hover effects.

## Existing Animation Types

### 1. Reveals (Fade & Slide Up)
- **Usage:** Almost every container on the Home, Dashboard, and Community pages.
- **Parameters:** Usually `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`.
- **Issue:** Overused. Pages feel "waterfall-like" when mounting, diluting the perceived speed of the app.

### 2. Continuous Animations (Pulse & Float)
- **Usage:** Decorative backgrounds and "live" indicators.
- **Issue:** Aggressive use of `animate-pulse` is distracting and reduces the premium feel.

### 3. Hover Effects
- **Usage:** Mostly handled by CSS (`transition-all duration-300 hover:scale-105`), bypassing Framer Motion.

## Motion Guidelines (Baseline Assessment)

- **Durations:** Inconsistent. CSS transitions use `300ms`, Framer Motion defaults are used elsewhere.
- **Easing:** Default physical parameters rather than custom snappy/gentle springs.
- **Layout Animations:** Missing. Adding items to dynamic lists (like Food/Transport in Assessment) causes abrupt layout shifts.

*Note: As per the PEP, decorative looping animations must be eliminated in favor of intentional data and layout transitions using standardized spring tokens.*
