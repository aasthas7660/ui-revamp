import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btnClass } from "@/components/quest/ui";
import { signInWithGoogle, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — UI Revamp Challenge" },
      { name: "description", content: "Sign in to join the UI Revamp Challenge and access your participant account." },
      { property: "og:title", content: "Login — UI Revamp Challenge" },
      { property: "og:description", content: "Sign in with Google or GitHub to submit your quest and earn XP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function AuthPage() {
  const [busy, setBusy] = useState<null | "google" | "github">(null);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    supabase.rpc("is_admin").then(({ data }) => navigate({ to: data ? "/admin" : "/quest", replace: true }));
  }, [session, navigate]);

  const google = async () => {
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
    setBusy(null);
  };

  const github = async () => {
    setBusy("github");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch {
      toast.error("GitHub sign-in isn't available yet. Please use Google for now.");
      setBusy(null);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-10rem)] place-items-center px-5 py-12">
      <div className="card-block w-full max-w-md animate-page-in p-7 md:p-9 text-center">
        <span className="inline-block rounded-full border-2 border-ink bg-secondary px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-secondary-foreground">
          UI Revamp Challenge
        </span>
        <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-none md:text-6xl">Login</h1>
        <p className="mt-3 text-muted-foreground">Sign in to join the challenge and access your participant account.</p>

        <div className="mt-8 space-y-4">
          <button type="button" onClick={google} disabled={!!busy} className={btnClass("cream", "w-full py-4 text-base")}>
            <GoogleIcon /> {busy === "google" ? "…" : "Continue with Google"}
          </button>
          <button type="button" onClick={github} disabled={!!busy} className={btnClass("primary", "w-full py-4 text-base")}>
            <GithubIcon /> {busy === "github" ? "…" : "Continue with GitHub"}
          </button>
        </div>

        <div className="mt-8 border-t-2 border-ink/15 pt-5">
          <p className="font-display text-sm font-bold">🔒 Secure authentication powered by Supabase.</p>
          <p className="mt-1 text-xs text-muted-foreground">By signing in, you agree to the rules of the UI Revamp Challenge.</p>
        </div>
      </div>
    </div>
  );
}
