/**
 * ============================================================================
 *  THE ONLY PLACE COLOURS LIVE
 * ============================================================================
 *
 *  To restyle the whole site, change ONE line:
 *
 *      export const ACTIVE_PALETTE: PaletteName = "emerald";
 *
 *  Every palette defines a light and a dark variant. From this file:
 *   - the CSS variables (--t-bg, --t-accent, …) behind every Tailwind colour
 *     class are generated (see app/layout.tsx → paletteCss()),
 *   - the link-preview images, favicon, PWA manifest and contact emails take
 *     their colours,
 *   - the terminal's default "production" theme and the 3D hero card follow.
 *
 *  To add a palette: copy one block below, rename it, adjust the values.
 *  Keep ink/muted on bg/surface at WCAG AA (4.5:1) or better, and the light
 *  accent at ≥ 4.5:1 on white so accent-coloured text stays readable.
 *
 *  What is deliberately NOT here: third-party brand colours (Mastercard,
 *  tech logos, macOS traffic lights, the alternate terminal themes) and
 *  neutral black drop-shadows — those are not part of the site's identity.
 *
 *  In development a small palette switcher (bottom-left) previews every
 *  palette live without editing this file; it is not shipped to production.
 * ============================================================================
 */

export type Tokens = {
  /** Page background */
  bg: string;
  /** Cards and panels */
  surface: string;
  /** Raised / nested surfaces, chips, code */
  surface2: string;
  /** Primary text */
  ink: string;
  /** Secondary text */
  muted: string;
  /** Hairline borders */
  line: string;
  /** Stronger borders, hover */
  line2: string;
  /** Signal colour: links, highlights, buttons */
  accent: string;
  /** Accent hover */
  accentHi: string;
  /** Text on an accent-filled button */
  accentContrast: string;
  /** Success / live */
  good: string;
  /** Error */
  bad: string;
  /** Soft card shadow colour */
  shadow: string;
};

/**
 * Colours used outside the light/dark token sets — things that stay dark in
 * both modes (terminal, 3D card, logo medallions) plus the link-preview images
 * and emails. All optional: anything left out is derived from the palette's
 * dark tokens (see `extrasOf`). A palette only sets these to pin exact values.
 */
export type Extras = {
  /** Skill-logo medallion gradient (always dark). */
  medallionFrom: string;
  medallionTo: string;
  /** 3D hero gift-card body gradient, three stops (always dark). */
  cardBody: [string, string, string];
  /** Terminal default theme — always dark, in both site modes. */
  terminalLine: string;
  terminalGlow: string;
  /** Background particle layer opacity in light mode (dark mode is always 0.6). */
  particleLightOpacity: number;
  /** Link-preview (Open Graph) images. */
  ogGlow: string;
  ogMuted: string;
  ogBorder: string;
  ogChip: string;
  /** Contact-form emails. */
  emailPage: string;
  emailBorder: string;
  emailFaint: string;
};

export type Palette = {
  label: string;
  description: string;
  light: Tokens;
  dark: Tokens;
  extras?: Partial<Extras>;
};

