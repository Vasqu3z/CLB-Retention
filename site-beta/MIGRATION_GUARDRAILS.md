# 🔒 Migration Guardrails (Read Before Copying Anything)

## Purpose
Ensure the beta redesign is adopted **exactly as delivered** across the entire site—no partial carryover of legacy pages or styles.

## Non-Negotiables
- **Replace every page with the provided beta page file.** Do not rebuild, remix, or merge with legacy layouts.
- **Adopt the beta visual language everywhere.** Fonts, spacing, and styling come from the new files; keep legacy styling only when no beta equivalent exists.
- **Do not create custom versions of tools/pages.** Use the shipped `LineupBuilder`, `Compare`, `TeamsIndex`, `PlayerProfile`, etc., verbatim.
- **Data wiring happens after visuals.** First land the new pages/components, then hook up Google Sheets.
- **One-to-one mapping.** For each route in `app/`, confirm it points to the corresponding `site-beta` page file before any data integration.

## What to Swap (examples)
- Home, Schedule, Players, Teams index, Team details, Player profile, Lineup Builder, Compare, 404—not just the “core” pages.
- All shared UI (Header, Footer, Sidebar, Retro components, globals/tailwind config) from `site-beta`.

Keep this open while migrating to avoid drifting back to legacy UI or ad-hoc rewrites.
