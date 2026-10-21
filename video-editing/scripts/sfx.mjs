// Generate a sound effect with ElevenLabs.
//
//   node --env-file=$HOME/.credentials/elevenlabs.env scripts/sfx.mjs "<description>" <seconds> <out.mp3>
//
// e.g. scripts/sfx.mjs "short soft whoosh, airy, no reverb tail" 0.8 public/sfx/whoosh.mp3
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [text, seconds, out] = process.argv.slice(2);
if (!text || !seconds || !out) {
  console.error('Usage: scripts/sfx.mjs "<description>" <seconds> <out.mp3>');
  process.exit(1);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Pass your key file with --env-file.");
  process.exit(1);
}

const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
  method: "POST",
  headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ text, duration_seconds: Number(seconds) }),
});
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);

const path = resolve(process.cwd(), out);
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, Buffer.from(await res.arrayBuffer()));
console.log(`Wrote ${out}`);
