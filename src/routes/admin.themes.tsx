import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useThemes } from "@/lib/db";
import { Button } from "@/components/quest/ui";
import { Field, Input, Panel, Pill, Select } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/themes")({ component: ThemesAdmin });

type Draft = TablesInsert<"themes">;
const colors = ["primary_color", "secondary_color", "background_color", "card_color", "text_color", "accent_color"] as const;
const blank = (): Draft => ({
  name: "New theme", primary_color: "#3b5bdb", secondary_color: "#a8e6cf", background_color: "#141519", card_color: "#f5f0e1",
  text_color: "#f7f3e8", accent_color: "#d4e84a", font: "Bricolage Grotesque", border_radius: 24, button_style: "block", card_style: "block",
});

function ThemesAdmin() {
  const qc = useQueryClient();
  const { data: themes = [] } = useThemes();
  const [edit, setEdit] = useState<Draft | null>(null);
  const done = (msg: string) => { toast.success(msg); qc.invalidateQueries({ queryKey: ["themes"] }); };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const { error } = d.id ? await supabase.from("themes").update(d).eq("id", d.id) : await supabase.from("themes").insert(d);
      if (error) throw error;
    },
    onSuccess: () => { setEdit(null); done("Theme saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const activate = useMutation({
    mutationFn: async (id: string) => {
      const a = await supabase.from("themes").update({ is_active: false }).neq("id", id);
      if (a.error) throw a.error;
      const b = await supabase.from("themes").update({ is_active: true }).eq("id", id);
      if (b.error) throw b.error;
    },
    onSuccess: () => done("Theme is now live"),
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("themes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => done("Theme deleted"),
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  if (edit) {
    return (
      <Panel title={edit.id ? "Edit theme" : "New theme"}>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={(e) => { e.preventDefault(); save.mutate(edit); }}>
          <Field label="Name"><Input required value={edit.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Font">
            <Select value={edit.font} onChange={(e) => set("font", e.target.value)}>
              {["Bricolage Grotesque", "DM Sans", "Space Grotesk", "Syne", "Outfit"].map((f) => <option key={f}>{f}</option>)}
            </Select>
          </Field>
          <Field label="Corner roundness (px)"><Input type="number" min={0} max={48} value={edit.border_radius} onChange={(e) => set("border_radius", Number(e.target.value))} /></Field>
          {colors.map((c) => (
            <Field key={c} label={c.replace("_color", "").replace("_", " ")}>
              <div className="flex gap-2">
                <input type="color" value={edit[c] ?? "#000000"} onChange={(e) => set(c, e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border-2 border-ink" />
                <Input value={edit[c] ?? ""} onChange={(e) => set(c, e.target.value)} />
              </div>
            </Field>
          ))}
          <Field label="Button style">
            <Select value={edit.button_style} onChange={(e) => set("button_style", e.target.value)}>
              {["block", "flat", "soft"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Card style">
            <Select value={edit.card_style} onChange={(e) => set("card_style", e.target.value)}>
              {["block", "flat", "soft"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="flex gap-3 md:col-span-3">
            <Button type="submit" disabled={save.isPending}>Save theme</Button>
            <Button type="button" variant="cream" onClick={() => setEdit(null)}>Cancel</Button>
          </div>
        </form>
      </Panel>
    );
  }

  return (
    <Panel title="Themes" action={<Button onClick={() => setEdit(blank())}>+ New theme</Button>}>
      <div className="grid gap-4 md:grid-cols-2">
        {themes.map((t) => (
          <div key={t.id} className="rounded-2xl border-2 border-ink/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display font-extrabold">{t.name}</span>
              {t.is_active && <Pill tone="accent">Live</Pill>}
            </div>
            <div className="mb-4 flex gap-1">
              {colors.map((c) => <span key={c} title={c} className="h-8 flex-1 rounded-md border-2 border-ink" style={{ background: t[c] }} />)}
            </div>
            <div className="flex flex-wrap gap-2">
              {!t.is_active && <Button className="px-3 py-2" onClick={() => activate.mutate(t.id)}>Make live</Button>}
              <Button variant="cream" className="px-3 py-2" onClick={() => setEdit(t)}>Edit</Button>
              {!t.is_active && <Button variant="ink" className="px-3 py-2" onClick={() => confirm("Delete theme?") && remove.mutate(t.id)}>Delete</Button>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
