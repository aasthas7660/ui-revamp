import { supabase } from "@/integrations/supabase/client";

/** Admin-only: add (or subtract) XP for a participant and mirror it onto the leaderboard. */
export async function adjustXp(profileId: string, delta: number, completedDelta = 0) {
  const { data: p, error } = await supabase.from("profiles").select("*").eq("id", profileId).single();
  if (error) throw error;
  const total_xp = Math.max(0, p.total_xp + delta);
  const quests_completed = Math.max(0, p.quests_completed + completedDelta);
  const u = await supabase.from("profiles").update({ total_xp, quests_completed }).eq("id", profileId);
  if (u.error) throw u.error;
  const name = p.username || p.name || p.email || "Player";
  const { data: row } = await supabase.from("leaderboard").select("id").eq("profile_id", profileId).maybeSingle();
  const l = row
    ? await supabase.from("leaderboard").update({ xp: total_xp, name }).eq("id", row.id)
    : await supabase.from("leaderboard").insert({ profile_id: profileId, name, xp: total_xp, members: 1 });
  if (l.error) throw l.error;
}
