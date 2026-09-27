import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/quest/ui";
import { signInWithGoogle, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — UI Revamp Challenge" },
      { name: "description", content: "Continue with Google to join the UI Revamp quest." },
      { property: "og:title", content: "Login — UI Revamp Challenge" },
      { property: "og:description", content: "Sign in with Google to submit your quest and earn XP." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    supabase.rpc("is_admin").then(({ data }) => navigate({ to: data ? "/admin" : "/quest", replace: true }));
  }, [session, navigate]);

  const go = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="card-block p-7">
        <h1 className="font-display text-4xl font-extrabold uppercase">Join the quest</h1>
        <p className="mt-3">Sign in with your Google account to submit challenges and earn XP.</p>
        <Button type="button" onClick={go} disabled={busy} className="mt-6 w-full">
          {busy ? "…" : "Login"}
        </Button>
      </div>
    </div>
  );
}
