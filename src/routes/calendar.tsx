import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/control-tower/Shell";
import { CalendarScreen } from "@/components/control-tower/CalendarScreen";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "30-Day Production Calendar — Control Tower" },
      {
        name: "description",
        content:
          "Day-by-day production feasibility calendar with root-cause drilldown into component ATP, supplier ASN delays and purchase orders.",
      },
      { property: "og:title", content: "30-Day Production Calendar — Control Tower" },
      {
        property: "og:description",
        content:
          "Click any red or amber day to see component-level ATP breakdown and the supplier PO behind the shortage.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <Shell title="30-Day Production Calendar">
      <CalendarScreen />
    </Shell>
  );
}
