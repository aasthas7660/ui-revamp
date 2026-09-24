import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import original from "@/assets/original-site.jpg";
import mascot from "@/assets/hero-mascot.png";
import { mockQuest } from "@/data/mock";
import { Button, PreviewFrame, XPBadge } from "@/components/quest/ui";

export const Route = createFileRoute("/challenge")({
  head: () => ({
    meta: [
      { title: "Challenge Workspace — UI Revamp" },
      { name: "description", content: "Compare the original design with yours and submit your GitHub and live website." },
      { property: "og:title", content: "Challenge Workspace — UI Revamp" },
      { property: "og:description", content: "Preview your redesign and submit your challenge." },
    ],
  }),
  component: ChallengePage,
});

const isUrl = (v: string) => /^https?:\/\/\S+\.\S+/.test(v);

function ChallengePage() {
  const [github, setGithub] = useState("");
  const [live, setLive] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const valid = isUrl(github) && isUrl(live);

  const input = "w-full rounded-2xl border-[3px] border-ink bg-card px-4 py-3 text-card-foreground outline-none transition focus:shadow-[var(--shadow-block)]";

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold uppercase md:text-5xl">Quest #{mockQuest.number} Workspace</h1>
        <XPBadge xp={mockQuest.xp} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-xl font-extrabold uppercase text-text/70">Original Design</h2>
          <PreviewFrame title="Original" url={mockQuest.targetWebsite.url}>
            <img src={original} alt="Original target website" width={1280} height={832} className="h-full w-full object-cover object-top" />
          </PreviewFrame>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-extrabold uppercase text-secondary">Your Design</h2>
          <PreviewFrame title="Your version" url={preview ?? "your-site.app"} tone="secondary">
            {preview ? (
              <iframe src={preview} title="Your design preview" className="h-full w-full bg-card" />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center">
                <div>
                  <img src={mascot} alt="" width={1024} height={1024} loading="lazy" className="mx-auto w-40" />
                  <p className="mt-3 font-display font-extrabold">Paste your live URL and hit preview</p>
                </div>
              </div>
            )}
          </PreviewFrame>
        </div>
      </div>

      <form
        className="card-block mt-10 grid gap-5 p-6 md:grid-cols-2 md:p-8"
        onSubmit={(e) => { e.preventDefault(); if (valid) setSubmitted(true); }}
      >
        <label className="block">
          <span className="mb-2 block font-display text-sm font-extrabold uppercase">GitHub Repository URL</span>
          <input className={input} placeholder="https://github.com/you/revamp" value={github} onChange={(e) => setGithub(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block font-display text-sm font-extrabold uppercase">Live Website URL</span>
          <input className={input} placeholder="https://your-revamp.app" value={live} onChange={(e) => setLive(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <Button type="button" variant="cream" disabled={!isUrl(live)} onClick={() => setPreview(live)}>Preview Website</Button>
          <Button type="submit" disabled={!valid || submitted}>{submitted ? "Submitted ✓" : "Submit Challenge"}</Button>
        </div>
        {submitted && (
          <div className="animate-pop rounded-2xl border-[3px] border-ink bg-primary p-5 text-primary-foreground md:col-span-2">
            <div className="font-display text-2xl font-extrabold">Quest complete!</div>
            <p className="mt-1">Your submission is in. <XPBadge xp={mockQuest.xp} className="ml-1" /> pending review.</p>
          </div>
        )}
      </form>
    </div>
  );
}
