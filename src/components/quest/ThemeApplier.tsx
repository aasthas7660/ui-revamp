import { useEffect } from "react";
import { useActiveQuest, useThemes, type ThemeRow } from "@/lib/db";

export const THEME_FONTS = ["Bricolage Grotesque", "Space Grotesk", "Archivo Black", "Syne", "Outfit", "DM Sans"];

export function applyTheme(t: ThemeRow) {
  const r = document.documentElement.style;
  r.setProperty("--primary", t.primary_color);
  r.setProperty("--secondary", t.secondary_color);
  r.setProperty("--background", t.background_color);
  r.setProperty("--surface", `color-mix(in oklab, ${t.background_color} 85%, white)`);
  r.setProperty("--card", t.card_color);
  r.setProperty("--muted", `color-mix(in oklab, ${t.card_color} 88%, black)`);
  r.setProperty("--text", t.text_color);
  r.setProperty("--accent", t.accent_color);
  r.setProperty("--radius", `${t.border_radius / 16}rem`);
  r.setProperty("--font-display", `"${t.font}", system-ui, sans-serif`);
  r.setProperty("--shadow-btn", t.button_style === "flat" ? "none" : t.button_style === "soft" ? "0 6px 18px -6px var(--ink)" : "5px 5px 0 0 var(--ink)");
  r.setProperty("--shadow-card", t.card_style === "flat" ? "none" : t.card_style === "soft" ? "0 10px 30px -10px var(--ink)" : "5px 5px 0 0 var(--ink)");
  r.setProperty("--shadow-block-light", t.card_style === "flat" ? "none" : `5px 5px 0 0 color-mix(in oklab, ${t.text_color} 90%, transparent)`);

  const id = "theme-font";
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.font).replace(/%20/g, "+")}:wght@400;700;800&display=swap`;
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) { link = document.createElement("link"); link.id = id; link.rel = "stylesheet"; document.head.appendChild(link); }
  if (link.href !== href) link.href = href;
}

/** Applies the active quest's theme (or the globally active theme) to the whole site. */
export function ThemeApplier() {
  const { data: quest } = useActiveQuest();
  const { data: themes } = useThemes();
  useEffect(() => {
    if (!themes?.length) return;
    const t = themes.find((x) => x.id === quest?.theme_id) ?? themes.find((x) => x.is_active);
    if (t) applyTheme(t);
  }, [quest, themes]);
  return null;
}
