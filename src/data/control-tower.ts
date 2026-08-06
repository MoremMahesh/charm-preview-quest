export const GREEN = "#1a9d5c";
export const AMBER = "#c07a12";
export const RED = "#dc2f2b";
export const ACH_GREEN = "#22c07a";

/** 12% tint of a hex colour, matching the original wireframe's `mix()` helper. */
export const tint = (hex: string) => `${hex}1f`;

export type Status = "green" | "amber" | "red";
export type VariantKey = "all" | "gmax" | "neo" | "plus";

export const statusColor = (s: Status) => (s === "green" ? GREEN : s === "amber" ? AMBER : RED);
export const statusLabel = (s: Status) =>
  s === "green" ? "ACHIEVABLE" : s === "amber" ? "RISK" : "STOP RISK";

export const TREND: Record<number, string> = {
  3: "Turned Amber today",
  8: "Turned Amber today",
  11: "Red for 2 days",
  12: "Turned Red today",
  13: "Predicted Amber → Red in 2 days",
  19: "Flipped Green → Red overnight (new sales orders)",
  20: "Turned Amber today",
  24: "Turned Amber today",
  27: "Turned Red today",
};

export type DetailRow = {
  component: string;
  stock: number;
  asn: number;
  safety: number;
  required: number;
  net: number;
  status: "RED" | "AMBER" | "GREEN";
};

export type DayDetail = {
  variant: string;
  component: string;
  loss: number;
  rootCauseSummary: string;
  rows: DetailRow[];
  po: { number: string; vendor: string; status: string; badge: string };
};

export const DETAIL: Record<number, DayDetail> = {
  11: {
    variant: "GMAX / NEO",
    component: "Battery Pack — Cell Module",
    loss: 210,
    rootCauseSummary: "Battery Pack deficit, second consecutive Red day.",
    rows: [
      {
        component: "Battery Pack — Cell Module",
        stock: 540,
        asn: 120,
        safety: 400,
        required: 940,
        net: -260,
        status: "RED",
      },
    ],
    po: {
      number: "4500098210",
      vendor: "Exide Energy Solutions",
      status: "ASN delayed 3 days",
      badge: "Delayed",
    },
  },
  12: {
    variant: "GMAX",
    component: "Battery Pack",
    loss: 350,
    rootCauseSummary:
      "Battery Pack falls short of required quantity even after ignoring safety stock.",
    rows: [
      {
        component: "Battery Pack — Cell Module",
        stock: 620,
        asn: 150,
        safety: 400,
        required: 1080,
        net: -310,
        status: "RED",
      },
    ],
    po: {
      number: "4500098231",
      vendor: "Exide Energy Solutions",
      status: "ASN delayed 3 days",
      badge: "Delayed",
    },
  },
  13: {
    variant: "GMAX",
    component: "Battery Pack",
    loss: 120,
    rootCauseSummary: "Safety stock breached; production still achievable without buffer.",
    rows: [
      {
        component: "Battery Pack — Cell Module",
        stock: 710,
        asn: 180,
        safety: 400,
        required: 860,
        net: 30,
        status: "AMBER",
      },
    ],
    po: {
      number: "4500098231",
      vendor: "Exide Energy Solutions",
      status: "ASN delayed 3 days",
      badge: "Delayed",
    },
  },
  19: {
    variant: "NEO",
    component: "Motor Controller (shared, 4 SKU models)",
    loss: 480,
    rootCauseSummary: "Common component — demand aggregated across all 4 SKU models using it.",
    rows: [
      {
        component: "Motor Controller — 60V",
        stock: 380,
        asn: 60,
        safety: 250,
        required: 920,
        net: -480,
        status: "RED",
      },
    ],
    po: {
      number: "4500097760",
      vendor: "Sona Comstar",
      status: "ASN on time, insufficient qty",
      badge: "On time",
    },
  },
  20: {
    variant: "PLUS",
    component: "Wiring Harness",
    loss: 140,
    rootCauseSummary: "Safety stock breached on wiring harness; no stoppage expected.",
    rows: [
      {
        component: "Wiring Harness — Front",
        stock: 310,
        asn: 90,
        safety: 180,
        required: 420,
        net: 20,
        status: "AMBER",
      },
    ],
    po: {
      number: "4500097902",
      vendor: "Motherson Sumi",
      status: "On schedule",
      badge: "On time",
    },
  },
  27: {
    variant: "GMAX",
    component: "Battery Pack",
    loss: 300,
    rootCauseSummary: "Battery Pack deficit recurs; ASN still delayed.",
    rows: [
      {
        component: "Battery Pack — Cell Module",
        stock: 410,
        asn: 130,
        safety: 400,
        required: 900,
        net: -360,
        status: "RED",
      },
    ],
    po: {
      number: "4500098231",
      vendor: "Exide Energy Solutions",
      status: "ASN delayed 3 days",
      badge: "Delayed",
    },
  },
};

