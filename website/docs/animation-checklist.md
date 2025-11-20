# Animation Pre-Ship Checklist

Use this checklist to validate any motion changes before merging:

- **Durations:** Use `motionTokens` duration presets (≤280ms) and avoid custom values outside the system.
- **Easing:** Choose from the standard cubic-bezier curves (`spring`, `smoothEaseOut`, `fastResponse`) for consistency.
- **Reduced Motion:** Verify all animated elements respect `prefers-reduced-motion` (no movement or instant opacity changes when enabled).
- **Variants:** Reuse overlay, drawer, hover, and section/page variants instead of bespoke transitions.
- **Properties:** Favor opacity, scale, and short translations/rotations; avoid excessive blur or long-distance movement.
- **Performance:** Limit simultaneous animations, remove unnecessary `box-shadow` animations, and keep GPU-accelerated transforms minimal.
- **Interaction States:** Ensure hover/focus/active behaviors share timing and easing, and that focus styles remain visible when animations are disabled.
