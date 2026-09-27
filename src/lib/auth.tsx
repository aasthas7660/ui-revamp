import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = { session: Session | null; ready: boolean };
const Ctx = createContext<AuthCtx>({ session: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthCtx>({ session: null, ready: false });
  const qc = useQueryClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, ready: true });
      if (event === "SIGNED_IN" && session) void ensureProfile(session);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        qc.invalidateQueries({ queryKey: ["is-admin"] });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, ready: true });
      if (data.session) void ensureProfile(data.session);
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

async function ensureProfile(session: Session) {
  const meta = (session.user.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string; picture?: string };
  await supabase.rpc("sync_my_profile", {
    _name: meta.full_name ?? meta.name ?? "",
    _avatar: meta.avatar_url ?? meta.picture ?? "",
  });
}

export async function signInWithGoogle() {
  const { lovable } = await import("@/integrations/lovable/index");
  const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  if (result.error) throw result.error;
}

export const useAuth = () => useContext(Ctx);

export function useIsAdmin() {
  const { session, ready } = useAuth();
  const q = useQuery({
    queryKey: ["is-admin", session?.user.id ?? null],
    enabled: ready && !!session,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return !!data;
    },
  });
  return { isAdmin: !!q.data, loading: !ready || (!!session && q.isLoading) };
}
