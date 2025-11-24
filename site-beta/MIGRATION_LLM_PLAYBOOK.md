# Beta Migration Playbook (LLM Edition)

Purpose-built instructions for coding agents. Follow these steps exactly to move every beta file into the production Next.js app without rewriting designs. Do **not** invent new layouts, components, or fonts. Copy the provided files, hook up imports, and wire real data **only after** visuals match the beta reference.

## Non‑negotiable rules
- Replace every corresponding production page/component with the supplied beta file. Do **not** rebuild from scratch or keep legacy styling if a beta version exists.
- Keep the beta font stack intact (Dela Gothic One display, Chivo body, Rajdhani UI, Space Mono mono). Do not swap or fall back to legacy fonts unless a file has no beta counterpart.
- Preserve component structure, props, and animations from the beta files. Only adjust imports/paths to fit the production App Router.
- Defer Google Sheets/data wiring until **after** the full visual migration is complete.
- If uncertainty arises, prefer the beta file’s markup and styling over existing app code.

## File-by-file map (what each file is and what to do with it)
- `Globals.css` → Replace `website/app/globals.css`. Carries neon theme tokens, gradients, typography utilities.
- `tailwind.config.ts` → Replace `website/tailwind.config.ts`. Ensures theme tokens/utilities match beta design.
- `utils.ts` → Replace `website/lib/utils.ts` or equivalent helper. Provides class merge/util helpers used across components.
- `Layout.tsx` → Replace `website/app/layout.tsx`. Registers fonts and wraps app with beta shell.
- `Header.tsx` → Replace `website/components/Header.tsx`. New nav, marquee, and CTA styling.
- `Footer.tsx` → Replace `website/components/Footer.tsx`. Retro footer treatment and links.
- `Sidebar.tsx` → Replace `website/components/Sidebar.tsx`. Desktop sidebar navigation.
- `SidebarMobile.tsx` → Replace `website/components/SidebarMobile.tsx`. Mobile navigation overlay.
- `Homepage.tsx` → Replace `website/app/page.tsx`. Hero + highlights built with retro UI kit.
- `Schedule.tsx` → Replace `website/app/schedule/page.tsx` and supporting client file if present. Uses `VersusCard` and motion.
- `PlayersPage.tsx` → Replace `website/app/players/page.tsx` plus client wrapper. Uses `RetroTable`.
- `TeamsIndex.tsx` → Replace `website/app/teams/page.tsx`. Team selection grid with retro cards.
- `TeamDetails.tsx` → Replace `website/app/teams/[slug]/page.tsx` (and client). Team detail view with holographic field + stat sections.
- `PlayerProfile.tsx` → Replace `website/app/players/[slug]/page.tsx` (and view components). Beta player profile layout.
- `StandingsTable.tsx` → Replace standings view in teams/standings route. Uses retro table styling.
- `LineupBuilder.tsx` → Replace `website/app/tools/lineup/page.tsx` (and client). Includes holographic field, chemistry, and selection UI. Copy as-is before data wiring.
- `Compare.tsx` → Replace `website/app/tools/compare/page.tsx` (and client). H2H compare layout with proper spacing/container.
- `404.tsx` → Replace `website/app/not-found.tsx`. Retro 404 treatment.
- `LoadingPatterns.tsx` → Use for loading states where needed; copy into `components/ui` or route-level `loading.tsx` implementations.
- `LoadScreen.tsx` → Optional global/route loading experience; integrate if project uses splash loads.
- `RetroButton.tsx` → Add to `website/components/ui/RetroButton.tsx`. Core retro button with motion effects.
- `RetroCard.tsx` → Add to `website/components/ui/RetroCard.tsx`. Card shell for retro styling.
- `RetroLoader.tsx` → Add to `website/components/ui/RetroLoader.tsx`. Loader visuals.
- `RetroTable.tsx` → Add to `website/components/ui/RetroTable.tsx`. Table component with sorting styles.
- `StatHighlight.tsx` → Add to `website/components/ui/StatHighlight.tsx`. Metric spotlight blocks.
- `TeamSelectCard.tsx` → Add to `website/components/ui/TeamSelectCard.tsx`. Team grid cards.
- `VersusCard.tsx` → Add to `website/components/ui/VersusCard.tsx`. Matchup display.
- `HolographicField.tsx` → Add to `website/components/ui/HolographicField.tsx`. Animated field overlay used by lineup/team detail pages.
- `Load patterns assets` (e.g., `grid-pattern.svg` in repo) → Ensure copied to `website/public` as required by components.
- `PAGE_UPDATES_SUMMARY.md` → Read-only reference summarizing beta deltas; no code change required.
- `MIGRATION_STATUS.md` → Reference file listing beta deliverables; keep for tracking.
- `MIGRATION_CHECKLIST.md` → Operational checklist; follow sequence but reference this playbook for exact file actions.
- `MIGRATION_GUARDRAILS.md` → Policy doc reinforcing full replacements; keep aligned with this playbook.
- `START_HERE.md` / `README.md` / `QUICK_REFERENCE.md` / `component-review-recommendations.md` / `dependencies.json` / `StandingsTableImplementation.txt` / `Site Beta Implementation Plan.md` → Supporting guidance. Read for context; do not override the beta code with custom inventions.

## Execution order (apply to the production app)
1. **Foundation:** Copy `Globals.css`, `tailwind.config.ts`, `utils.ts`, `Layout.tsx`, and public assets. Verify fonts and theme tokens are active.
2. **Navigation shell:** Replace `Header.tsx`, `Footer.tsx`, `Sidebar.tsx`, `SidebarMobile.tsx` to match beta chrome.
3. **UI kit:** Add all retro UI components (`RetroButton`, `RetroCard`, `RetroLoader`, `RetroTable`, `StatHighlight`, `TeamSelectCard`, `VersusCard`, `HolographicField`). Update imports to point to `components/ui/*`.
4. **Pages:** Replace every route with its beta counterpart (`Homepage`, `Schedule`, `PlayersPage`, `TeamsIndex`, `TeamDetails`, `PlayerProfile`, `StandingsTable`, `LineupBuilder`, `Compare`, `404`). Do not mix legacy components.
5. **Loading/aux views:** Integrate `LoadingPatterns.tsx` and `LoadScreen.tsx` where loading states are needed, using the beta visuals.
6. **Data wiring (after visuals match):** Connect Google Sheets data sources to the migrated pages/components, preserving the beta layouts and props.

## Final goal
A production app where **every** page and shared component matches the shipped beta design and font treatment, with zero legacy styling left. Only after the visual swap is complete should data integrations be added.
