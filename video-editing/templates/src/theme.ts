import { loadFont } from "@remotion/google-fonts/Inter";

// Swap these for the brand you're working on. Every scene and kit piece reads from here.
export const { fontFamily } = loadFont("normal", { weights: ["600", "800"], subsets: ["latin"] });

export const FPS = 30;

export const C = {
  bg: "#fffdf7",
  ink: "#18181b",
  muted: "#71717a",
  accent: "#fbbf24",
  card: "#ffffff",
};

// Platform UI covers the top and bottom of a 9:16 frame. Keep key info out of these bands.
export const SAFE = { top: 200, bottom: 250, side: 70 };
