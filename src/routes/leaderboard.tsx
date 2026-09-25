import { createFileRoute } from "@tanstack/react-router";
import { useLeaderboard } from "@/lib/db";
import { LeaderboardCard, SectionHeading } from "@/components/quest/ui";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Quest Leaderboard — UI Revamp Challenge" },
      { name: "description", content: "See who's leading the UI Revamp quest by XP." },
      { property: "og:title", content: "Quest Leaderboard — UI Revamp Challenge" },
      { property: "og:description", content: "Top teams and participants ranked by XP." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { data: rows = [] } = useLeaderboard();
  const max = Math.max(1, ...rows.map((e) => e.xp));
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionHeading eyebrow="Season 1" title="Quest Leaderboard" />
      <div className="space-y-4">
        {rows.map((e, i) => <LeaderboardCard key={e.id} rank={i + 1} name={e.name} members={e.members} xp={e.xp} max={max} />)}
      </div>
    </div>
  );
}
