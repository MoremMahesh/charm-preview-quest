export const GREEN = "#1a9d5c";
export const AMBER = "#c07a12";
export const RED = "#dc2f2b";
export const ACH_GREEN = "#22c07a";

/** 12% tint of a hex colour, matching the original wireframe's `mix()` helper. */
export const tint = (hex: string) => `${hex}1f`;

export type Status = "green" | "amber" | "red";
export type VariantKey = "all" | "gmax" | "neo" | "plus";
export type RealVariant = Exclude<VariantKey, "all">;

export const REAL_VARIANTS: RealVariant[] = ["gmax", "neo", "plus"];
export const DAYS = 30;

export const statusColor = (s: Status) => (s === "green" ? GREEN : s === "amber" ? AMBER : RED);
export const statusLabel = (s: Status) =>
  s === "green" ? "ACHIEVABLE" : s === "amber" ? "RISK" : "STOP RISK";

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
  for (let d = 1; d <= DAYS; d++) {
    const s = REAL_VARIANTS.map((v) => byVariant[v][d]);
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
  plus: 210,
};
export const VARIANT_LABEL: Record<VariantKey, string> = {
  all: "All variants",
  gmax: "MAGNUS GMAX",
  neo: "MAGNUS NEO",
  plus: "MAGNUS PLUS",
};

type ComponentSpec = {
  name: string;
  short: string;
  safety: number;
  po: string;
  vendor: string;
  poStatus: string;
  poBadge: "Delayed" | "On time";
};

export const VARIANT_COMPONENT: Record<RealVariant, ComponentSpec> = {
  gmax: {
    name: "Battery Pack — Cell Module",
    short: "Battery Pack",
    safety: 400,
    po: "4500098231",
    vendor: "Exide Energy Solutions",
    poStatus: "ASN delayed 3 days",
    poBadge: "Delayed",
  },
  neo: {
    name: "Motor Controller — 60V",
    short: "Motor Controller (shared, 4 SKU models)",
    safety: 250,
    po: "4500097760",
    vendor: "Sona Comstar",
    poStatus: "ASN on time, insufficient qty",
    poBadge: "On time",
  },
  plus: {
    name: "Wiring Harness — Front",
    short: "Wiring Harness",
    safety: 180,
    po: "4500097902",
    vendor: "Motherson Sumi",
    poStatus: "On schedule",
    poBadge: "On time",
  },
};

export type DayAtp = {
  day: number;
  status: Status;
  plan: number;
  required: number;
  safety: number;
  stock: number;
  asn: number;
  available: number;
  net: number;
  ach: number;
  loss: number;
};

function planFor(variant: RealVariant, day: number) {
  const base = VARIANT_BASE[variant];
  return Math.round(base - (day % 5) * (base * 0.008));
}

/** Single source of truth: one ATP calculation per variant/day. */
export function atp(variant: RealVariant, day: number): DayAtp {
  const status = CAL_STATUS_BY_VARIANT[variant][day] ?? "green";
  const plan = planFor(variant, day);
  const safety = VARIANT_COMPONENT[variant].safety;

  let available: number;
  if (status === "red") {
    const deficit = 60 + ((day * 37) % 5) * 50;
    available = plan - deficit;
  } else if (status === "amber") {
    available = plan + Math.round(safety * 0.1) + ((day * 13) % 3) * 10;
  } else {
    available = plan + safety + 50 + ((day * 17) % 4) * 40;
  }

  const stock = Math.round(available * 0.78);
  const asn = available - stock;
  const ach = Math.min(available, plan);

  return {
    day,
    status,
    plan,
    required: plan,
    safety,
    stock,
    asn,
    available,
    net: available - plan,
    ach,
    loss: Math.max(0, plan - ach),
  };
}

export type ChartPoint = {
  label: string;
  day: number;
  plan: number;
  ach: number;
  status: Status;
  loss: number;
};

function buildChart(variantKey: VariantKey): ChartPoint[] {
  return Array.from({ length: DAYS }, (_, i) => {
    const day = i + 1;
    if (variantKey === "all") {
      const parts = REAL_VARIANTS.map((v) => atp(v, day));
      return {
        label: `Aug ${day}`,
        day,
        plan: parts.reduce((s, p) => s + p.plan, 0),
        ach: parts.reduce((s, p) => s + p.ach, 0),
        status: CAL_STATUS_BY_VARIANT.all[day] ?? "green",
        loss: parts.reduce((s, p) => s + p.loss, 0),
      };
    }
    const a = atp(variantKey, day);
    return { label: `Aug ${day}`, day, plan: a.plan, ach: a.ach, status: a.status, loss: a.loss };
  });
}

export const CHARTS: Record<VariantKey, ChartPoint[]> = {
  all: buildChart("all"),
  gmax: buildChart("gmax"),
  neo: buildChart("neo"),
  plus: buildChart("plus"),
};

