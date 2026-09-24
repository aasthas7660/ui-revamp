import { useEffect, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { QuestStatus } from "@/data/mock";

type Variant = "primary" | "secondary" | "ink" | "cream";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  ink: "bg-ink text-text",
  cream: "bg-card text-card-foreground",
};
export const btnClass = (v: Variant = "primary", extra?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wide shadow-[var(--shadow-block)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50",
    variants[v],
    extra,
  );

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={btnClass(variant, className)} />;
}

export function XPBadge({ xp, className }: { xp: number; className?: string }) {
  return (
    <span className={cn("inline-flex animate-pop items-center rounded-xl border-2 border-ink bg-secondary px-3 py-1 font-display text-sm font-extrabold text-secondary-foreground", className)}>
      +{xp} XP
    </span>
  );
}

const statusStyle: Record<QuestStatus, string> = {
  open: "bg-accent text-accent-foreground",
  upcoming: "bg-muted text-card-foreground",
  closed: "bg-destructive text-card",
};
export function StatusBadge({ status }: { status: QuestStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-display text-xs font-extrabold uppercase", statusStyle[status])}>
      {status === "open" && <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />}
      {status}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between font-display text-xs font-bold uppercase">
          <span>{label}</span><span>{value}%</span>
        </div>
      )}
      <div className="h-4 overflow-hidden rounded-full border-2 border-ink bg-muted">
        <div className="h-full animate-grow rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function diff(end: string) {
  const ms = Math.max(0, new Date(end).getTime() - Date.now());
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
}
export function Countdown({ endsAt, dark }: { endsAt: string; dark?: boolean }) {
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setT(diff(endsAt));
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  const units = [["d", "Days"], ["h", "Hrs"], ["m", "Min"], ["s", "Sec"]] as const;
  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map(([k, l]) => (
        <div key={k} className={cn("rounded-xl border-2 border-ink py-2 text-center", dark ? "bg-ink text-text" : "bg-card text-card-foreground")}>
          <div key={t?.[k]} className="animate-tick font-display text-2xl font-extrabold tabular-nums">
            {t ? String(t[k]).padStart(2, "0") : "--"}
          </div>
          <div className="text-[10px] font-bold uppercase opacity-70">{l}</div>
        </div>
      ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && <span className="mb-3 inline-block rounded-full border-2 border-secondary px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-secondary">{eyebrow}</span>}
      <h2 className="font-display text-4xl font-extrabold uppercase leading-none md:text-6xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-text/70">{sub}</p>}
    </div>
  );
}

export function StepCard({ n, title, text, tone }: { n: string; title: string; text: string; tone: "cream" | "primary" | "secondary" }) {
  const bg = { cream: "bg-card text-card-foreground", primary: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground" }[tone];
  return (
    <div className={cn("lift rounded-3xl border-[3px] border-ink p-6 shadow-[var(--shadow-block-light)]", bg)}>
      <div className="font-display text-5xl font-extrabold opacity-90">{n}</div>
      <h3 className="mt-6 font-display text-xl font-extrabold">{title}</h3>
      <p className="mt-2 text-sm opacity-80">{text}</p>
    </div>
  );
}

export function RuleCard({ index, text }: { index: number; text: string }) {
  return (
    <div className="card-block lift flex items-center gap-5 p-5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-ink bg-primary font-display text-2xl font-extrabold text-primary-foreground">
        {index}
      </div>
      <p className="font-display text-lg font-bold leading-snug">{text}</p>
    </div>
  );
}

export function PreviewFrame({ title, url, children, tone = "cream" }: { title: string; url?: string; children: ReactNode; tone?: "cream" | "secondary" }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border-[3px] border-ink shadow-[var(--shadow-block-light)]", tone === "cream" ? "bg-card" : "bg-secondary")}>
      <div className="flex items-center gap-2 border-b-[3px] border-ink px-4 py-3 text-card-foreground">
        <span className="h-3 w-3 rounded-full border-2 border-ink bg-destructive" />
        <span className="h-3 w-3 rounded-full border-2 border-ink bg-accent" />
        <span className="h-3 w-3 rounded-full border-2 border-ink bg-secondary" />
        <span className="ml-2 font-display text-xs font-extrabold uppercase">{title}</span>
        {url && <span className="ml-auto truncate rounded-lg bg-muted px-2 py-0.5 text-xs">{url}</span>}
      </div>
      <div className="aspect-[16/11] text-card-foreground">{children}</div>
    </div>
  );
}

const medal = ["bg-accent", "bg-secondary", "bg-card"];
export function LeaderboardCard({ rank, name, members, xp, max }: { rank: number; name: string; members: number; xp: number; max: number }) {
  const top = rank <= 3;
  return (
    <div className={cn("lift flex items-center gap-4 rounded-3xl border-[3px] border-ink p-4 md:p-5", top ? "bg-card text-card-foreground shadow-[var(--shadow-block-light)]" : "bg-surface text-text")}>
      <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-ink font-display text-xl font-extrabold text-ink", top ? medal[rank - 1] : "bg-muted")}>
        #{rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-lg font-extrabold">{name}</div>
        <div className="text-xs opacity-70">{members} {members === 1 ? "participant" : "members"}</div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-muted">
          <div className="h-full animate-grow bg-primary" style={{ width: `${(xp / max) * 100}%` }} />
        </div>
      </div>
      <XPBadge xp={xp} className="shrink-0" />
    </div>
  );
}

export function QuestCard({ quest, compact }: { quest: import("@/data/mock").Quest; compact?: boolean }) {
  return (
    <div className="card-block p-6 md:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xs font-extrabold uppercase opacity-60">Quest #{quest.number}</span>
        <StatusBadge status={quest.status} />
        <span className="rounded-full border-2 border-ink px-3 py-1 font-display text-xs font-extrabold uppercase">{quest.difficulty}</span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-3xl font-extrabold leading-none">{quest.title}</h3>
        <XPBadge xp={quest.xp} className="shrink-0" />
      </div>
      {!compact && <p className="mt-3 text-muted-foreground">{quest.description}</p>}
      <div className="mt-5"><Countdown endsAt={quest.endsAt} dark /></div>
      <div className="mt-5"><ProgressBar value={quest.progress} label="Quest progress" /></div>
      {compact && <Link to="/quest" className={btnClass("primary", "mt-6 w-full")}>Enter Quest →</Link>}
    </div>
  );
}
