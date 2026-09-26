// Centralized mock data — replace with backend queries in Phase 2.
export type QuestStatus = "open" | "upcoming" | "closed";

export interface Quest {
  id: string;
  number: string;
  title: string;
  description: string;
  xp: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: QuestStatus;
  endsAt: string;
  progress: number;
  targetWebsite: { name: string; url: string };
  details: string[];
  deliverables: string[];
  aiPolicy: string;
  aiTools: string[];
}

export const mockQuest: Quest = {
  id: "quest-01",
  number: "01",
  title: "UI Revamp Challenge",
  description:
    "Take an existing website. Reimagine its interface. Build your version — cleaner, bolder, and actually fun to use.",
  xp: 50,
  difficulty: "Medium",
  status: "open",
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 7).toISOString(),
  progress: 62,
  targetWebsite: { name: "TechTitans", url: "https://techtitansweb26-beta.vercel.app/home" },
  details: [
    "Redesign the homepage of the assigned target website.",
    "Keep the core content, rethink layout, hierarchy and visuals.",
    "Make it fully responsive — mobile matters.",
    "Bonus XP for accessibility and thoughtful micro-interactions.",
  ],
  deliverables: ["GitHub Repository", "Live Website"],
  aiPolicy:
    "AI tools are allowed. You're responsible for the final result — understand and own every line you ship.",
  aiTools: ["ChatGPT", "Claude", "Gemini", "Lovable", "Bolt", "v0", "Cursor"],
};

export const mockSteps = [
  { n: "01", title: "Pick the Challenge", text: "Open the current quest and study the target website." },
  { n: "02", title: "Redesign the Interface", text: "Sketch, iterate and reimagine the experience your way." },
  { n: "03", title: "Deploy Your Website", text: "Ship it live on any host so anyone can visit." },
  { n: "04", title: "Submit Your Work", text: "Drop your GitHub + live link and claim your XP." },
];

export const mockRules = [
  "Redesign the assigned page.",
  "Your submission must be your own work.",
  "AI tools may be used.",
  "Website must be publicly accessible.",
  "Submit GitHub + Live Website.",
  "Submission closes when the quest ends.",
  "Late submissions are not accepted.",
  "Incomplete submissions may be rejected.",
];

export const mockLeaderboard = [
  { rank: 1, name: "Pixel Pirates", members: 3, xp: 1000 },
  { rank: 2, name: "Byte Bandits", members: 2, xp: 850 },
  { rank: 3, name: "Aastha S.", members: 1, xp: 700 },
  { rank: 4, name: "Grid Goblins", members: 4, xp: 620 },
  { rank: 5, name: "Neon Nomads", members: 2, xp: 540 },
];
