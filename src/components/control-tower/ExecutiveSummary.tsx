import { useNavigate } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ACH_GREEN,
  AMBER,
  CATEGORY_OPTIONS,
  CHARTS,
  CHART_NOTE,
  CAL_STATUS_BY_VARIANT,
  GREEN,
  PLANT_OPTIONS,
  RED,
  VARIANT_BASE,
  VARIANT_KPIS,
  VARIANT_LABEL,
  VARIANT_OPTIONS,
  VARIANT_SUBTITLE,
  statusLabel,
  tint,
  type VariantKey,
} from "@/data/control-tower";
import { useControlTower } from "./state";

const selectClass =
  "mt-1.5 w-full rounded-lg border border-[#dcdfe6] bg-white px-2 py-2 pr-6 text-[12.5px] text-ct-ink";
const labelClass =
  "text-[11px] font-semibold tracking-[0.03em] text-ct-muted uppercase";

function FilterBar() {
  const { selectedVariant, selectedCategory, selectedPlant, set } = useControlTower();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col gap-3.5 rounded-xl border border-ct-line bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="grid gap-5 md:grid-cols-[1fr_1.3fr_1fr_0.85fr_1fr]">
        <div>
          <label className={labelClass}>Vehicle Variant</label>
          <select
            className={selectClass}
            value={selectedVariant}
            onChange={(e) =>
              set({ selectedVariant: e.target.value as VariantKey, chartExpanded: false })
            }
          >
            {VARIANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>SKU Category</label>
          <select
            className={selectClass}
            value={selectedCategory}
            onChange={(e) => set({ selectedCategory: e.target.value })}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Plant</label>
          <select
            className={selectClass}
            value={selectedPlant}
            onChange={(e) => set({ selectedPlant: e.target.value })}
          >
            {PLANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Planning Horizon</label>
          <div className="mt-1.5 px-2.5 py-2 text-[13.5px] font-semibold">30 days</div>
        </div>
        <div>
          <label className={labelClass}>Production Capacity</label>
          <div className="mt-1.5 px-2.5 py-2 text-[13.5px] font-semibold">1,200/day</div>
        </div>
      </div>

      {selectedVariant !== "all" && (
        <div className="border-t border-ct-line-soft pt-3.5 text-right">
          <button
            onClick={() => navigate({ to: "/calendar" })}
            className="rounded-lg bg-ct-shell px-4.5 py-2.5 text-[13px] font-semibold text-white"
          >
            📅 30-Day Calendar
          </button>
        </div>
      )}
    </section>
  );
}

function KpiRow() {
  const { selectedVariant, hoveredChip, set } = useControlTower();
  const k = VARIANT_KPIS[selectedVariant];
  const statuses = CAL_STATUS_BY_VARIANT[selectedVariant];
  const days = Object.keys(statuses).map(Number);
  const amberDays = days.filter((d) => statuses[d] === "amber");
  const redDays = days.filter((d) => statuses[d] === "red");

  const cards = [
    { label: "Feasible days", value: String(k.feasible), sub: "of 30 days", badge: "GREEN", color: GREEN, risk: false },
    { label: "Risk days", value: k.riskTotal, badge: "AMBER", color: AMBER, risk: true },
    { label: "Production loss", value: k.loss, sub: k.lossSub, color: RED, risk: false },
    { label: "Critical components", value: k.critical, sub: k.criticalSub, color: RED, risk: false },
    { label: "Variants at risk", value: k.varRisk, sub: k.varRiskSub, color: AMBER, risk: false },
  ] as const;

  const chip = (
    kind: "amber" | "red",
    count: number,
    color: string,
    border: string,
    list: number[],
  ) => (
    <div className="relative">
      <span
        onMouseEnter={() => set({ hoveredChip: kind })}
        onMouseLeave={() => set({ hoveredChip: null })}
        className="cursor-default rounded-md border-[1.5px] px-2 py-0.5 text-[11.5px] font-semibold"
        style={{ color, borderColor: border }}
      >
        {count} {kind}
      </span>
      {hoveredChip === kind && (
        <div
          onMouseEnter={() => set({ hoveredChip: kind })}
          onMouseLeave={() => set({ hoveredChip: null })}
          className="absolute top-[calc(100%+8px)] left-0 z-20 w-[220px] rounded-[10px] border border-ct-line bg-white px-3.5 py-3 shadow-[0_8px_24px_rgba(16,24,40,.12)]"
        >
          <div className="mb-1.5 text-[10.5px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            {kind === "amber" ? "Amber days" : "Red days"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {list.length === 0 && <span className="text-[11.5px] text-ct-muted">None</span>}
            {list.map((d) => (
              <span
                key={d}
                className="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold"
                style={{ background: tint(color), color }}
              >
                Aug {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className="flex gap-2.5 rounded-xl border border-ct-line bg-white shadow-[0_1px_2px_rgba(16,24,40,.04)]"
        >
          <div
            className="w-1 flex-none rounded-l-xl"
            style={{ background: c.color }}
          />
          <div className="min-w-0 flex-1 py-4 pr-4 pl-0.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="text-[12px] font-semibold whitespace-nowrap text-ct-muted">
                {c.label}
              </div>
              {"badge" in c && c.badge && (
                <span
                  className="flex-none rounded-full px-1.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap"
                  style={{ background: tint(c.color), color: c.color }}
                >
                  {c.badge}
                </span>
              )}
            </div>
            <div className="mt-2 text-[30px] font-extrabold text-ct-shell">{c.value}</div>
            {c.risk ? (
              <div className="mt-1.5 flex gap-2">
                {chip("amber", k.amberCount, "#8a6d00", "#e8b400", amberDays)}
                {chip("red", k.redCount, RED, RED, redDays)}
              </div>
            ) : (
              <div className="mt-1.5 text-[11.5px] text-ct-muted">{c.sub}</div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

function PlanChart() {
  const { selectedVariant, chartExpanded, set, variantLabel } = useControlTower();
  const base = VARIANT_BASE[selectedVariant];
  const scale = (v: number) => Math.max(4, Math.round((v / base) * 180));
  const points = CHARTS[selectedVariant];
  const shown = chartExpanded ? points : points.slice(0, 10);

  return (
    <div className="min-w-0 rounded-xl border border-ct-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[14px] font-bold">Planned vs. achievable — {variantLabel}</div>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-ct-muted">
            {chartExpanded ? "30-day view" : "10-day view"}
          </span>
          <button
            onClick={() => set({ chartExpanded: !chartExpanded })}
            title={chartExpanded ? "Restore" : "Expand to 30 days"}
            className="rounded-md border border-ct-line px-2 py-1 text-[12px]"
          >
            {chartExpanded ? "⤡" : "⤢"}
          </button>
        </div>
      </div>

      <div className="mt-2 flex gap-4 text-[11.5px] text-ct-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-sm bg-[#4f46e5]" />
          Planned
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-sm" style={{ background: ACH_GREEN }} />
          Achievable
        </span>
      </div>

      <TooltipProvider delayDuration={0}>
        <div
          className="mt-4 flex items-end overflow-x-auto"
          style={{ gap: chartExpanded ? "8px" : "16px" }}
        >
          {shown.map((d) => {
            const achColor = d.status === "red" ? RED : d.status === "amber" ? AMBER : ACH_GREEN;
            return (
              <Tooltip key={d.day}>
                <TooltipTrigger asChild>
                  <div className="flex flex-none flex-col items-center gap-1.5">
                    <div className="flex items-end gap-[3px]">
                      <div
                        className="rounded-t-[3px] bg-[#4f46e5]"
                        style={{ height: scale(d.plan), width: chartExpanded ? "10px" : "16px" }}
                      />
                      <div
                        className="rounded-t-[3px]"
                        style={{
                          height: scale(d.ach),
                          width: chartExpanded ? "10px" : "16px",
                          background: achColor,
                        }}
                      />
                    </div>
                    <div
                      className="text-[10px] whitespace-nowrap"
                      style={{
                        color: d.status === "red" ? RED : d.status === "amber" ? AMBER : "#4b5262",
                        fontWeight: d.status !== "green" ? 700 : 400,
                      }}
                    >
                      {d.label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="max-w-[14rem] rounded-xl border border-border bg-background px-3 py-2 text-[11px] text-foreground shadow-xl"
                >
                  <div className="font-semibold">Aug {d.day}</div>
                  <div className="mt-1 grid gap-1 text-ct-muted">
                    <div className="flex justify-between gap-2">
                      <span>Planned</span>
                      <span className="font-semibold text-foreground">{d.plan.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Achievable</span>
                      <span className="font-semibold text-foreground">{d.ach.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>Status</span>
                      <span className="font-semibold" style={{ color: achColor }}>
                        {statusLabel(d.status)}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="mt-4 text-[12px] text-ct-muted">{CHART_NOTE[selectedVariant]}</div>
    </div>
  );
}

function AlertsPanel() {
  const { filteredAlerts, set, variantLabel } = useControlTower();
  return (
    <div className="min-w-0 rounded-xl border border-ct-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[14px] font-bold">Automated alerts — {variantLabel}</div>
        <span className="rounded-full bg-[#f1f2f6] px-2 py-1 text-[11px] font-semibold text-ct-muted">
          {filteredAlerts.length} open
        </span>
      </div>
      <div className="mt-3.5 flex flex-col gap-2.5">
        {filteredAlerts.map((a) => (
          <button
            key={a.id}
            onClick={() => set({ activeAlertId: a.id })}
            className="rounded-[10px] border border-ct-line px-3.5 py-3 text-left transition-colors hover:bg-[#fafbfc]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-[13px] font-bold">
                <i
                  className="inline-block h-2 w-2 flex-none rounded-full"
                  style={{ background: a.color }}
                />
                {a.title}
              </div>
              <span
                className="flex-none rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: tint(a.color), color: a.color }}
              >
                {a.severity}
              </span>
            </div>
            <div className="mt-1.5 text-[12px] text-ct-muted">{a.detail}</div>
            <div className="mt-1 text-[11px] text-[#9aa0ad]">{a.pushed}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExecutiveSummary() {
  const { selectedVariant, chartExpanded } = useControlTower();

  return (
    <div className="flex flex-col gap-5 overflow-auto p-7">
      <p className="-mt-2 text-[14px] text-ct-muted">{VARIANT_SUBTITLE[selectedVariant]}</p>
      <FilterBar />
      <KpiRow />
      <div
        className="grid min-w-0 gap-4"
        style={{
          gridTemplateColumns: chartExpanded ? "1fr" : undefined,
        }}
      >
        <div
          className={
            chartExpanded
              ? "grid min-w-0 gap-4"
              : "grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
          }
        >
          <PlanChart />
          <AlertsPanel />
        </div>
      </div>
      <div className="sr-only">{VARIANT_LABEL[selectedVariant]}</div>
    </div>
  );
}
