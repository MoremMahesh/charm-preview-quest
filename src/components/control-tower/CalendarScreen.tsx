import { Link } from "@tanstack/react-router";
import {
  CALENDAR_VARIANT_OPTIONS,
  GRID,
  GREEN,
  AMBER,
  RED,
  TREND,
  VARIANT_LABEL,
  statusColor,
  statusLabel,
  tint,
  type VariantKey,
} from "@/data/control-tower";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useControlTower } from "./state";

export function CalendarScreen() {
  const { calVariant, calStatuses, selectedDay, set, detail, dayStatus } = useControlTower();
  const color = statusColor(dayStatus);

  return (
    <div className="flex flex-col gap-3 max-h-[80vh] overflow-auto p-4">
      <div className="flex flex-col gap-2">
        {/* <div className="text-[14px] font-bold">30-Day Production Calendar</div> */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <Link to="/" className="font-semibold text-ct-accent">
              ← Back
            </Link>
            <span className="text-ct-muted">
              Selected {dayStatus === "red" ? "stop-risk" : "watch"}: Aug {selectedDay} ({detail.loss} vehicles)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold tracking-[0.03em] text-ct-muted uppercase">
              Vehicle Variant
            </label>
            <select
              className="min-w-[170px] rounded-lg border border-[#dcdfe6] bg-white px-2 py-1.5 text-[12px]"
              value={calVariant}
              onChange={(e) => {
                const variant = e.target.value as VariantKey;

                const firstRiskDay: Record<VariantKey, number> = {
                  all: 12,
                  gmax: 12,
                  neo: 19,
                  plus: 20,
                };

                set({
                  selectedVariant: variant,
                  selectedDay: firstRiskDay[variant],
                });
              }}
            >
              {CALENDAR_VARIANT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border border-ct-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[13px] font-bold">
              August 2026 — {VARIANT_LABEL[calVariant]}
            </div>
            <span className="text-[10px] text-ct-muted">
              Click a Red/Amber day to drill into root cause
            </span>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold tracking-[0.04em] text-ct-muted">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <TooltipProvider delayDuration={0}>
            <div className="mt-2 grid grid-cols-7 gap-1.5">
              {GRID.map((day, i) => {
                if (!day) return <div key={`e${i}`} className="min-h-[56px]" />;
                const st = calStatuses[day] ?? "green";
                const c = statusColor(st);
                const selected = day === selectedDay;
                const clickable = st !== "green";
                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={clickable ? () => set({ selectedDay: day }) : undefined}
                        className={`min-h-[56px] rounded-[8px] border-[1.25px] px-2 py-1.5 ${clickable ? "cursor-pointer" : "cursor-default"
                          }`}
                        style={{
                          borderColor: selected ? "#4f46e5" : "#eceef2",
                          background: tint(c),
                        }}
                      >
                        <div className="text-[11px] font-bold">{day}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <i
                            className="inline-block h-1.5 w-1.5 flex-none rounded-full"
                            style={{ background: c }}
                          />
                          <span className="text-[8.5px] font-bold" style={{ color: c }}>
                            {statusLabel(st)}
                          </span>
                        </div>
                        {TREND[day] && (
                          <div className="mt-1 text-[8.5px] leading-tight text-ct-muted">
                            {TREND[day]}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="max-w-[14rem] rounded-xl border border-border bg-background px-3 py-2 text-[11px] text-foreground shadow-xl"
                    >
                      <div className="font-semibold">Aug {day}</div>
                      <div className="mt-1 grid gap-1 text-ct-muted">
                        <div className="flex justify-between gap-2">
                          <span>Status</span>
                          <span className="font-semibold" style={{ color: c }}>
                            {statusLabel(st)}
                          </span>
                        </div>
                        {TREND[day] ? (
                          <div className="text-[11px] text-ct-muted">{TREND[day]}</div>
                        ) : (
                          <div className="text-[11px] text-ct-muted">No recent change detected.</div>
                        )}
                        {clickable && (
                          <div className="text-[11px] text-ct-muted">
                            Click to drill into root cause.
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-ct-muted">
            {[
              [GREEN, "Production achievable"],
              [AMBER, "Risk developing"],
              [RED, "Production stop possible"],
            ].map(([c, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <i className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-ct-line bg-white shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="h-1.5 w-full" style={{ background: color }} />
          <div className="p-5">
            <div className="text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Production risk identified
            </div>
            <div className="mt-1 text-[20px] font-extrabold">Aug {selectedDay}</div>

            <div className="mt-4 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Affected variant
            </div>
            <div className="text-[13.5px] font-semibold">{detail.variant}</div>

            <div className="mt-4 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Projected production loss
            </div>
            <div className="text-[13.5px] font-semibold">{detail.loss} vehicles</div>

            <div className="mt-4 rounded-[10px] border border-ct-line bg-[#fafbfc] px-3.5 py-3">
              <div className="text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
                Critical component
              </div>
              <div className="mt-1 text-[13px] font-bold">{detail.component}</div>
              <div className="mt-1.5 text-[12px] text-ct-muted">
                {TREND[selectedDay] ?? "No status change in the last 24 hours."}
              </div>
            </div>

            <button
              onClick={() => set({ modalOpen: true })}
              className="mt-4 w-full rounded-lg bg-ct-shell px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              OPEN ROOT CAUSE →
            </button>

            <div className="mt-4">
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{ background: tint(color), color }}
              >
                {statusLabel(dayStatus)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
