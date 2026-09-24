import { createFileRoute, Link } from "@tanstack/react-router";
import { mockQuest as q } from "@/data/mock";
import { QuestCard, btnClass } from "@/components/quest/ui";

export const Route = createFileRoute("/quest")({
  head: () => ({
    meta: [
      { title: "Quest #01: UI Revamp Challenge" },
      { name: "description", content: "Challenge details, target website, deliverables and AI policy for Quest #01." },
      { property: "og:title", content: "Quest #01: UI Revamp Challenge" },
      { property: "og:description", content: "Redesign the target website, deploy it and earn +500 XP." },
    ],
  }),
  component: QuestPage,
});

function Block({ title, children, tone = "card" }: { title: string; children: React.ReactNode; tone?: "card" | "secondary" | "primary" }) {
  const bg = { card: "bg-card text-card-foreground", secondary: "bg-secondary text-secondary-foreground", primary: "bg-primary text-primary-foreground" }[tone];
  return (
    <div className={`rounded-3xl border-[3px] border-ink p-6 shadow-[var(--shadow-block-light)] ${bg}`}>
      <h3 className="mb-4 font-display text-lg font-extrabold uppercase">{title}</h3>
      {children}
    </div>
  );
}

function QuestPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <QuestCard quest={q} />
          <Link to="/challenge" className={btnClass("primary", "mt-6 w-full")}>Start Challenge →</Link>
        </div>
        <div className="space-y-6">
          <Block title="Challenge details">
            <ul className="space-y-3">
              {q.details.map((d) => (
                <li key={d} className="flex gap-3"><span className="font-display font-extrabold text-primary">✦</span>{d}</li>
              ))}
            </ul>
          </Block>
          <Block title="Target website" tone="primary">
            <div className="font-display text-2xl font-extrabold">{q.targetWebsite.name}</div>
            <a href={q.targetWebsite.url} target="_blank" rel="noreferrer" className="mt-1 inline-block underline underline-offset-4">{q.targetWebsite.url}</a>
          </Block>
          <Block title="Deliverables" tone="secondary">
            <div className="flex flex-wrap gap-3">
              {q.deliverables.map((d) => (
                <span key={d} className="rounded-xl border-2 border-ink bg-card px-4 py-2 font-display font-bold text-card-foreground">{d}</span>
              ))}
            </div>
          </Block>
          <Block title="AI policy">
            <p>{q.aiPolicy}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {q.aiTools.map((t) => (
                <span key={t} className="rounded-full border-2 border-ink bg-muted px-3 py-1 text-sm font-bold transition hover:-rotate-3 hover:bg-secondary">{t}</span>
              ))}
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
}