export const palettes = {
  /**
   * The original theme, exactly as committed before the redesign (7e5048d):
   * every token, plus the hard-coded card, medallion, terminal, image and
   * email colours of that version, pinned via `extras`.
   */
  coral: {
    label: "Pine & Coral (original)",
    description: "The original look: deep pine grounds with a warm coral signal; warm off-white in light mode.",
    light: {
      bg: "#f6f4ee",
      surface: "#ffffff",
      surface2: "#edeae1",
      ink: "#1c2a23",
      muted: "#57685e",
      line: "rgba(28, 42, 35, 0.13)",
      line2: "rgba(28, 42, 35, 0.26)",
      accent: "#bc4a2b",
      accentHi: "#9e3c20",
      accentContrast: "#ffffff",
      good: "#2e7d4f",
      bad: "#b04b4b",
      shadow: "rgba(0, 0, 0, 0.3)",
    },
    dark: {
      bg: "#0c1210",
      surface: "#111917",
      surface2: "#16211e",
      ink: "#e8efea",
      muted: "#8fa39a",
      line: "rgba(143, 163, 154, 0.16)",
      line2: "rgba(143, 163, 154, 0.32)",
      accent: "#ff8a66",
      accentHi: "#ffa285",
      accentContrast: "#21130d",
      good: "#7fc99b",
      bad: "#e08b8b",
      shadow: "rgba(0, 0, 0, 0.3)",
    },
    extras: {
      medallionFrom: "#0d1512",
      medallionTo: "#0a0e0c",
      cardBody: ["#13201c", "#0c1512", "#111e19"],
      terminalLine: "rgba(143, 163, 154, 0.16)",
      terminalGlow: "rgba(255, 138, 102, 0.12)",
      particleLightOpacity: 0.6,
      ogGlow: "#16241d",
      ogMuted: "#9db3a7",
      ogBorder: "#2b3a32",
      ogChip: "#c7d4cc",
      emailPage: "#0a0f0d",
      emailBorder: "#20302b",
      emailFaint: "#5f7168",
    },
  },

  emerald: {
    label: "Emerald",
    description: "Clean white with deep emerald; neutral near-black with soft mint.",
    light: {
      bg: "#ffffff",
      surface: "#f7faf8",
      surface2: "#eef4f0",
      ink: "#0f1f17",
      muted: "#55665d",
      line: "rgba(15, 31, 23, 0.1)",
      line2: "rgba(15, 31, 23, 0.2)",
      accent: "#047857",
      accentHi: "#065f46",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(15, 31, 23, 0.08)",
    },
    dark: {
      bg: "#0b0f0d",
      surface: "#111614",
      surface2: "#171d1a",
      ink: "#ecf3ef",
      muted: "#93a39b",
      line: "rgba(236, 243, 239, 0.09)",
      line2: "rgba(236, 243, 239, 0.18)",
      accent: "#34d399",
      accentHi: "#6ee7b7",
      accentContrast: "#052e1f",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.35)",
    },
  },

  forest: {
    label: "Forest & Cream",
    description: "Warm cream paper with forest green; editorial and calm.",
    light: {
      bg: "#fbfaf6",
      surface: "#ffffff",
      surface2: "#f2efe6",
      ink: "#1b2620",
      muted: "#5c665f",
      line: "rgba(27, 38, 32, 0.11)",
      line2: "rgba(27, 38, 32, 0.22)",
      accent: "#1f6f4a",
      accentHi: "#175a3b",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#b4432f",
      shadow: "rgba(27, 38, 32, 0.08)",
    },
    dark: {
      bg: "#0f1311",
      surface: "#151a17",
      surface2: "#1b221e",
      ink: "#eeeee6",
      muted: "#a0a89f",
      line: "rgba(238, 238, 230, 0.09)",
      line2: "rgba(238, 238, 230, 0.18)",
      accent: "#7fd1a8",
      accentHi: "#a6e3c4",
      accentContrast: "#0c2a1c",
      good: "#9be3b4",
      bad: "#f08c7a",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
  },

  ocean: {
    label: "Ocean Teal",
    description: "Crisp white with deep teal; ink-black with bright aqua.",
    light: {
      bg: "#ffffff",
      surface: "#f6fafa",
      surface2: "#ecf4f4",
      ink: "#0d1f22",
      muted: "#52676b",
      line: "rgba(13, 31, 34, 0.1)",
      line2: "rgba(13, 31, 34, 0.2)",
      accent: "#0f766e",
      accentHi: "#115e59",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(13, 31, 34, 0.08)",
    },
    dark: {
      bg: "#0a0f10",
      surface: "#101718",
      surface2: "#162021",
      ink: "#e9f3f3",
      muted: "#90a5a7",
      line: "rgba(233, 243, 243, 0.09)",
      line2: "rgba(233, 243, 243, 0.18)",
      accent: "#2dd4bf",
      accentHi: "#5eead4",
      accentContrast: "#042f2c",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.35)",
    },
  },

  midnight: {
    label: "Midnight Indigo",
    description: "White with confident indigo; deep navy-black with soft periwinkle.",
    light: {
      bg: "#ffffff",
      surface: "#f7f8fc",
      surface2: "#eef0f8",
      ink: "#11142a",
      muted: "#575c78",
      line: "rgba(17, 20, 42, 0.1)",
      line2: "rgba(17, 20, 42, 0.2)",
      accent: "#4338ca",
      accentHi: "#3730a3",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(17, 20, 42, 0.08)",
    },
    dark: {
      bg: "#0a0b12",
      surface: "#10121c",
      surface2: "#161927",
      ink: "#eceef8",
      muted: "#9a9fb8",
      line: "rgba(236, 238, 248, 0.09)",
      line2: "rgba(236, 238, 248, 0.18)",
      accent: "#a5b4fc",
      accentHi: "#c7d2fe",
      accentContrast: "#1e1b4b",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
  },

  graphite: {
    label: "Graphite & Blue",
    description: "Monochrome greys with one precise blue; the most neutral option.",
    light: {
      bg: "#ffffff",
      surface: "#f8f9fa",
      surface2: "#f0f2f4",
      ink: "#111418",
      muted: "#5b6370",
      line: "rgba(17, 20, 24, 0.1)",
      line2: "rgba(17, 20, 24, 0.2)",
      accent: "#2563eb",
      accentHi: "#1d4ed8",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(17, 20, 24, 0.08)",
    },
    dark: {
      bg: "#0b0c0e",
      surface: "#121417",
      surface2: "#181b1f",
      ink: "#eceef1",
      muted: "#9aa1ab",
      line: "rgba(236, 238, 241, 0.09)",
      line2: "rgba(236, 238, 241, 0.18)",
      accent: "#60a5fa",
      accentHi: "#93c5fd",
      accentContrast: "#0b1b3a",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
  },

  gold: {
    label: "Onyx & Gold",
    description: "Ivory with antique gold; onyx black with warm gold — the most premium-feeling.",
    light: {
      bg: "#fdfcf9",
      surface: "#ffffff",
      surface2: "#f5f1e8",
      ink: "#1a1712",
      muted: "#625b4e",
      line: "rgba(26, 23, 18, 0.11)",
      line2: "rgba(26, 23, 18, 0.22)",
      accent: "#8a6a12",
      accentHi: "#6f550e",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#b4432f",
      shadow: "rgba(26, 23, 18, 0.08)",
    },
    dark: {
      bg: "#0c0b09",
      surface: "#13120f",
      surface2: "#1a1915",
      ink: "#f2efe8",
      muted: "#a8a196",
      line: "rgba(242, 239, 232, 0.09)",
      line2: "rgba(242, 239, 232, 0.18)",
      accent: "#d4af37",
      accentHi: "#e6c766",
      accentContrast: "#2a2006",
      good: "#9be3b4",
      bad: "#f08c7a",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },

  sapphire: {
    label: "Sapphire & Gold",
    description: "Ivory with deep navy; midnight navy with champagne gold — private-bank feel.",
    light: {
      bg: "#fbfaf7",
      surface: "#ffffff",
      surface2: "#f1efe8",
      ink: "#0f1a33",
      muted: "#56607a",
      line: "rgba(15, 26, 51, 0.1)",
      line2: "rgba(15, 26, 51, 0.2)",
      accent: "#1e3a8a",
      accentHi: "#172e6e",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#b4432f",
      shadow: "rgba(15, 26, 51, 0.08)",
    },
    dark: {
      bg: "#0a1020",
      surface: "#0f172b",
      surface2: "#152037",
      ink: "#eef1f7",
      muted: "#9aa3b8",
      line: "rgba(238, 241, 247, 0.09)",
      line2: "rgba(238, 241, 247, 0.18)",
      accent: "#e5c07b",
      accentHi: "#f0d49c",
      accentContrast: "#2a1f05",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },

  bordeaux: {
    label: "Bordeaux",
    description: "Warm paper with deep wine; near-black with dusty rose — refined and warm.",
    light: {
      bg: "#fdfbf8",
      surface: "#ffffff",
      surface2: "#f5efe9",
      ink: "#22161a",
      muted: "#6a5a5f",
      line: "rgba(34, 22, 26, 0.1)",
      line2: "rgba(34, 22, 26, 0.2)",
      accent: "#8b1e3f",
      accentHi: "#6f1832",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#c2410c",
      shadow: "rgba(34, 22, 26, 0.08)",
    },
    dark: {
      bg: "#0e0b0c",
      surface: "#151112",
      surface2: "#1c1719",
      ink: "#f3eeef",
      muted: "#a89ca0",
      line: "rgba(243, 238, 239, 0.09)",
      line2: "rgba(243, 238, 239, 0.18)",
      accent: "#e8a3b8",
      accentHi: "#f2c2d1",
      accentContrast: "#3b0d1c",
      good: "#9be3b4",
      bad: "#fb923c",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },

  plum: {
    label: "Royal Plum",
    description: "White with rich violet; deep aubergine-black with soft lavender.",
    light: {
      bg: "#ffffff",
      surface: "#faf8fd",
      surface2: "#f2eefa",
      ink: "#1a1428",
      muted: "#5f5873",
      line: "rgba(26, 20, 40, 0.1)",
      line2: "rgba(26, 20, 40, 0.2)",
      accent: "#6d28d9",
      accentHi: "#5b21b6",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(26, 20, 40, 0.08)",
    },
    dark: {
      bg: "#0c0a12",
      surface: "#13101b",
      surface2: "#1a1625",
      ink: "#f1eef8",
      muted: "#a29cb5",
      line: "rgba(241, 238, 248, 0.09)",
      line2: "rgba(241, 238, 248, 0.18)",
      accent: "#c4b5fd",
      accentHi: "#ddd6fe",
      accentContrast: "#2e1065",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
  },

  copper: {
    label: "Charcoal & Copper",
    description: "Linen with burnished copper; charcoal with warm bronze — crafted, industrial.",
    light: {
      bg: "#faf8f5",
      surface: "#ffffff",
      surface2: "#f2ede6",
      ink: "#1f1a16",
      muted: "#645b53",
      line: "rgba(31, 26, 22, 0.1)",
      line2: "rgba(31, 26, 22, 0.2)",
      accent: "#9a4a1f",
      accentHi: "#7d3b18",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#b91c1c",
      shadow: "rgba(31, 26, 22, 0.08)",
    },
    dark: {
      bg: "#0d0c0b",
      surface: "#151311",
      surface2: "#1c1916",
      ink: "#f2eee9",
      muted: "#a69e95",
      line: "rgba(242, 238, 233, 0.09)",
      line2: "rgba(242, 238, 233, 0.18)",
      accent: "#e0a274",
      accentHi: "#ecbf9b",
      accentContrast: "#3a1d0a",
      good: "#9be3b4",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },

  sage: {
    label: "Sage & Stone",
    description: "Stone white with muted sage; soft charcoal with pale sage — quiet, natural, very calm.",
    light: {
      bg: "#f8f8f5",
      surface: "#ffffff",
      surface2: "#eef0eb",
      ink: "#1c221e",
      muted: "#5f6862",
      line: "rgba(28, 34, 30, 0.1)",
      line2: "rgba(28, 34, 30, 0.2)",
      accent: "#4d6b57",
      accentHi: "#3d5646",
      accentContrast: "#ffffff",
      good: "#2f7d4f",
      bad: "#b4432f",
      shadow: "rgba(28, 34, 30, 0.08)",
    },
    dark: {
      bg: "#0d0f0e",
      surface: "#141715",
      surface2: "#1a1e1b",
      ink: "#eef0ec",
      muted: "#a1aaa3",
      line: "rgba(238, 240, 236, 0.09)",
      line2: "rgba(238, 240, 236, 0.18)",
      accent: "#a9c4b0",
      accentHi: "#c6dacb",
      accentContrast: "#1c2b21",
      good: "#9be3b4",
      bad: "#f08c7a",
      shadow: "rgba(0, 0, 0, 0.4)",
    },
  },

  mono: {
    label: "Monochrome",
    description: "Pure black and white, no accent hue — editorial, Apple/Vercel-style restraint.",
    light: {
      bg: "#ffffff",
      surface: "#fafafa",
      surface2: "#f2f2f2",
      ink: "#0a0a0a",
      muted: "#5e5e5e",
      line: "rgba(10, 10, 10, 0.1)",
      line2: "rgba(10, 10, 10, 0.2)",
      accent: "#111111",
      accentHi: "#000000",
      accentContrast: "#ffffff",
      good: "#15803d",
      bad: "#b91c1c",
      shadow: "rgba(10, 10, 10, 0.08)",
    },
    dark: {
      bg: "#0a0a0a",
      surface: "#121212",
      surface2: "#191919",
      ink: "#f5f5f5",
      muted: "#a3a3a3",
      line: "rgba(245, 245, 245, 0.09)",
      line2: "rgba(245, 245, 245, 0.18)",
      accent: "#f5f5f5",
      accentHi: "#ffffff",
      accentContrast: "#0a0a0a",
      good: "#86efac",
      bad: "#f87171",
      shadow: "rgba(0, 0, 0, 0.45)",
    },
  },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

/* ─────────────────────────────────────────────────────────────────────────
 *  ▶ CHANGE THIS ONE LINE TO RESTYLE THE SITE
 * ───────────────────────────────────────────────────────────────────────── */
export const ACTIVE_PALETTE: PaletteName = "coral";

/** The active palette — for places that cannot read CSS variables (images, emails). */
export const palette: Palette = palettes[ACTIVE_PALETTE];

/** The active palette's dark tokens — used by link-preview images, icons and emails. */
export const brandDark: Tokens = palette.dark;

/** `#rrggbb` → `rgba(r, g, b, a)` — for places without color-mix (emails, canvas). */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Mixes a #rrggbb colour toward near-black (#080808) by `t` (0–1). */
function towardBlack(hex: string, t: number): string {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  if (Number.isNaN(n)) return "#0c0c0c";
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - t) + 8 * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/** A palette's extras, with every omitted value derived from its dark tokens. */
export function extrasOf(p: Palette): Extras {
  const d = p.dark;
  return {
    medallionFrom: d.surface2,
    medallionTo: d.bg,
    cardBody: [towardBlack(d.accent, 0.86), towardBlack(d.accent, 0.92), towardBlack(d.accent, 0.88)],
    terminalLine: d.line,
    terminalGlow: alpha(d.accent, 0.12),
    particleLightOpacity: 0.28,
    ogGlow: d.surface2,
    ogMuted: d.muted,
    ogBorder: d.line2,
    ogChip: d.ink,
    emailPage: d.bg,
    emailBorder: alpha(d.ink, 0.14),
    emailFaint: alpha(d.muted, 0.7),
    ...p.extras,
  };
}

/** The active palette's resolved extras — for images and emails. */
export const brandExtras: Extras = extrasOf(palette);

/* ───────────────────────── CSS variable generation ──────────────────────── */

const VAR: Record<keyof Tokens, string> = {
  bg: "--t-bg",
  surface: "--t-surface",
  surface2: "--t-surface-2",
  ink: "--t-ink",
  muted: "--t-muted",
  line: "--t-line",
  line2: "--t-line-2",
  accent: "--t-accent",
  accentHi: "--t-accent-hi",
  accentContrast: "--t-accent-contrast",
  good: "--t-good",
  bad: "--t-bad",
  shadow: "--t-shadow",
};

function block(t: Tokens, scheme: "light" | "dark", p: Palette): string {
  const vars = (Object.keys(VAR) as (keyof Tokens)[]).map((k) => `${VAR[k]}:${t[k]};`).join("");
  const d = p.dark;
  const x = extrasOf(p);
  // Things that stay dark in BOTH modes: logo medallions, the 3D card, and
  // the terminal's default theme (it always reads as a dark console).
  const alwaysDark =
    `--t-medallion-from:${x.medallionFrom};--t-medallion-to:${x.medallionTo};` +
    `--t-card-1:${x.cardBody[0]};--t-card-2:${x.cardBody[1]};--t-card-3:${x.cardBody[2]};` +
    `--t-term-bg:${d.bg};--t-term-surface:${d.surface};--t-term-ink:${d.ink};--t-term-muted:${d.muted};` +
    `--t-term-accent:${d.accent};--t-term-good:${d.good};--t-term-bad:${d.bad};` +
    `--t-term-line:${x.terminalLine};--t-term-glow:${x.terminalGlow};`;
  const particles = `--t-particle-opacity:${scheme === "light" ? x.particleLightOpacity : 0.6};`;
  return `${vars}${alwaysDark}${particles}color-scheme:${scheme};`;
}

/**
 * The CSS that defines every theme token. Light is the default (no data-theme
 * yet, or data-theme="light"); data-theme="dark" switches. Each palette is
 * scoped by html[data-palette] so the dev switcher can flip between them.
 */
export function paletteCss(names: PaletteName[] = [ACTIVE_PALETTE]): string {
  return names
    .map((n) => {
      const p: Palette = palettes[n];
      const sel = `html[data-palette="${n}"]`;
      return `${sel},${sel}[data-theme="light"]{${block(p.light, "light", p)}}${sel}[data-theme="dark"]{${block(p.dark, "dark", p)}}`;
    })
    .join("");
}
