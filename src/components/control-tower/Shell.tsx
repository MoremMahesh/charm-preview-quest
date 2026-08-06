import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { useControlTower } from "./state";
import { RootCauseModal } from "./RootCauseModal";
import { AlertModal } from "./AlertModal";

const NAV = [
  {
    label: "Executive Summary",
    to: "/" as const,
    icon: "📊",
  },
  {
    label: "30-Day Calendar",
    to: "/calendar" as const,
    icon: "📅",
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { set, selectedVariant } = useControlTower();

  return (
    <aside
      className={`flex flex-none flex-col gap-1 bg-ct-shell text-white transition-all duration-200 ${collapsed ? "w-20 px-2 py-3" : "w-[220px] px-4 py-[22px]"
        }`}>
      <div
        className={`flex items-center ${collapsed
          ? "justify-center flex-col gap-2"
          : "justify-between"
          }`}
      >
        <div
          className={`flex items-center mb-[5px] ${collapsed ? "justify-center" : "gap-3"
            }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-ct-accent text-[13px] font-extrabold">
            CT
          </div>
          {!collapsed && <div className="text-[14.5px] font-bold tracking-[0.01em]">Control Tower</div>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-1 text-ct-shell-dim transition hover:bg-white/10"
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {NAV.map((n) => {
        const active = pathname === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => {
              if (n.to === "/calendar" && selectedVariant === "all")
                set({ selectedVariant: "gmax" });
            }}
            title={collapsed ? n.label : undefined}
            className={`group flex items-center rounded-lg transition-all duration-200
    ${collapsed
                ? "justify-center px-0 py-1"
                : "gap-3 px-1 py-1"
              }
    ${active
                ? "bg-ct-shell-hi text-white"
                : "text-ct-shell-dim hover:bg-white/5"
              }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-lg">
              {n.icon}
            </div>

            {!collapsed && (
              <>
                {/* <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: active ? "#4f46e5" : "#3a3f57",
                  }}
                /> */}

                <span className="text-xs">{n.label}</span>
              </>
            )}
          </Link>
        );
      })}

      {[
        { label: "Operations", icon: "⚙️" },
        { label: "Procurement", icon: "📦" },
      ].map((item) => (
        <div
          key={item.label}
          className="flex cursor-default items-center gap-2.5 rounded-lg p-2.5 text-[13.5px] font-semibold text-ct-shell-mute"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${collapsed ? "mx-auto" : ""
              }`}
          >
            {item.icon}
          </div>
          {!collapsed && item.label}
        </div>
      ))}

      {!collapsed && (
        <div className="mt-auto border-t border-[#2b2f42] px-2 py-3 text-[11px] text-[#8b90a6]">
          Illustrative wireframe — not live GEML data
        </div>
      )}
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
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex min-h-screen bg-ct-canvas text-ct-ink">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex w-0 min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        {children}
      </div>
      <RootCauseModal />
      <AlertModal />
    </div>
  );
}