const G: Status = "green";
const A: Status = "amber";
const R: Status = "red";

function buildStatusMap(pattern: Status[]): Record<number, Status> {
  const m: Record<number, Status> = {};
  pattern.forEach((s, i) => {
    m[i + 1] = s;
  });
  return m;
}

const byVariant: Record<VariantKey, Record<number, Status>> = {
  all: {},
  gmax: buildStatusMap([
    G, G, A, A, G, G, G, A, G, G, R, R, A, G, G, G, G, G, A, A, G, G, G, R, G, G, R, G, G, G,
  ]),
  neo: buildStatusMap([
    G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, A, R, G, G, G, G, A, G, G, R, G, G, R,
  ]),
  plus: buildStatusMap([
    G, G, G, G, G, G, G, A, G, G, G, G, G, G, G, G, G, G, G, A, G, G, G, G, A, G, G, G, G, G,
  ]),
};

function mergedStatusMap(): Record<number, Status> {
  const m: Record<number, Status> = {};
  for (let d = 1; d <= 30; d++) {
    const s = (["gmax", "neo", "plus"] as const).map((v) => byVariant[v][d]);
    m[d] = s.includes("red") ? "red" : s.includes("amber") ? "amber" : "green";
  }
  return m;
}
byVariant.all = mergedStatusMap();

export const CAL_STATUS_BY_VARIANT = byVariant;

export const VARIANT_BASE: Record<VariantKey, number> = {
  all: 1200,
  gmax: 560,
  neo: 430,
  plus: 285,
};
export const VARIANT_LABEL: Record<VariantKey, string> = {
  all: "All variants",
  gmax: "MAGNUS GMAX",
  neo: "MAGNUS NEO",
  plus: "MAGNUS PLUS",
};

export type ChartPoint = {
  label: string;
  day: number;
  plan: number;
  ach: number;
  status: Status;
};

function buildChart(variantKey: VariantKey): ChartPoint[] {
  const statuses = CAL_STATUS_BY_VARIANT[variantKey];
  const base = VARIANT_BASE[variantKey];
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const st = statuses[day] as Status;
    const plan = Math.round(base - (day % 5) * (base * 0.008));
    const factor =
      st === "red"
        ? 0.4 + (day % 3) * 0.05
        : st === "amber"
          ? 0.76 + (day % 3) * 0.03
          : 0.95 + (day % 3) * 0.015;
    return { label: `Aug ${day}`, day, plan, ach: Math.round(plan * factor), status: st };
  });
}

export const CHARTS: Record<VariantKey, ChartPoint[]> = {
  all: buildChart("all"),
  gmax: buildChart("gmax"),
  neo: buildChart("neo"),
  plus: buildChart("plus"),
};

export const CHART_NOTE: Record<VariantKey, string> = {
  all: "Aug 12: achievable output well below plan across the fleet",
  gmax: "Aug 12: GMAX achievable output 350 below plan — Battery Pack deficit",
  neo: "Aug 19: NEO flips Green → Red overnight — Motor Controller demand from 4 SKU models",
  plus: "No stop-risk days projected for PLUS in the current window",
};

export type KpiSet = {
  feasible: number;
  riskTotal: string;
  amberCount: number;
  redCount: number;
  loss: string;
  lossSub: string;
  critical: string;
  criticalSub: string;
  varRisk: string;
  varRiskSub: string;
};

export const VARIANT_KPIS: Record<VariantKey, KpiSet> = {
  all: {
    feasible: 23,
    riskTotal: "7",
    amberCount: 4,
    redCount: 3,
    loss: "1,450",
    lossSub: "vehicles exposed",
    critical: "8",
    criticalSub: "3 require action",
    varRisk: "2",
    varRiskSub: "GMAX leads impact",
  },
  gmax: {
    feasible: 20,
    riskTotal: "10",
    amberCount: 6,
    redCount: 4,
    loss: "980",
    lossSub: "vehicles exposed",
    critical: "3",
    criticalSub: "battery-led",
    varRisk: "1",
    varRiskSub: "GMAX only",
  },
  neo: {
    feasible: 25,
    riskTotal: "5",
    amberCount: 2,
    redCount: 3,
    loss: "480",
    lossSub: "vehicles exposed",
    critical: "2",
    criticalSub: "motor controller-led",
    varRisk: "1",
    varRiskSub: "NEO only",
  },
  plus: {
    feasible: 27,
    riskTotal: "3",
    amberCount: 3,
    redCount: 0,
    loss: "140",
    lossSub: "vehicles exposed",
    critical: "1",
    criticalSub: "wiring harness",
    varRisk: "0",
    varRiskSub: "no stoppage expected",
  },
};

