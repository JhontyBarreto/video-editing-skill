// Generate a music bed with ElevenLabs Music.
//
//   node --env-file=$HOME/.credentials/elevenlabs.env scripts/music.mjs "<prompt>" <seconds> <out.mp3>
//
// Ask for about 5 seconds longer than the video and always say "no vocals" in the prompt.
// Then run scripts/audio-check.mjs on it, generated tracks can open with silence.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [prompt, seconds, out] = process.argv.slice(2);
if (!prompt || !seconds || !out) {
  console.error('Usage: scripts/music.mjs "<prompt>" <seconds> <out.mp3>');
  process.exit(1);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Pass your key file with --env-file.");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/music", {
  method: "POST",
  headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ prompt, music_length_ms: Math.round(Number(seconds) * 1000) }),
});
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);

const path = resolve(process.cwd(), out);
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, Buffer.from(await res.arrayBuffer()));
console.log(`Wrote ${out}. Next: node scripts/audio-check.mjs ${out}`);
