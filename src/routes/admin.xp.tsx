import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adjustXp } from "@/lib/xp";
import { useLeaderboard } from "@/lib/db";
import { Button } from "@/components/quest/ui";
import { Input, Panel, Pill, Select } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/xp")({ component: XpAdmin });

function XpAdmin() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const { data: subs = [] } = useQuery({
    queryKey: ["admin", "submissions", filter],
    queryFn: async () => {
      let q = supabase.from("submissions").select("*, quests(title, number, xp_reward), profiles(name, username, email)").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  const { data: board = [] } = useLeaderboard();
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["leaderboard"] }); };

  const review = useMutation({
    mutationFn: async ({ id, userId, xp, approve, prev }: { id: string; userId: string; xp: number; approve: boolean; prev: string }) => {
      const { error } = await supabase.from("submissions").update({ status: approve ? "approved" : "rejected" }).eq("id", id);
      if (error) throw error;
      if (approve && prev !== "approved") await adjustXp(userId, xp, 1);
      if (!approve && prev === "approved") await adjustXp(userId, -xp, -1);
    },
    onSuccess: (_d, v) => { toast.success(v.approve ? `Approved · +${v.xp} XP` : "Rejected"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [row, setRow] = useState<{ name: string; members: string; xp: string }>({ name: "", members: "1", xp: "0" });
  const board$ = useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: unknown }>) => {
      const { error } = await fn();
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <Panel title="Submissions" action={
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
          {["pending", "approved", "rejected", "all"].map((s) => <option key={s}>{s}</option>)}
        </Select>}>
        <div className="space-y-3">
          {subs.map((s) => {
            const xp = s.quests?.xp_reward ?? 0;
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/20 p-4">
                <div>
                  <div className="font-display font-extrabold">{s.profiles?.name || s.profiles?.username || s.profiles?.email} · Quest #{s.quests?.number}</div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <a href={s.github_url} target="_blank" rel="noreferrer" className="underline">GitHub</a>
                    <a href={s.live_url} target="_blank" rel="noreferrer" className="underline">Live site</a>
                    <span className="opacity-60">{new Date(s.created_at).toLocaleString()}</span>
                  </div>
                  <div className="mt-1"><Pill tone={s.status === "approved" ? "accent" : s.status === "rejected" ? "destructive" : "muted"}>{s.status}</Pill></div>
                </div>
                <div className="flex gap-2">
                  <Button className="px-3 py-2" disabled={s.status === "approved"} onClick={() => review.mutate({ id: s.id, userId: s.user_id, xp, approve: true, prev: s.status })}>Approve +{xp}</Button>
                  <Button variant="ink" className="px-3 py-2" disabled={s.status === "rejected"} onClick={() => review.mutate({ id: s.id, userId: s.user_id, xp, approve: false, prev: s.status })}>Reject</Button>
                </div>
              </div>
            );
          })}
          {!subs.length && <p className="opacity-70">Nothing here.</p>}
        </div>
      </Panel>

      <Panel title="Leaderboard">
        <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => {
          e.preventDefault();
          board$.mutate(() => supabase.from("leaderboard").insert({ name: row.name, members: Number(row.members) || 1, xp: Number(row.xp) || 0 }));
          setRow({ name: "", members: "1", xp: "0" });
        }}>
          <Input required placeholder="Team / player name" className="flex-1" value={row.name} onChange={(e) => setRow({ ...row, name: e.target.value })} />
          <Input type="number" placeholder="Members" className="w-28" value={row.members} onChange={(e) => setRow({ ...row, members: e.target.value })} />
          <Input type="number" placeholder="XP" className="w-28" value={row.xp} onChange={(e) => setRow({ ...row, xp: e.target.value })} />
          <Button type="submit" className="px-4 py-2">+ Add</Button>
        </form>
        <div className="space-y-2">
          {board.map((b, i) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-ink/20 p-3">
              <span className="w-8 font-display font-extrabold">#{i + 1}</span>
              <span className="flex-1 font-display font-bold">{b.name} {b.profile_id && <Pill>player</Pill>}</span>
              <Input type="number" defaultValue={b.xp} className="w-28" onBlur={(e) => Number(e.target.value) !== b.xp && board$.mutate(() => supabase.from("leaderboard").update({ xp: Number(e.target.value) }).eq("id", b.id))} />
              <Button variant="ink" className="px-3 py-2" onClick={() => confirm("Remove from leaderboard?") && board$.mutate(() => supabase.from("leaderboard").delete().eq("id", b.id))}>✕</Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
