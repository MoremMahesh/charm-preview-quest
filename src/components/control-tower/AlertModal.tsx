import { tint } from "@/data/control-tower";
import { X, BellRing, CheckCircle2 } from "lucide-react";
import { useControlTower } from "./state";

export function AlertModal() {
  const { activeAlert, set, repushed, repushAlert } = useControlTower();
  if (!activeAlert) return null;
  const done = !!repushed[activeAlert.id];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6"
      onClick={() => set({ activeAlertId: null })}
    >
      <div
        className="max-h-[86vh] w-full max-w-[620px] overflow-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full rounded-t-xl" style={{ background: activeAlert.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block h-2 w-2 flex-none rounded-full"
                style={{ background: activeAlert.color }}
              />
              <div className="text-[16px] font-bold">{activeAlert.title}</div>
            </div>
            <button
              onClick={() => set({ activeAlertId: null })}
              className="flex items-center gap-1 text-[12.5px] font-semibold text-ct-muted hover:text-ct-ink"
            >
              <X size={15} /> Close
            </button>
          </div>

          <span
            className="mt-3 inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold"
            style={{ background: tint(activeAlert.color), color: activeAlert.color }}
          >
            {activeAlert.severity} PRIORITY
          </span>

          <div className="mt-5 mb-1 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            Full description
          </div>
          <p className="text-[13.5px] leading-relaxed">{activeAlert.fullDescription}</p>

          <div className="mt-5 mb-1 text-[11px] font-bold tracking-[0.04em] text-ct-muted uppercase">
            Push history
          </div>
          <div className="text-[13px] text-ct-muted">{activeAlert.pushed}</div>
          {done && (
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-ct-green">
              <CheckCircle2 size={14} /> Push notification re-sent just now
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => repushAlert(activeAlert.id)}
              className="flex items-center gap-1.5 rounded-lg bg-ct-shell px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              <BellRing size={15} /> Push notification again
            </button>
            {activeAlert.notifiable && (
              <button className="rounded-lg border border-ct-line px-4 py-2.5 text-[13px] font-semibold">
                Notify vendor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