/** Max planned value in a chart, used to scale bars consistently. */
export const CHART_MAX: Record<VariantKey, number> = {
  all: Math.max(...CHARTS.all.map((p) => p.plan)),
  gmax: Math.max(...CHARTS.gmax.map((p) => p.plan)),
  neo: Math.max(...CHARTS.neo.map((p) => p.plan)),
  plus: Math.max(...CHARTS.plus.map((p) => p.plan)),
};

export const riskDays = (variant: VariantKey, status: Status) =>
  Array.from({ length: DAYS }, (_, i) => i + 1).filter(
    (d) => CAL_STATUS_BY_VARIANT[variant][d] === status,
  );

/** Trend text derived from the same status map the calendar renders. */
export function trendFor(variant: VariantKey, day: number): string | null {
  const map = CAL_STATUS_BY_VARIANT[variant];
  const st = map[day];
  if (!st || st === "green") return null;

  if (st === "red") {
    let run = 1;
    while (map[day - run] === "red") run++;
    return run === 1 ? "Turned Red today" : `Red for ${run} days`;
  }

  // amber: look ahead for an upcoming red
  for (let ahead = 1; ahead <= 3; ahead++) {
    if (map[day + ahead] === "red") {
      return `Predicted Amber → Red in ${ahead} day${ahead > 1 ? "s" : ""}`;
    }
  }
  let run = 1;
  while (map[day - run] === "amber") run++;
  return run === 1 ? "Turned Amber today" : `Amber for ${run} days`;
}

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
  day: number;
  status: Status;
  variant: string;
  component: string;
  loss: number;
  rootCauseSummary: string;
  rows: DetailRow[];
  po: { number: string; vendor: string; status: string; badge: string };
};

function summaryFor(variant: RealVariant, a: DayAtp): string {
  const c = VARIANT_COMPONENT[variant];
  if (a.status === "red")
    return `${c.short} falls short of required quantity even after consuming safety stock (${a.net} units net ATP).`;
  if (a.status === "amber")
    return `Safety stock breached on ${c.short}; production still achievable without the buffer.`;
  return `${c.short} covers required quantity with buffer intact.`;
}

/** Detail for any variant/day, always consistent with the calendar and chart. */
export function getDayDetail(variant: VariantKey, day: number): DayDetail {
  if (variant === "all") {
    const worst =
      REAL_VARIANTS.find((v) => CAL_STATUS_BY_VARIANT[v][day] === "red") ??
      REAL_VARIANTS.find((v) => CAL_STATUS_BY_VARIANT[v][day] === "amber") ??
      "gmax";
    return getDayDetail(worst, day);
  }

  const a = atp(variant, day);
  const c = VARIANT_COMPONENT[variant];
  return {
    day,
    status: a.status,
    variant: VARIANT_LABEL[variant].replace("MAGNUS ", ""),
    component: c.short,
    loss: a.loss,
    rootCauseSummary: summaryFor(variant, a),
    rows: [
      {
        component: c.name,
        stock: a.stock,
        asn: a.asn,
        safety: a.safety,
        required: a.required,
        net: a.net,
        status: a.status.toUpperCase() as "RED" | "AMBER" | "GREEN",
      },
    ],
    po: { number: c.po, vendor: c.vendor, status: c.poStatus, badge: c.poBadge },
  };
}

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

function buildKpis(variant: VariantKey): KpiSet {
  const amber = riskDays(variant, "amber");
  const red = riskDays(variant, "red");
  const feasible = DAYS - amber.length - red.length;
  const loss = CHARTS[variant].reduce((s, p) => s + p.loss, 0);

  const affected =
    variant === "all"
      ? REAL_VARIANTS.filter((v) => riskDays(v, "red").length + riskDays(v, "amber").length > 0)
      : riskDays(variant, "red").length + amber.length > 0
        ? [variant as RealVariant]
        : [];
  const atRisk =
    variant === "all"
      ? REAL_VARIANTS.filter((v) => riskDays(v, "red").length > 0)
      : red.length > 0
        ? [variant as RealVariant]
        : [];

  return {
    feasible,
    riskTotal: String(amber.length + red.length),
    amberCount: amber.length,
    redCount: red.length,
    loss: loss.toLocaleString(),
    lossSub: "vehicles exposed",
    critical: String(affected.length),
    criticalSub:
      affected.length === 0
        ? "none flagged"
        : affected.map((v) => VARIANT_COMPONENT[v].short.split(" (")[0]).join(", "),
    varRisk: String(atRisk.length),
    varRiskSub:
      atRisk.length === 0
        ? "no stoppage expected"
        : atRisk.map((v) => VARIANT_LABEL[v].replace("MAGNUS ", "")).join(", ") + " stop risk",
  };
}

