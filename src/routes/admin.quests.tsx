import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { QUEST_STATUSES, useThemes, type QuestRow } from "@/lib/db";
import { Button } from "@/components/quest/ui";
import { Field, Input, Panel, Pill, Select, Textarea, toLocalInput } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/quests")({ component: QuestsAdmin });

type Draft = TablesInsert<"quests">;
const blank = (): Draft => ({
  number: "01", title: "", description: "", instructions: "", target_website_url: "", target_page_url: "", image_url: "",
  difficulty: "Medium", xp_reward: 500, start_at: new Date().toISOString(), end_at: new Date(Date.now() + 3 * 864e5).toISOString(),
  ai_allowed: true, ai_policy: "", submission_instructions: "", theme_id: null, status: "draft",
});

function QuestsAdmin() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Draft | null>(null);
  const { data: themes = [] } = useThemes();
  const { data: quests = [] } = useQuery({
    queryKey: ["admin", "quests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quests").select("*").order("start_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["active-quest"] }); };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const { error } = d.id ? await supabase.from("quests").update(d).eq("id", d.id) : await supabase.from("quests").insert(d);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Quest saved"); setEdit(null); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Quest deleted"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  if (edit) {
    return (
      <Panel title={edit.id ? "Edit quest" : "New quest"}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }}>
          <Field label="Number"><Input value={edit.number ?? ""} onChange={(e) => set("number", e.target.value)} /></Field>
          <Field label="Title"><Input required value={edit.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Description" className="md:col-span-2"><Textarea value={edit.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Instructions (one per line)" className="md:col-span-2"><Textarea rows={5} value={edit.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} /></Field>
          <Field label="Target website URL"><Input value={edit.target_website_url ?? ""} onChange={(e) => set("target_website_url", e.target.value)} /></Field>
          <Field label="Target page URL"><Input value={edit.target_page_url ?? ""} onChange={(e) => set("target_page_url", e.target.value)} /></Field>
          <Field label="Image URL"><Input value={edit.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} /></Field>
          <Field label="Difficulty">
            <Select value={edit.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="XP reward"><Input type="number" min={0} value={edit.xp_reward} onChange={(e) => set("xp_reward", Number(e.target.value))} /></Field>
          <Field label="Status">
            <Select value={edit.status} onChange={(e) => set("status", e.target.value)}>
              {QUEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Starts"><Input type="datetime-local" value={toLocalInput(edit.start_at!)} onChange={(e) => set("start_at", new Date(e.target.value).toISOString())} /></Field>
          <Field label="Ends"><Input type="datetime-local" value={toLocalInput(edit.end_at!)} onChange={(e) => set("end_at", new Date(e.target.value).toISOString())} /></Field>
          <Field label="Theme">
            <Select value={edit.theme_id ?? ""} onChange={(e) => set("theme_id", e.target.value || null)}>
              <option value="">Site default</option>
              {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 font-display text-sm font-bold">
            <input type="checkbox" checked={!!edit.ai_allowed} onChange={(e) => set("ai_allowed", e.target.checked)} /> AI tools allowed
          </label>
          <Field label="AI policy" className="md:col-span-2"><Textarea value={edit.ai_policy ?? ""} onChange={(e) => set("ai_policy", e.target.value)} /></Field>
          <Field label="Submission instructions" className="md:col-span-2"><Textarea value={edit.submission_instructions ?? ""} onChange={(e) => set("submission_instructions", e.target.value)} /></Field>
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save quest"}</Button>
            <Button type="button" variant="cream" onClick={() => setEdit(null)}>Cancel</Button>
          </div>
        </form>
      </Panel>
    );
  }

  return (
    <Panel title="Quests" action={<Button onClick={() => setEdit(blank())}>+ New quest</Button>}>
      <div className="space-y-3">
        {quests.map((q: QuestRow) => (
          <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/20 p-4">
            <div>
              <div className="font-display font-extrabold">#{q.number} {q.title}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs"><Pill>{q.status}</Pill><Pill tone="secondary">{q.xp_reward} XP</Pill>
                <span className="opacity-70">{new Date(q.start_at).toLocaleString()} → {new Date(q.end_at).toLocaleString()}</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="cream" className="px-3 py-2" onClick={() => setEdit(q)}>Edit</Button>
              <Button variant="secondary" className="px-3 py-2" onClick={() => { const { id: _i, created_at: _c, updated_at: _u, ...rest } = q; setEdit({ ...rest, title: `${q.title} (copy)`, status: "draft" }); }}>Duplicate</Button>
              <Button variant="ink" className="px-3 py-2" onClick={() => confirm("Delete this quest and its submissions?") && remove.mutate(q.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {!quests.length && <p className="opacity-70">No quests yet.</p>}
      </div>
    </Panel>
  );
}