export const VARIANT_SUBTITLE: Record<VariantKey, string> = {
  all: "23 feasible days; battery supply creates the largest near-term exposure.",
  gmax: "20 of 30 days feasible; Battery Pack shortage is the dominant blocker.",
  neo: "25 of 30 days feasible; a shared Motor Controller shortage flips Aug 19 overnight.",
  plus: "27 of 30 days feasible; a single wiring-harness safety-stock breach.",
};

export type Alert = {
  id: string;
  title: string;
  detail: string;
  severity: string;
  color: string;
  pushed: string;
  variants: VariantKey[];
  notifiable: boolean;
  vendor?: string;
  fullDescription: string;
};

export const ALERTS: Alert[] = [
  {
    id: "a1",
    title: "Battery Pack turns Red in 3 days",
    detail: "GMAX · Aug 12 · 350 vehicles projected loss",
    severity: "RED",
    color: RED,
    pushed: "Auto-pushed today 09:12",
    variants: ["gmax"],
    notifiable: true,
    vendor: "Exide Energy Solutions",
    fullDescription:
      "Battery Pack — Cell Module net ATP for GMAX is projected to fall to -310 units by Aug 12, driven by a 3-day ASN delay from Exide Energy Solutions. If uncorrected, this stops production of GMAX for an estimated 350 vehicles. Recommend expediting the delayed ASN or releasing safety stock.",
  },
  {
    id: "a2",
    title: "Supplier ASN delayed",
    detail: "Exide Energy Solutions · 3 days late",
    severity: "HIGH",
    color: AMBER,
    pushed: "Auto-pushed today 08:40",
    variants: ["gmax"],
    notifiable: true,
    vendor: "Exide Energy Solutions",
    fullDescription:
      "PO 4500098231 with Exide Energy Solutions for Battery Pack — Cell Module is running 3 days behind its committed ASN date. This is the root cause behind the Aug 11–13 Red/Amber window for GMAX. No revised ETA has been received from the vendor portal yet.",
  },
  {
    id: "a3",
    title: "Common component critical",
    detail: "Motor Controller impacts 4 SKU models · blast radius",
    severity: "RED",
    color: RED,
    pushed: "Auto-pushed yesterday 18:05",
    variants: ["neo"],
    notifiable: false,
    vendor: "Sona Comstar",
    fullDescription:
      "Motor Controller — 60V is shared across 4 SKU models. Aggregated demand against a single supply pool pushes net ATP to -480 units on Aug 19, giving this shortage a wide blast radius beyond NEO alone. Sona Comstar has confirmed ASN on time but at insufficient quantity for combined demand.",
  },
  {
    id: "a4",
    title: "Day flipped overnight",
    detail: "Aug 19: Green → Red after new sales orders posted",
    severity: "RED",
    color: RED,
    pushed: "Auto-pushed today 06:00",
    variants: ["neo"],
    notifiable: false,
    fullDescription:
      "Aug 19 was Green as of yesterday’s close. Overnight, new sales orders increased required quantity for Motor Controller — 60V beyond available net ATP, flipping the day to Red. This is a demand-side shift, not a supply delay — review the new orders for feasibility before committing to the customer date.",
  },
  {
    id: "a6",
    title: "Wiring harness ASN watch",
    detail: "Motherson Sumi · on schedule, safety stock breached",
    severity: "AMBER",
    color: AMBER,
    pushed: "Auto-pushed today 07:30",
    variants: ["plus"],
    notifiable: false,
    vendor: "Motherson Sumi",
    fullDescription:
      "Wiring Harness — Front for PLUS is tracking on schedule from Motherson Sumi, but current stock plus incoming ASN sits just above required quantity, breaching safety stock buffer on Aug 20. No stoppage is projected; monitoring for any additional demand pull-forward.",
  },
];

/** Calendar grid: August starts on a Saturday in this wireframe. */
export const GRID: (number | null)[] = [
  null, null, null, null, null, null, 1,
  2, 3, 4, 5, 6, 7, 8,
  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29,
  30, null, null, null, null, null, null,
];

export const VARIANT_OPTIONS = [
  { value: "all", label: "All variants" },
  { value: "gmax", label: "MAGNUS GMAX" },
  { value: "neo", label: "MAGNUS NEO" },
  { value: "plus", label: "MAGNUS PLUS" },
] as const;

export const CALENDAR_VARIANT_OPTIONS = VARIANT_OPTIONS.filter((o) => o.value !== "all");

export const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "ev2w", label: "EV 2W" },
];

export const PLANT_OPTIONS = [
  { value: "all", label: "All Plants" },
  { value: "ranipet", label: "Ranipet" },
];
