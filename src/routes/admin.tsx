import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { btnClass } from "@/components/quest/ui";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — UI Revamp Challenge" },
      { name: "description", content: "Manage quests, themes, rules, participants and XP." },
      { property: "og:title", content: "Admin — UI Revamp Challenge" },
      { property: "og:description", content: "Admin control room for the UI Revamp quest." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/quests", label: "Quests" },
  { to: "/admin/themes", label: "Themes" },
  { to: "/admin/rules", label: "Rules" },
  { to: "/admin/participants", label: "Participants" },
  { to: "/admin/xp", label: "XP & Submissions" },
] as const;

function AdminLayout() {
  const { session, ready } = useAuth();
  const { isAdmin, loading } = useIsAdmin();

  if (!ready || loading) return <Center>Checking access…</Center>;
  if (!session)
    return (
      <Center>
        <p className="mb-4">Sign in to open the admin area.</p>
        <Link to="/auth" className={btnClass("primary")}>Login</Link>
      </Center>
    );
  if (!isAdmin) return <Center>This area is for admins only.</Center>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="mb-6 font-display text-4xl font-extrabold uppercase">Admin</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} activeOptions={{ exact: true }}
            className="rounded-xl border-2 border-text/30 px-4 py-2 font-display text-sm font-bold"
            activeProps={{ className: "!border-ink bg-card text-card-foreground" }}>
            {t.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-5 py-24 text-center font-display text-xl font-extrabold">{children}</div>;
}
