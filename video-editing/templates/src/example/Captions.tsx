// Word-highlight captions. A new "page" at each sentence end or every ~1.1s,
// the word being spoken is highlighted. Only shown on scenes that don't already
// spell the words out on screen.
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../theme";
import { sceneRange, VO_OFFSET, WORDS } from "./timing";

const SWITCH_EVERY_MS = 1100;
const CAPTION_SCENES = ["proof"];

type CapPage = { startMs: number; tokens: { text: string; fromMs: number; toMs: number }[] };

const buildPages = (): CapPage[] => {
  const pages: CapPage[] = [];
  let cur: CapPage | null = null;
  for (const w of WORDS) {
    if (!cur) cur = { startMs: w.startMs, tokens: [] };
    cur.tokens.push({ text: w.text, fromMs: w.startMs, toMs: w.endMs });
    if (/[.?!]$/.test(w.text.trim()) || w.endMs - cur.startMs >= SWITCH_EVERY_MS) {
      pages.push(cur);
      cur = null;
    }
  }
  if (cur) pages.push(cur);
  return pages;
};

const Page: React.FC<{ page: CapPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 220, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ top: 1320, height: 260, alignItems: "center" }}>
      <div
        style={{
          maxWidth: 900,
          background: C.card,
          border: `6px solid ${C.ink}`,
          borderRadius: 30,
          boxShadow: `10px 10px 0 ${C.ink}`,
          padding: "16px 30px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 16,
          fontFamily,
          fontSize: 62,
          fontWeight: 800,
          lineHeight: 1.2,
          color: C.ink,
          scale: String(interpolate(p, [0, 1], [0.85, 1])),
        }}
      >
        {page.tokens.map((tok) => {
          const active = tok.fromMs <= nowMs && tok.toMs > nowMs;
          return (
            <span
              key={tok.fromMs}
              style={{ background: active ? C.accent : "transparent", borderRadius: 12, padding: "0 8px", margin: "0 -8px" }}
            >
              {tok.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ReelCaptions: React.FC = () => {
  const { fps } = useVideoConfig();
  const pages = useMemo(buildPages, []);
  const ranges = CAPTION_SCENES.map((id) => {
    const r = sceneRange(id);
    return { from: r.from, to: r.from + r.durationInFrames };
  });
  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps) + VO_OFFSET;
        const range = ranges.find((r) => from >= r.from - 3 && from < r.to);
        if (!range) return null;
        const end = Math.min(
          next ? Math.round((next.startMs / 1000) * fps) + VO_OFFSET : Infinity,
          from + Math.round((SWITCH_EVERY_MS / 1000) * fps) + 12,
          range.to,
        );
        if (end <= from) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
