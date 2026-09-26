import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adjustXp } from "@/lib/xp";
import { Button } from "@/components/quest/ui";
import { Input, Panel, Pill } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/participants")({ component: ParticipantsAdmin });

function ParticipantsAdmin() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const { data: people = [] } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("total_xp", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["leaderboard"] }); };

  const xp = useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) => adjustXp(id, delta),
    onSuccess: (_d, v) => { toast.success(`${v.delta > 0 ? "+" : ""}${v.delta} XP`); setAmounts((a) => ({ ...a, [v.id]: "" })); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const status = useMutation({
    mutationFn: async ({ id, s }: { id: string; s: string }) => {
      const { error } = await supabase.from("profiles").update({ status: s }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const list = people.filter((p) => `${p.name} ${p.username} ${p.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Panel title={`Participants (${people.length})`} action={<Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />}>
      <div className="space-y-3">
        {list.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/20 p-4">
            <div>
              <div className="font-display font-extrabold">{p.name || p.username || "Unnamed"} {p.username && <span className="opacity-60">@{p.username}</span>}</div>
              <div className="text-sm opacity-70">{p.email}</div>
              <div className="mt-1 flex gap-2"><Pill tone="secondary">{p.total_xp} XP</Pill><Pill>{p.quests_completed} done</Pill>
                <Pill tone={p.status === "active" ? "accent" : "destructive"}>{p.status}</Pill></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input type="number" placeholder="XP" className="w-24" value={amounts[p.id] ?? ""} onChange={(e) => setAmounts({ ...amounts, [p.id]: e.target.value })} />
              <Button className="px-3 py-2" disabled={!Number(amounts[p.id])} onClick={() => xp.mutate({ id: p.id, delta: Math.abs(Number(amounts[p.id])) })}>+ Add</Button>
              <Button variant="cream" className="px-3 py-2" disabled={!Number(amounts[p.id])} onClick={() => xp.mutate({ id: p.id, delta: -Math.abs(Number(amounts[p.id])) })}>− Remove</Button>
              <Button variant="ink" className="px-3 py-2" onClick={() => status.mutate({ id: p.id, s: p.status === "active" ? "banned" : "active" })}>{p.status === "active" ? "Ban" : "Unban"}</Button>
            </div>
          </div>
        ))}
        {!list.length && <p className="opacity-70">No participants yet.</p>}
      </div>
    </Panel>
  );
}
