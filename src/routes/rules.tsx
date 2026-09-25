import { createFileRoute } from "@tanstack/react-router";
import { useActiveRules } from "@/lib/db";
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
  const { data: rules = [], isLoading } = useActiveRules();
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <SectionHeading eyebrow="Quest rules" title="Before you start" sub="Play fair, ship on time, and have fun with it." />
      <div className="grid gap-5 md:grid-cols-2">
        {isLoading && <p className="text-text/60">Loading rules…</p>}
        {rules.map((r, i) => <RuleCard key={r.id} index={i + 1} text={r.title} description={r.description} icon={r.icon} />)}
      </div>
    </div>
  );
}
