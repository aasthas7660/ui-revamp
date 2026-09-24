import { createFileRoute } from "@tanstack/react-router";
import { mockLeaderboard } from "@/data/mock";
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
  const max = Math.max(...mockLeaderboard.map((e) => e.xp));
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionHeading eyebrow="Season 1" title="Quest Leaderboard" />
      <div className="space-y-4">
        {mockLeaderboard.map((e) => <LeaderboardCard key={e.rank} {...e} max={max} />)}
      </div>
    </div>
  );
}
