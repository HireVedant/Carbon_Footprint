# Quick Wins

These are low-risk, fast improvements that yield immediate benefits without architectural changes.

1. **Create `APP_NAME` Constant**
   - **Time:** 10 mins
   - **Risk:** Very Low
   - **Related Epic:** Epic 8 (Branding)
   - *Status: Completed during Epic 0.5 preparation.*

2. **Fix Password Icon Overlap**
   - **Description:** Replace absolute `top-[38px]` positioning on the `EyeOff` toggle in Auth forms with a flex container.
   - **Time:** 15 mins
   - **Risk:** Very Low
   - **Related Epic:** Epic 1 (Authentication Stabilization)

3. **Constrain Assessment Modal Height**
   - **Description:** Add `max-h-[70vh] overflow-y-auto` to the dynamic sections (Food/Transport) to prevent the "Next" button from disappearing.
   - **Time:** 15 mins
   - **Risk:** Low
   - **Related Epic:** Epic 3 (Assessment Stabilization)

4. **Replace `<Leaf>` Logo with SVG Component**
   - **Description:** Use a proper, scalable SVG asset for the Navbar instead of a generic Lucide icon.
   - **Time:** 20 mins
   - **Risk:** Very Low
   - **Related Epic:** Epic 8 (Branding)

5. **Stop Distracting Pulse Animations**
   - **Description:** Remove `animate-pulse` from background gradients in `Home.tsx` and `Community.tsx`.
   - **Time:** 10 mins
   - **Risk:** Very Low
   - **Related Epic:** Epic 7 (Motion System)
