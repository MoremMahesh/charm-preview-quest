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
    <div className="flex flex-col gap-5 overflow-auto p-7">
      <div>
        <Link to="/" className="text-[12.5px] font-semibold text-ct-accent">
          ← Back to executive summary
        </Link>
        <p className="mt-2 text-[14px] text-ct-muted">
          Aug {selectedDay} is the selected {dayStatus === "red" ? "stop-risk" : "watch"} day for{" "}
          {VARIANT_LABEL[calVariant]}, exposing {detail.loss} vehicles.
        </p>
      </div>

      <div className="max-w-[280px]">
        <label className="text-[11px] font-semibold tracking-[0.03em] text-ct-muted uppercase">
          Vehicle Variant
        </label>
        <select
          className="mt-1.5 w-full rounded-lg border border-[#dcdfe6] bg-white px-2 py-2 pr-6 text-[12.5px]"
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

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border border-ct-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[14px] font-bold">
              August 2026 — {VARIANT_LABEL[calVariant]}
            </div>
            <span className="text-[11.5px] text-ct-muted">
              Click a Red/Amber day to drill into root cause
            </span>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10.5px] font-bold tracking-[0.04em] text-ct-muted">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {GRID.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="min-h-[78px]" />;
              const st = calStatuses[day] ?? "green";
              const c = statusColor(st);
              const selected = day === selectedDay;
              const clickable = st !== "green";
              return (
                <div
                  key={day}
                  onClick={clickable ? () => set({ selectedDay: day }) : undefined}
                  className={`min-h-[78px] rounded-[9px] border-[1.5px] p-2.5 ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{
                    borderColor: selected ? "#4f46e5" : "#eceef2",
                    background: tint(c),
                  }}
                >
                  <div className="text-[12.5px] font-bold">{day}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <i
                      className="inline-block h-1.5 w-1.5 flex-none rounded-full"
                      style={{ background: c }}
                    />
                    <span className="text-[9.5px] font-bold" style={{ color: c }}>
                      {statusLabel(st)}
                    </span>
                  </div>
                  {TREND[day] && (
                    <div className="mt-1 text-[9.5px] leading-tight text-ct-muted">
                      {TREND[day]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[11.5px] text-ct-muted">
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
