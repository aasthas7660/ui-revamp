import { createFileRoute, Link } from "@tanstack/react-router";
import mascot from "@/assets/hero-mascot.png";
import { mockSteps } from "@/data/mock";
import { useActiveQuest, toQuest } from "@/lib/db";
import { QuestCard, SectionHeading, StepCard, btnClass } from "@/components/quest/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UI Revamp Challenge — Tech Titans Quest" },
      { name: "description", content: "Take an existing website. Reimagine its interface. Build your version and earn XP." },
      { property: "og:title", content: "UI Revamp Challenge — Tech Titans Quest" },
      { property: "og:description", content: "Take an existing website. Reimagine its interface. Build your version." },
    ],
  }),
  component: Home,
});

const tones = ["cream", "primary", "secondary", "cream"] as const;

function Home() {
  const { data: row, isLoading } = useActiveQuest();
  const quest = row ? toQuest(row) : null;
  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <span className="inline-block rounded-full border-2 border-ink bg-secondary px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
            ⚡ Tech Titans Quest
          </span>
          <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
            UI Revamp <span className="text-primary">Challenge</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-text/75">
            Take an existing website. Reimagine its interface. Build your version.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/quest" className={btnClass("primary")}>View Current Quest</Link>
            <a href="#how" className={btnClass("cream")}>How It Works</a>
          </div>
        </div>
        <div className="relative">
          <div className="card-block animate-float bg-card p-4">
            <img src={mascot} alt="Hand-drawn paper character redesigning a website" width={1024} height={1024} className="w-full" />
          </div>
          <span className="absolute -left-3 top-6 rotate-[-8deg] rounded-xl border-2 border-ink bg-secondary px-3 py-1 font-display font-extrabold text-ink">+{quest?.xp ?? 500} XP</span>
        </div>
      </section>

      <section className="grid items-center gap-8 py-10 md:grid-cols-2">
        <SectionHeading eyebrow="Live now" title="Current Quest" sub="The clock is ticking. Redesign, deploy, submit — and climb the leaderboard." />
        {quest ? <QuestCard quest={quest} compact /> : <div className="card-block p-8 font-display font-bold">{isLoading ? "Loading quest…" : "No active quest right now — check back soon."}</div>}
      </section>

      <section id="how" className="scroll-mt-24 py-16">
        <SectionHeading eyebrow="4 steps" title="How the quest works" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockSteps.map((s, i) => <StepCard key={s.n} {...s} tone={tones[i % tones.length] ?? "cream"} />)}
        </div>
      </section>
    </div>
  );
}
