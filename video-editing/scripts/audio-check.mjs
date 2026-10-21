// Streams, silence, loudness and true peak of any audio or video file.
//
//   node scripts/audio-check.mjs <file>
//
// Use it on music beds before you use them (silence at the start or end) and on the
// final mp4 (should be about -14 LUFS, true peak at or below -1.5 dBTP).
// Needs ffmpeg-static (npm i -D ffmpeg-static). Remotion's own ffmpeg has no loudnorm.
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/audio-check.mjs <file>");
  process.exit(1);
}

const run = (args) => spawnSync(ffmpeg, ["-hide_banner", "-nostats", ...args], { encoding: "utf8" }).stderr;

const info = run(["-i", file]);
const duration = info.match(/Duration: ([\d:.]+)/)?.[1];
console.log(`File:     ${file}`);
console.log(`Duration: ${duration ?? "unknown"}`);
for (const line of info.split("\n").filter((l) => /Stream #/.test(l))) console.log(`Stream:   ${line.trim()}`);

const silence = run(["-i", file, "-af", "silencedetect=n=-45dB:d=0.4", "-f", "null", "-"]);
const starts = [...silence.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...silence.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
if (!starts.length) console.log("Silence:  none over 0.4s");
starts.forEach((s, k) => {
  const e = ends[k];
  console.log(`Silence:  ${s.toFixed(2)}s to ${e !== undefined ? `${e.toFixed(2)}s` : "end"}${s < 0.05 ? "  (opens silent, use trimBefore)" : ""}`);
});

const loud = run(["-i", file, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
const brace = loud.lastIndexOf("{");
if (brace === -1) {
  console.log("Loudness: no audio stream");
  process.exit(0);
}
const m = JSON.parse(loud.slice(brace));
console.log(`Loudness: ${m.input_i} LUFS integrated, true peak ${m.input_tp} dBTP, LRA ${m.input_lra}`);
