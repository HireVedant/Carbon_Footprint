# UI Inventory

## UI Primitives Present (and their states)

### 1. Buttons
- **Implementations:** No centralized `<Button>` component exists.
- **Styling:** Highly repetitive. Buttons typically use `bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-300`.
- **Issues:** Hardcoded hover states, missing standard disabled styles, missing loading spinners within buttons.

### 2. Cards
- **Implementations:** No `<Card>` component.
- **Styling:** "Glassmorphism" is implemented inline globally using `bg-white/10 backdrop-blur-md border border-white/20`.
- **Issues:** Varying border opacities (`white/10` vs `white/20`) and inconsistent border radii (`rounded-2xl` vs `rounded-xl`).

### 3. Inputs
- **Implementations:** Used natively in forms.
- **Issues:** No centralized `<Input>`. Password toggles overlap due to absolute positioning (`top-[38px]`).

### 4. Badges & Dialogs
- **Implementations:** No standard implementations. Alerts and badges are built ad-hoc.

## Visual Inconsistencies & Issues

- **Hardcoded Colors:** Widespread use of `text-emerald-400`, `bg-cyan-500/20`, bypassing the central design tokens in `src/design/colors.ts`.
- **Spacing:** Magic numbers are frequent (e.g., `h-[340px]`, `top-[38px]`) breaking the grid rhythm.
- **Typography:** Classes like `text-[10px]` and `text-[11px]` are used inline, degrading accessibility and readability.
- **Accessibility Concerns:** Lack of ARIA labels on dynamic elements, insufficient color contrast on small text over glass backgrounds.
