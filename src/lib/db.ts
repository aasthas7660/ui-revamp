import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Quest, QuestStatus } from "@/data/mock";

export type QuestRow = Tables<"quests">;
export type ThemeRow = Tables<"themes">;
export type RuleRow = Tables<"rules">;
export type LeaderRow = Tables<"leaderboard">;

export const QUEST_STATUSES = ["draft", "upcoming", "open", "closed", "judging", "completed", "archived"] as const;
export const AI_TOOLS = ["ChatGPT", "Claude", "Gemini", "Lovable", "Bolt", "v0", "Cursor"];

/** Time-based status: before start → upcoming, during → open, after → closed. */
export function liveStatus(q: Pick<QuestRow, "start_at" | "end_at">, now = Date.now()): QuestStatus {
  const s = new Date(q.start_at).getTime();
  const e = new Date(q.end_at).getTime();
  if (now < s) return "upcoming";
  if (now > e) return "closed";
  return "open";
}

export function toQuest(q: QuestRow): Quest {
  const status = liveStatus(q);
  const s = new Date(q.start_at).getTime();
  const e = new Date(q.end_at).getTime();
  const progress = status === "upcoming" ? 0 : status === "closed" ? 100 : Math.round(((Date.now() - s) / Math.max(1, e - s)) * 100);
  return {
    id: q.id,
    number: q.number,
    title: q.title,
    description: q.description,
    xp: q.xp_reward,
    difficulty: (q.difficulty as Quest["difficulty"]) ?? "Medium",
    status,
    endsAt: status === "upcoming" ? q.start_at : q.end_at,
    progress,
    targetWebsite: { name: q.target_website_url ?? "Target website", url: q.target_page_url || q.target_website_url || "" },
    details: q.instructions.split("\n").map((l) => l.trim()).filter(Boolean),
    deliverables: ["GitHub Repository", "Live Website"],
    aiPolicy: q.ai_allowed ? q.ai_policy : "AI tools are not allowed for this quest.",
    aiTools: q.ai_allowed ? AI_TOOLS : [],
  };
}

/** Active quest = currently live one, else next upcoming, else most recent visible. */
export function pickActive(rows: QuestRow[]): QuestRow | null {
  const visible = rows.filter((r) => !["draft", "archived"].includes(r.status));
  const live = visible.filter((r) => r.status === "open" && liveStatus(r) === "open");
  if (live[0]) return live[0];
  const upcoming = visible.filter((r) => liveStatus(r) === "upcoming").sort((a, b) => a.start_at.localeCompare(b.start_at));
  if (upcoming[0]) return upcoming[0];
  return visible.sort((a, b) => b.end_at.localeCompare(a.end_at))[0] ?? null;
}

export function useActiveQuest() {
  return useQuery({
    queryKey: ["active-quest"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quests").select("*").order("start_at", { ascending: false });
      if (error) throw error;
      return pickActive(data ?? []);
    },
  });
}

export function useThemes() {
  return useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("themes").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActiveRules() {
  return useQuery({
    queryKey: ["rules", "active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rules").select("*").eq("active", true).order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leaderboard").select("*").order("xp", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
