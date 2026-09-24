import { createFileRoute } from "@tanstack/react-router";
import { mockRules } from "@/data/mock";
import { RuleCard, SectionHeading } from "@/components/quest/ui";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Rules — UI Revamp Challenge" },
      { name: "description", content: "Eight rules to follow before you start the UI Revamp quest." },
      { property: "og:title", content: "Rules — UI Revamp Challenge" },
      { property: "og:description", content: "Read these before you start the quest." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHeading eyebrow="Quest rules" title="Before you start" sub="Play fair, ship on time, and have fun with it." />
      <div className="grid gap-5 md:grid-cols-2">
        {mockRules.map((r, i) => <RuleCard key={r} index={i + 1} text={r} />)}
      </div>
    </div>
  );
}
