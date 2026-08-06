import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useControlTower } from "./state";
import { RootCauseModal } from "./RootCauseModal";
import { AlertModal } from "./AlertModal";

const NAV = [
  { label: "Executive Summary", to: "/" as const },
  { label: "30-Day Calendar", to: "/calendar" as const },
];

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { set, selectedVariant } = useControlTower();

  return (
    <aside className="flex w-[220px] flex-none flex-col gap-1 bg-ct-shell px-4 py-[22px] text-white">
      <div className="flex items-center gap-2 px-2 pb-[22px]">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-ct-accent text-[13px] font-extrabold">
          CT
        </div>
        <div className="text-[14.5px] font-bold tracking-[0.01em]">Control Tower</div>
      </div>

      {NAV.map((n) => {
        const active = pathname === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => {
              if (n.to === "/calendar" && selectedVariant === "all") set({ selectedVariant: "gmax" });
            }}
            className={`flex items-center gap-2.5 rounded-lg p-2.5 text-[13.5px] font-semibold ${
              active ? "bg-ct-shell-hi text-white" : "text-ct-shell-dim"
            }`}
          >
            <span
              className="inline-block h-1.5 w-1.5 flex-none rounded-full"
              style={{ background: active ? "#4f46e5" : "#3a3f57" }}
            />
            {n.label}
          </Link>
        );
      })}

      {["Operations", "Procurement"].map((label) => (
        <div
          key={label}
          className="flex cursor-default items-center gap-2.5 rounded-lg p-2.5 text-[13.5px] font-semibold text-ct-shell-mute"
        >
          <span
            className="inline-block h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: "#3a3f57" }}
          />
          {label}
        </div>
      ))}

      <div className="mt-auto border-t border-[#2b2f42] px-2 py-3 text-[11px] text-[#8b90a6]">
        Illustrative wireframe — not live GEML data
      </div>
    </aside>
  );
}

function TopBar({ title }: { title: string }) {
  const { filteredAlerts } = useControlTower();
  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-ct-line bg-white px-7">
      <h1 className="text-[18px] font-bold">{title}</h1>
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="text-[18px]">🔔</div>
          {filteredAlerts.length > 0 && (
            <span className="absolute -top-[3px] -right-[5px] min-w-[14px] rounded-lg bg-ct-red px-1 py-px text-center text-[9px] font-bold text-white">
              {filteredAlerts.length}
            </span>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0e3ff] text-[12px] font-bold text-ct-accent">
          PM
        </div>
      </div>
    </header>
  );
}

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ct-canvas text-ct-ink">
      <Sidebar />
      <div className="flex w-0 min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        {children}
      </div>
      <RootCauseModal />
      <AlertModal />
    </div>
  );
}
