import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/control-tower/Shell";
import { ExecutiveSummary } from "@/components/control-tower/ExecutiveSummary";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Summary — Production Control Tower" },
      {
        name: "description",
        content:
          "30-day production feasibility, risk days, component shortages and automated supply alerts for MAGNUS EV variants.",
      },
      { property: "og:title", content: "Executive Summary — Production Control Tower" },
      {
        property: "og:description",
        content:
          "Track feasible days, production loss exposure and critical component risk across MAGNUS GMAX, NEO and PLUS.",
      },
    ],
  }),
  component: ExecPage,
});

function ExecPage() {
  return (
    <Shell title="Executive Summary">
      <ExecutiveSummary />
    </Shell>
  );
}
