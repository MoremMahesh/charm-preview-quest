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
import { useControlTower } from "./state";

export function CalendarScreen() {
  const { calVariant, calStatuses, selectedDay, set, detail, dayStatus } = useControlTower();
  const color = statusColor(dayStatus);

  return (
    <div className="flex h-[80vh] flex-col gap-2 overflow-hidden p-3">
      {/* Compact header row: back link + description + variant selector all inline */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <Link to="/" className="text-[11px] font-semibold whitespace-nowrap text-ct-accent">
            ← Back to executive summary
          </Link>
          <p className="text-[11.5px] leading-4 text-ct-muted">
            Aug {selectedDay} is the selected {dayStatus === "red" ? "stop-risk" : "watch"} day for{' '}
            {VARIANT_LABEL[calVariant]}, exposing {detail.loss} vehicles.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold tracking-[0.03em] text-ct-muted uppercase whitespace-nowrap">
            Variant
          </label>
          <select
            className="rounded-lg border border-[#dcdfe6] bg-white px-2 py-1 pr-6 text-[11.5px]"
            value={calVariant}
            onChange={(e) => set({ selectedVariant: e.target.value as VariantKey })}
          >
            {CALENDAR_VARIANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-ct-line bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="flex flex-none flex-wrap items-center justify-between gap-2">
            <div className="text-[13px] font-bold">
              August 2026 — {VARIANT_LABEL[calVariant]}
            </div>
            <span className="text-[10.5px] text-ct-muted">
              Click a Red/Amber day to drill into root cause
            </span>
          </div>

          <div className="mt-2 flex-none grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold tracking-[0.04em] text-ct-muted">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="mt-1.5 grid flex-1 min-h-0 grid-cols-7 auto-rows-fr gap-1">
            {GRID.map((day, i) => {
              if (!day) return <div key={`e${i}`} />;
              const st = calStatuses[day] ?? "green";
              const c = statusColor(st);
              const selected = day === selectedDay;
              const clickable = st !== "green";
              return (
                <div
                  key={day}
                  onClick={clickable ? () => set({ selectedDay: day }) : undefined}
                  className={`flex flex-col rounded-[7px] border-[1.25px] px-1.5 py-1 ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{
                    borderColor: selected ? "#4f46e5" : "#eceef2",
                    background: tint(c),
                  }}
                >
                  <div className="text-[10px] font-bold leading-tight">{day}</div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <i
                      className="inline-block h-1.5 w-1.5 flex-none rounded-full"
                      style={{ background: c }}
                    />
                    <span className="text-[8.5px] font-bold leading-none" style={{ color: c }}>
                      {statusLabel(st)}
                    </span>
                  </div>
                  {TREND[day] && (
                    <div className="mt-0.5 line-clamp-2 text-[8.5px] leading-tight text-ct-muted">
                      {TREND[day]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex-none flex flex-wrap gap-3 text-[10.5px] text-ct-muted">
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

        <div className="min-h-0 min-w-0 overflow-auto rounded-xl border border-ct-line bg-white shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="h-1.5 w-full" style={{ background: color }} />
          <div className="p-4">
            <div className="text-[10.5px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Production risk identified
            </div>
            <div className="mt-1 text-[18px] font-extrabold">Aug {selectedDay}</div>

            <div className="mt-3 text-[10.5px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Affected variant
            </div>
            <div className="text-[13px] font-semibold">{detail.variant}</div>

            <div className="mt-3 text-[10.5px] font-bold tracking-[0.04em] text-ct-muted uppercase">
              Projected production loss
            </div>
            <div className="text-[13px] font-semibold">{detail.loss} vehicles</div>

            <div className="mt-3 rounded-[10px] border border-ct-line bg-[#fafbfc] px-3 py-2.5">
              <div className="text-[10.5px] font-bold tracking-[0.04em] text-ct-muted uppercase">
                Critical component
              </div>
              <div className="mt-1 text-[12.5px] font-bold">{detail.component}</div>
              <div className="mt-1 text-[11.5px] text-ct-muted">
                {TREND[selectedDay] ?? "No status change in the last 24 hours."}
              </div>
            </div>

            <button
              onClick={() => set({ modalOpen: true })}
              className="mt-3 w-full rounded-lg bg-ct-shell px-4 py-2 text-[12.5px] font-semibold text-white"
            >
              OPEN ROOT CAUSE →
            </button>

            <div className="mt-3">
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