import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/quest/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login — UI Revamp Challenge" },
      { name: "description", content: "Sign in or create an account to join the UI Revamp quest." },
      { property: "og:title", content: "Login — UI Revamp Challenge" },
      { property: "og:description", content: "Sign in to submit your quest and earn XP." },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-2xl border-[3px] border-ink bg-card px-4 py-3 text-card-foreground outline-none focus:shadow-[var(--shadow-block)]";

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: admin } = await supabase.rpc("is_admin");
        navigate({ to: admin ? "/admin" : "/quest" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { name, username: username || null } },
        });
        if (error) throw error;
        setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="card-block p-7">
        <h1 className="font-display text-4xl font-extrabold uppercase">{mode === "in" ? "Welcome back" : "Join the quest"}</h1>
        {sent ? (
          <p className="mt-4">Check your email and click the confirmation link, then come back and log in.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "up" && (
              <>
                <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className={input} placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} />
              </>
            )}
            <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className={input} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" disabled={busy} className="w-full">{busy ? "…" : mode === "in" ? "Log in" : "Create account"}</Button>
          </form>
        )}
        <button className="mt-5 text-sm underline underline-offset-4" onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }}>
          {mode === "in" ? "No account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
