import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  ALERTS,
  CAL_STATUS_BY_VARIANT,
  VARIANT_LABEL,
  getDayDetail,
  type Alert,
  type DayDetail,
  type Status,
  type VariantKey,
} from "@/data/control-tower";

type CtState = {
  selectedDay: number;
  selectedVariant: VariantKey;
  selectedCategory: string;
  selectedPlant: string;
  modalOpen: boolean;
  activeAlertId: string | null;
  poNotified: Record<string, boolean>;
  repushed: Record<string, boolean>;
  chartExpanded: boolean;
  hoveredChip: "amber" | "red" | null;
};

type CtContextValue = CtState & {
  set: (patch: Partial<CtState>) => void;
  calVariant: VariantKey;
  calStatuses: Record<number, Status>;
  variantLabel: string;
  detail: DayDetail;
  dayStatus: Status;
  poNotifyKey: string;
  filteredAlerts: Alert[];
  activeAlert: Alert | undefined;
  notifyPoVendor: () => void;
  repushAlert: (id: string) => void;
};

const CtContext = createContext<CtContextValue | null>(null);

export function ControlTowerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CtState>({
    selectedDay: 12,
    selectedVariant: "all",
    selectedCategory: "all",
    selectedPlant: "all",
    modalOpen: false,
    activeAlertId: null,
    poNotified: {},
    repushed: {},
    chartExpanded: false,
    hoveredChip: null,
  });

  const value = useMemo<CtContextValue>(() => {
    const set = (patch: Partial<CtState>) => setState((s) => ({ ...s, ...patch }));
    const calVariant: VariantKey =
      state.selectedVariant === "all" ? "gmax" : state.selectedVariant;
    const calStatuses = CAL_STATUS_BY_VARIANT[calVariant];
    const detail = getDayDetail(calVariant, state.selectedDay);
    const poNotifyKey = `${calVariant}-${detail.po.number}`;

    return {
      ...state,
      set,
      calVariant,
      calStatuses,
      variantLabel: VARIANT_LABEL[state.selectedVariant],
      detail,
      dayStatus: calStatuses[state.selectedDay] ?? "green",
      poNotifyKey,
      filteredAlerts:
        state.selectedVariant === "all"
          ? ALERTS
          : ALERTS.filter((a) => a.variants.includes(calVariant as never)),
      activeAlert: ALERTS.find((a) => a.id === state.activeAlertId),
      notifyPoVendor: () =>
        setState((s) => ({ ...s, poNotified: { ...s.poNotified, [poNotifyKey]: true } })),
      repushAlert: (id: string) =>
        setState((s) => ({ ...s, repushed: { ...s.repushed, [id]: true } })),
    };
  }, [state]);

  return <CtContext.Provider value={value}>{children}</CtContext.Provider>;
}

export function useControlTower() {
  const ctx = useContext(CtContext);
  if (!ctx) throw new Error("useControlTower must be used inside ControlTowerProvider");
  return ctx;
}
