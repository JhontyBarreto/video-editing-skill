// Two-pass loudness normalise to -14 LUFS, true peak -1.5 dBTP. Video stream is copied untouched.
//
//   node scripts/loudnorm.mjs out/my-reel.mp4 final/My-Reel.mp4
//
// Needs ffmpeg-static (npm i -D ffmpeg-static). Remotion's own ffmpeg has no loudnorm.
import { execFileSync, spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const [inp, out] = process.argv.slice(2);
if (!inp || !out) {
  console.error("Usage: node scripts/loudnorm.mjs <in.mp4> <out.mp4>");
  process.exit(1);
}

const measure = (f) => {
  const r = spawnSync(
    ffmpeg,
    ["-hide_banner", "-nostats", "-i", f, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  return JSON.parse(r.stderr.slice(r.stderr.lastIndexOf("{")));
};

const m = measure(inp);
const af =
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}` +
  `:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
execFileSync(
  ffmpeg,
  ["-y", "-hide_banner", "-loglevel", "error", "-i", inp, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
  { stdio: "inherit" },
);
const after = measure(out);
console.log(`Before ${m.input_i} LUFS, after ${after.input_i} LUFS, true peak ${after.input_tp} dBTP`);
