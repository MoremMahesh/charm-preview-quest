# Production Control Tower — React rebuild

Your uploaded file is a self-extracting bundle of a "Production Control Tower" wireframe (a dark sidebar shell with an Executive Summary screen and a 30-Day Production Calendar screen, driven by mock supply-chain data). I unpacked it and read both the markup and the state logic, so I can rebuild it faithfully as a real React app on this project's stack and give you a live preview URL.

Note: this project is already React (TanStack Start), so there's no non-React shortcut — rebuilding it in React is the path to a working preview.

## What gets built

**App shell**
- Dark sidebar: "CT / Control Tower" logo, nav items (Executive Summary, 30-Day Calendar active; Operations, Procurement disabled), footer note "Illustrative wireframe — not live GEML data".
- Top bar: dynamic page title, bell with unread alert count badge, "PM" avatar.

**Screen 1 — Executive Summary**
- Filter bar: Vehicle Variant (All / MAGNUS GMAX / NEO / PLUS), SKU Category, Plant, plus static Planning Horizon (30 days) and Production Capacity (1,200/day). A "30-Day Calendar" button appears when a specific variant is selected.
- 5 KPI cards (Feasible days, Risk days, Production loss, Critical components, Variants at risk) whose values switch per variant. The Risk-days card keeps its amber/red chips with hover tooltips listing the affected days.
- Plan vs achievable bar chart, 10-day by default with an "Expand to 30 days" toggle, bars coloured green/amber/red by day status, plus the per-variant chart note.
- Alerts panel: variant-filtered alert cards; clicking one opens a detail modal with full description, vendor, and a "re-push" action that flips to a confirmed state.

**Screen 2 — 30-Day Production Calendar**
- Month grid (Aug 1–30) with correct weekday offset, cells tinted green/amber/red per selected variant, selected-day ring, trend notes ("Turned Red today", "Flipped Green → Red overnight", etc.). Non-green days are clickable.
- Selected-day detail: status tag, variant, projected vehicle loss, root-cause summary, component table (stock / ASN / safety / required / net ATP with colour-coded net), and the linked PO card with vendor, delay status, and a "Notify vendor" action that switches to a notified state.

All data (variant status maps, KPI sets, chart series, alerts, day details, PO records) is ported verbatim from the bundle into typed modules, so the rebuilt app shows exactly the same numbers.

## Technical approach

- New `src/components/control-tower/` folder: `Sidebar`, `TopBar`, `FilterBar`, `KpiRow`, `PlanChart`, `AlertsPanel`, `AlertModal`, `CalendarGrid`, `DayDetailPanel`.
- Static data + helpers in `src/data/control-tower.ts` (status maps, chart builder, KPIs, alerts, details) — pure and SSR-safe.
- Screen state (screen, selectedDay, variant/category/plant, modals, notified/re-pushed flags, hovered chip) held in one `useState` object in the page component, mirroring the original class state.
- Routes: `/` renders Executive Summary, `/calendar` renders the calendar screen, sharing state via a small context so filters persist between them; the placeholder index page is replaced. Each route gets its own `head()` metadata.
- Inline hex colours from the wireframe are converted into semantic tokens in `src/styles.css` (dark navy shell, indigo accent, green/amber/red status colours) and used via Tailwind classes rather than inline styles.
- Inter font loaded via a `<link>` in `__root.tsx`, matching the original.
- No backend needed — everything is static mock data.
