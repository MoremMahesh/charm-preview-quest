import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Settings2,
} from "lucide-react";
import { useControlTower } from "./state";
import { RootCauseModal } from "./RootCauseModal";
import { AlertModal } from "./AlertModal";

const NAV = [
  { label: "Executive Summary", to: "/" as const, icon: LayoutDashboard },
  { label: "30-Day Calendar", to: "/calendar" as const, icon: CalendarDays },
];

const SECONDARY = [
  { label: "Operations", icon: Settings2 },
  { label: "Procurement", icon: Package },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { set, selectedVariant } = useControlTower();

  return (
    <aside
      className={`flex flex-none flex-col bg-ct-shell text-white transition-all duration-200 ${
        collapsed ? "w-[68px] px-2.5 py-4" : "w-[236px] px-3.5 py-4"
      }`}
    >
      <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between"}`}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-ct-accent shadow-[0_4px_12px_rgba(79,70,229,.45)]">
            <Activity size={18} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[14px] font-bold tracking-[0.01em]">Control Tower</div>
              <div className="text-[10.5px] text-ct-shell-mute">Supply feasibility</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-1.5 text-ct-shell-dim transition hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-6 mb-2 px-2 text-[10px] font-bold tracking-[0.12em] text-ct-shell-mute uppercase">
          Planning
        </div>
      )}

      <nav className={`flex flex-col gap-1 ${collapsed ? "mt-5" : ""}`}>
        {NAV.map((n) => {
          const active = pathname === n.to;
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => {
                if (n.to === "/calendar" && selectedVariant === "all")
                  set({ selectedVariant: "gmax" });
              }}
              title={collapsed ? n.label : undefined}
              className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-2.5 py-2.5"
              } ${
                active
                  ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                  : "text-ct-shell-dim hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-ct-accent" />
              )}
              <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              {!collapsed && <span className="text-[13px] font-semibold">{n.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 mb-2 px-2 text-[10px] font-bold tracking-[0.12em] text-ct-shell-mute uppercase">
          Modules
        </div>
      )}

      <div className={`flex flex-col gap-1 ${collapsed ? "mt-1" : ""}`}>
        {SECONDARY.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              title={collapsed ? `${item.label} (coming soon)` : undefined}
              className={`flex cursor-default items-center rounded-xl text-ct-shell-mute ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-2.5 py-2.5"
              }`}
            >
              <Icon size={18} />
              {!collapsed && (
                <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
              )}
              {!collapsed && (
                <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
                  SOON
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!collapsed && (
        <div className="mt-auto rounded-xl bg-white/[0.05] px-3 py-2.5 text-[10.5px] leading-snug text-ct-shell-mute">
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
          <Bell size={19} className="text-ct-muted" />
          {filteredAlerts.length > 0 && (
            <span className="absolute -top-[5px] -right-[6px] min-w-[15px] rounded-lg bg-ct-red px-1 py-px text-center text-[9px] font-bold text-white">
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
  const [collapsed, setCollapsed] = useState(false);

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
