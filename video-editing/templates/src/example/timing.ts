// Turns the voiceover timestamps into frames. Everything in the video is timed from here.
import timing from "../example-reel.timing.json";
import captions from "../../public/vo/example-reel.captions.json";
import { FPS } from "../theme";

export const VO_OFFSET = 6; // voiceover starts 0.2s in
const msToFrame = (ms: number) => Math.round((ms / 1000) * FPS);

export type Word = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
export const WORDS = captions as Word[];

const clean = (t: string) => t.trim().replace(/[,?!]/g, "").replace(/\.$/, "").toLowerCase();

// Frame where a spoken word starts. `nth` picks a repeated word.
// Throws if the word is gone, so a script edit can't silently break the timing.
export const wordFrame = (word: string, nth = 0) => {
  const hit = WORDS.filter((w) => clean(w.text) === word.toLowerCase())[nth];
  if (!hit) throw new Error(`Word not in voiceover: ${word}`);
  return msToFrame(hit.startMs) + VO_OFFSET;
};

// Frame of the i-th spoken word
export const wordIndexFrame = (i: number) => msToFrame(WORDS[i].startMs) + VO_OFFSET;

// Each scene starts 150ms before its line is spoken
export const SCENES = timing.lines.map((line, i) => ({
  id: line.id,
  from: i === 0 ? 0 : msToFrame(line.startMs - 150) + VO_OFFSET,
}));

const END_HOLD = 66; // about 2.2s hold on the CTA after the last word
export const TOTAL_FRAMES = msToFrame(timing.durationMs) + VO_OFFSET + END_HOLD;

export const sceneRange = (id: string) => {
  const i = SCENES.findIndex((s) => s.id === id);
  if (i === -1) throw new Error(`No scene with id: ${id}`);
  const from = SCENES[i].from;
  const to = i + 1 < SCENES.length ? SCENES[i + 1].from : TOTAL_FRAMES;
  return { from, durationInFrames: to - from };
};

// Inside a scene, useCurrentFrame() starts at 0 when the scene starts.
// atWord(scene, word) gives you that word's frame relative to the scene.
export const atWord = (sceneId: string, word: string, nth = 0) => wordFrame(word, nth) - sceneRange(sceneId).from;
