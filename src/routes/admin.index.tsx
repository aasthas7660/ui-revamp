import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Panel, Pill } from "@/components/admin/kit";
import { liveStatus } from "@/lib/db";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

async function count(table: "quests" | "profiles" | "submissions" | "rules" | "themes", filter?: [string, string]) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: c } = await q;
  return c ?? 0;
}

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [quests, users, subs, pending, rules] = await Promise.all([
        count("quests"), count("profiles"), count("submissions"), count("submissions", ["status", "pending"]), count("rules"),
      ]);
      const { data: recent } = await supabase.from("quests").select("*").order("start_at", { ascending: false }).limit(5);
      return { quests, users, subs, pending, rules, recent: recent ?? [] };
    },
  });
  const stats = [
    ["Quests", data?.quests], ["Participants", data?.users], ["Submissions", data?.subs], ["Pending review", data?.pending], ["Rules", data?.rules],
  ] as const;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([l, v]) => (
          <div key={l} className="card-block p-5">
            <div className="font-display text-4xl font-extrabold">{v ?? "–"}</div>
            <div className="mt-1 font-display text-xs font-bold uppercase opacity-70">{l}</div>
          </div>
        ))}
      </div>
      <Panel title="Recent quests" action={<Link to="/admin/quests" className="font-display text-sm font-bold underline">Manage</Link>}>
        <ul className="divide-y-2 divide-ink/10">
          {data?.recent.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="font-display font-bold">#{q.number} {q.title}</span>
              <span className="flex gap-2"><Pill>{q.status}</Pill><Pill tone="secondary">{liveStatus(q)}</Pill></span>
            </li>
          ))}
          {data && !data.recent.length && <li className="py-3 opacity-70">No quests yet.</li>}
        </ul>
      </Panel>
    </div>
  );
}
