import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/quest/ui";
import { Field, Input, Panel, Pill, Textarea } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/rules")({ component: RulesAdmin });

type Draft = TablesInsert<"rules">;

function RulesAdmin() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<Draft | null>(null);
  const { data: rules = [] } = useQuery({
    queryKey: ["rules", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rules").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["rules"] });
  const run = useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: unknown }>) => {
      const { error } = await fn();
      if (error) throw error;
    },
    onSuccess: () => { refresh(); setEdit(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveDraft = (d: Draft) => run.mutate(() => (d.id ? supabase.from("rules").update(d).eq("id", d.id) : supabase.from("rules").insert(d)));
  const move = (i: number, dir: -1 | 1) => {
    const a = rules[i], b = rules[i + dir];
    if (!a || !b) return;
    run.mutate(async () => {
      const r1 = await supabase.from("rules").update({ display_order: b.display_order === a.display_order ? a.display_order + dir : b.display_order }).eq("id", a.id);
      const r2 = await supabase.from("rules").update({ display_order: a.display_order }).eq("id", b.id);
      return { error: r1.error ?? r2.error };
    });
  };

  return (
    <div className="space-y-6">
      {edit && (
        <Panel title={edit.id ? "Edit rule" : "New rule"}>
          <form className="grid gap-4 md:grid-cols-[1fr_120px]" onSubmit={(e) => { e.preventDefault(); saveDraft(edit); }}>
            <Field label="Title"><Input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
            <Field label="Icon"><Input value={edit.icon ?? ""} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} /></Field>
            <Field label="Description" className="md:col-span-2"><Textarea value={edit.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></Field>
            <div className="flex gap-3 md:col-span-2">
              <Button type="submit">Save rule</Button>
              <Button type="button" variant="cream" onClick={() => setEdit(null)}>Cancel</Button>
            </div>
          </form>
        </Panel>
      )}
      <Panel title="Rules" action={<Button onClick={() => setEdit({ title: "", description: "", icon: "✦", display_order: (rules.at(-1)?.display_order ?? 0) + 1, active: true })}>+ New rule</Button>}>
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink/20 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <div className="font-display font-extrabold">{r.title} {!r.active && <Pill>Hidden</Pill>}</div>
                  <div className="text-sm opacity-70">{r.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="cream" className="px-3 py-2" disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
                <Button variant="cream" className="px-3 py-2" disabled={i === rules.length - 1} onClick={() => move(i, 1)}>↓</Button>
                <Button variant="secondary" className="px-3 py-2" onClick={() => run.mutate(() => supabase.from("rules").update({ active: !r.active }).eq("id", r.id))}>{r.active ? "Hide" : "Show"}</Button>
                <Button variant="cream" className="px-3 py-2" onClick={() => setEdit(r)}>Edit</Button>
                <Button variant="ink" className="px-3 py-2" onClick={() => confirm("Delete rule?") && run.mutate(() => supabase.from("rules").delete().eq("id", r.id))}>Delete</Button>
              </div>
            </div>
          ))}
          {!rules.length && <p className="opacity-70">No rules yet.</p>}
        </div>
      </Panel>
    </div>
  );
}
