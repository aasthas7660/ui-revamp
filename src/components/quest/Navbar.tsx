import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { btnClass } from "./ui";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/quest", label: "Quest" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/rules", label: "Rules" },
] as const;

function AccountButtons({ onDone, full }: { onDone?: () => void; full?: boolean }) {
  const { session } = useAuth();
  const { isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const navigate = useNavigate();
  if (!session) {
    return <Link to="/auth" onClick={onDone} className={btnClass("secondary", full ? "w-full" : "px-4 py-2")}>Login</Link>;
  }
  const signOut = async () => {
    onDone?.();
    await qc.cancelQueries();
    await supabase.auth.signOut();
    qc.removeQueries({ queryKey: ["is-admin"] });
    navigate({ to: "/", replace: true });
  };
  return (
    <div className={full ? "space-y-2" : "flex items-center gap-2"}>
      {isAdmin && <Link to="/admin" onClick={onDone} className={btnClass("primary", full ? "w-full" : "px-4 py-2")}>Admin</Link>}
      <button onClick={signOut} className={btnClass("cream", full ? "w-full" : "px-4 py-2")}>Sign out</button>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b-2 border-text/10 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-text bg-primary text-primary-foreground">✦</span>
          UI REVAMP
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
              className="rounded-xl px-4 py-2 font-display text-sm font-bold text-text/70 transition hover:text-text"
              activeProps={{ className: "bg-card !text-card-foreground" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:block"><AccountButtons /></div>
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="rounded-xl border-2 border-text p-2 md:hidden">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div className="animate-page-in space-y-2 border-t-2 border-text/10 px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
              className="block rounded-xl px-4 py-3 font-display font-bold"
              activeProps={{ className: "bg-card text-card-foreground" }}>
              {l.label}
            </Link>
          ))}
          <AccountButtons full onDone={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
