import { statusColor, statusLabel, tint, trendFor, RED, GREEN, AMBER } from "@/data/control-tower";
import { X, BellRing, CheckCircle2 } from "lucide-react";
import { useControlTower } from "./state";

export function RootCauseModal() {
  const {
    modalOpen,
    set,
    detail,
    selectedDay,
    dayStatus,
    poNotified,
    notifyPoVendor,
    poNotifyKey,
    calVariant,
  } = useControlTower();
  if (!modalOpen) return null;

  const color = statusColor(dayStatus);
  const showNotify = detail.po.badge === "Delayed" && !poNotified[poNotifyKey];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"
      onClick={() => set({ modalOpen: false })}
    >
      <div
        className="max-h-[86vh] w-full max-w-[780px] overflow-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-xl" style={{ background: color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="text-[17px] font-bold">Root cause — Aug {selectedDay}</div>
            <button
              onClick={() => set({ modalOpen: false })}
              className="flex items-center gap-1 text-[12.5px] font-semibold text-ct-muted hover:text-ct-ink"
            >
              <X size={15} /> Close
            </button>
          </div>
          <p className="mt-2 text-[13.5px] text-ct-muted">
            {detail.variant} · {detail.rootCauseSummary}
          </p>

          <div className="mt-5 mb-2 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            Component-level ATP breakdown
          </div>
          <div className="overflow-x-auto rounded-[10px] border border-ct-line">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[#f7f8fa] text-left text-[11px] tracking-[0.03em] text-ct-muted uppercase">
                  <th className="px-3 py-2.5 font-semibold">Component</th>
                  <th className="px-3 py-2.5 font-semibold">Stock</th>
                  <th className="px-3 py-2.5 font-semibold">ASN qty</th>
                  <th className="px-3 py-2.5 font-semibold">Safety stock</th>
                  <th className="px-3 py-2.5 font-semibold">Required</th>
                  <th className="px-3 py-2.5 font-semibold">Variance</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.rows.map((r) => {
                  const rc = statusColor(r.status.toLowerCase() as "red" | "amber" | "green");
                  const netColor = r.net < 0 ? RED : dayStatus === "amber" ? AMBER : GREEN;
                  return (
                    <tr key={r.component} className="border-t border-ct-line-soft">
                      <td className="px-3 py-2.5 font-semibold">{r.component}</td>
                      <td className="px-3 py-2.5">{r.stock}</td>
                      <td className="px-3 py-2.5">{r.asn}</td>
                      <td className="px-3 py-2.5">{r.safety}</td>
                      <td className="px-3 py-2.5">{r.required}</td>
                      <td className="px-3 py-2.5 font-bold" style={{ color: netColor }}>
                        {r.net}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="rounded-full px-2 py-1 text-[10.5px] font-bold"
                          style={{ background: tint(rc), color: rc }}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 mb-2 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            Supplier / PO reference
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-ct-line bg-[#fafbfc] px-4 py-3.5">
            <div>
              <div className="text-[13px] font-bold">
                PO {detail.po.number} · {detail.po.vendor}
              </div>
              <div className="mt-1 text-[12px] text-ct-muted">{detail.po.status}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                style={{
                  background: tint(detail.po.badge === "Delayed" ? RED : GREEN),
                  color: detail.po.badge === "Delayed" ? RED : GREEN,
                }}
              >
                {detail.po.badge}
              </span>
              {poNotified[poNotifyKey] && (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-ct-green">
                  <CheckCircle2 size={14} /> Vendor notified
                </span>
              )}
              {showNotify && (
                <button
                  onClick={notifyPoVendor}
                  className="flex items-center gap-1.5 rounded-lg bg-ct-shell px-3.5 py-2 text-[12.5px] font-semibold text-white"
                >
                  <BellRing size={14} /> Notify vendor
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 mb-1 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            Trend
          </div>
          <div className="text-[13px]">
            {trendFor(calVariant, selectedDay) ?? "No status change in the last 24 hours."}
          </div>

          <div className="mt-5">
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
  );
}