export const VARIANT_KPIS: Record<VariantKey, KpiSet> = {
  all: buildKpis("all"),
  gmax: buildKpis("gmax"),
  neo: buildKpis("neo"),
  plus: buildKpis("plus"),
};

function buildSubtitle(variant: VariantKey): string {
  const k = VARIANT_KPIS[variant];
  const firstRed = riskDays(variant, "red")[0];
  const label = variant === "all" ? "the fleet" : VARIANT_LABEL[variant].replace("MAGNUS ", "");
  return firstRed
    ? `${k.feasible} of ${DAYS} days feasible for ${label}; first stop risk on Aug ${firstRed} with ${k.loss} vehicles exposed across the window.`
    : `${k.feasible} of ${DAYS} days feasible for ${label}; ${k.amberCount} safety-stock breaches, no stoppage projected.`;
}

export const VARIANT_SUBTITLE: Record<VariantKey, string> = {
  all: buildSubtitle("all"),
  gmax: buildSubtitle("gmax"),
  neo: buildSubtitle("neo"),
  plus: buildSubtitle("plus"),
};

function buildChartNote(variant: VariantKey): string {
  const worst = [...CHARTS[variant]].sort((a, b) => b.loss - a.loss)[0];
  if (!worst || worst.loss === 0)
    return `No stop-risk days projected for ${VARIANT_LABEL[variant]} in the current window`;
  const d = getDayDetail(variant, worst.day);
  return `Aug ${worst.day}: achievable output ${worst.loss} below plan — ${d.component} deficit`;
}

export const CHART_NOTE: Record<VariantKey, string> = {
  all: buildChartNote("all"),
  gmax: buildChartNote("gmax"),
  neo: buildChartNote("neo"),
  plus: buildChartNote("plus"),
};

export const firstRiskDay = (variant: VariantKey): number =>
  riskDays(variant, "red")[0] ?? riskDays(variant, "amber")[0] ?? 1;

export type Alert = {
  id: string;
  title: string;
  detail: string;
  severity: string;
  color: string;
  pushed: string;
  variants: RealVariant[];
  notifiable: boolean;
  vendor?: string;
  fullDescription: string;
};

function buildAlerts(): Alert[] {
  const list: Alert[] = [];

  for (const v of REAL_VARIANTS) {
    const c = VARIANT_COMPONENT[v];
    const label = VARIANT_LABEL[v].replace("MAGNUS ", "");
    const reds = riskDays(v, "red");
    const ambers = riskDays(v, "amber");

    if (reds.length) {
      const day = reds[0]!;
      const a = atp(v, day);
      list.push({
        id: `${v}-red`,
        title: `${c.short.split(" (")[0]} turns Red on Aug ${day}`,
        detail: `${label} · Aug ${day} · ${a.loss} vehicles projected loss`,
        severity: "RED",
        color: RED,
        pushed: "Auto-pushed today 09:12",
        variants: [v],
        notifiable: c.poBadge === "Delayed",
        vendor: c.vendor,
        fullDescription: `${c.name} net ATP for ${label} is projected to fall to ${a.net} units on Aug ${day} (required ${a.required}, stock ${a.stock}, incoming ASN ${a.asn}). If uncorrected this removes an estimated ${a.loss} vehicles from the plan. ${reds.length > 1 ? `${reds.length} Red days are projected in the window (Aug ${reds.join(", Aug ")}).` : ""}`,
      });
    }

    if (c.poBadge === "Delayed" && reds.length) {
      list.push({
        id: `${v}-po`,
        title: "Supplier ASN delayed",
        detail: `${c.vendor} · PO ${c.po} · 3 days late`,
        severity: "HIGH",
        color: AMBER,
        pushed: "Auto-pushed today 08:40",
        variants: [v],
        notifiable: true,
        vendor: c.vendor,
        fullDescription: `PO ${c.po} with ${c.vendor} for ${c.name} is running 3 days behind its committed ASN date. This is the root cause behind the ${label} risk window starting Aug ${reds[0]}. No revised ETA has been received from the vendor portal yet.`,
      });
    }

    if (ambers.length) {
      const day = ambers[0]!;
      const a = atp(v, day);
      list.push({
        id: `${v}-amber`,
        title: `${c.short.split(" (")[0]} safety stock breached`,
        detail: `${label} · Aug ${day} · buffer down to ${a.net} of ${a.safety}`,
        severity: "AMBER",
        color: AMBER,
        pushed: "Auto-pushed today 07:30",
        variants: [v],
        notifiable: false,
        vendor: c.vendor,
        fullDescription: `On Aug ${day}, ${c.name} for ${label} covers required quantity (${a.required}) with only ${a.net} units above requirement against a ${a.safety}-unit safety buffer. No stoppage is projected for this day; ${ambers.length} Amber days are flagged across the window.`,
      });
    }
  }

  return list;
}

export const ALERTS: Alert[] = buildAlerts();

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
