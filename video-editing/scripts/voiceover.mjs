// ElevenLabs voiceover with word timestamps.
//
//   node --env-file=$HOME/.credentials/elevenlabs.env scripts/voiceover.mjs <id>
//
// Reads  src/<id>.script.json
// Writes public/vo/<id>.mp3            the voiceover
//        public/vo/<id>.captions.json  one entry per spoken word (Remotion Caption[])
//        src/<id>.timing.json          start/end of every script line, total duration
//
// Optional env overrides: VOICE_ID, VO_SPEED, VO_STABILITY, VO_STYLE, VO_MODEL
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ID = process.argv[2];
if (!ID) {
  console.error("Usage: node --env-file=<key file> scripts/voiceover.mjs <id>");
  process.exit(1);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Pass your key file with --env-file.");
  process.exit(1);
}

const root = process.cwd();
const spec = JSON.parse(readFileSync(resolve(root, `src/${ID}.script.json`), "utf8"));
const LINES = Array.isArray(spec) ? spec : spec.lines;
// Spoken text vs caption text, e.g. ["example dot com", "example.com"], ["thirty", "30"]
const DISPLAY = Array.isArray(spec) ? [] : (spec.display ?? []);

const pick = (env, fromSpec, fallback) => (env !== undefined ? Number(env) : (fromSpec ?? fallback));
const VOICE = process.env.VOICE_ID ?? spec.voiceId ?? "JBFqnCBsd6RMkjVDRZzb"; // George, warm British (premade)
const MODEL = process.env.VO_MODEL ?? spec.model ?? "eleven_multilingual_v2";
const voice_settings = {
  stability: pick(process.env.VO_STABILITY, spec.stability, 0.4),
  similarity_boost: spec.similarity ?? 0.8,
  style: pick(process.env.VO_STYLE, spec.style, 0.35),
  use_speaker_boost: true,
  speed: pick(process.env.VO_SPEED, spec.speed, 1.06),
};

const text = LINES.map((l) => l.say.trim()).join(" ");
const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings }),
  },
);
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
const { audio_base64, alignment } = await res.json();

mkdirSync(resolve(root, "public/vo"), { recursive: true });
writeFileSync(resolve(root, `public/vo/${ID}.mp3`), Buffer.from(audio_base64, "base64"));

const {
  characters: ch,
  character_start_times_seconds: st,
  character_end_times_seconds: en,
} = alignment;
const ms = (s) => Math.round(s * 1000);

// Per-line timing from character offsets
let cursor = 0;
const lines = LINES.map((l) => {
  const say = l.say.trim();
  const start = text.indexOf(say, cursor);
  const end = start + say.length - 1;
  cursor = end + 1;
  return { id: l.id, startMs: ms(st[start]), endMs: ms(en[end]) };
});

// Characters > words
const words = [];
let w = null;
for (let i = 0; i < ch.length; i++) {
  if (/\s/.test(ch[i])) {
    if (w) words.push(w);
    w = null;
    continue;
  }
  if (!w) w = { text: "", startMs: ms(st[i]), endMs: 0 };
  w.text += ch[i];
  w.endMs = ms(en[i]);
}
if (w) words.push(w);

// Display swaps. Multi-word phrases ("example dot com") merge into one caption token,
// keeping any trailing punctuation ("example.com.").
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9']/g, "");
for (const [spoken, shown] of DISPLAY) {
  const parts = spoken.toLowerCase().split(/\s+/).map(norm);
  for (let i = 0; i + parts.length <= words.length; i++) {
    if (!parts.every((p, k) => norm(words[i + k].text) === p)) continue;
    const last = words[i + parts.length - 1];
    const lead = words[i].text.match(/^[^A-Za-z0-9']+/)?.[0] ?? "";
    const trail = last.text.match(/[^A-Za-z0-9']+$/)?.[0] ?? "";
    words.splice(i, parts.length, { text: lead + shown + trail, startMs: words[i].startMs, endMs: last.endMs });
  }
}

const captions = words.map((x, i) => ({
  text: (i === 0 ? "" : " ") + x.text,
  startMs: x.startMs,
  endMs: x.endMs,
  timestampMs: x.startMs,
  confidence: 1,
}));
writeFileSync(resolve(root, `public/vo/${ID}.captions.json`), JSON.stringify(captions, null, 1));

const durationMs = ms(en[en.length - 1]);
writeFileSync(resolve(root, `src/${ID}.timing.json`), JSON.stringify({ durationMs, lines }, null, 1));

console.log(`${ID}: ${text.length} characters, ${(durationMs / 1000).toFixed(1)}s, voice ${VOICE}`);
for (const l of lines) console.log(`  ${l.id.padEnd(12)} ${(l.startMs / 1000).toFixed(2)}s to ${(l.endMs / 1000).toFixed(2)}s`);
console.log(`Next: node --env-file=<key file> scripts/scribe-check.mjs ${ID}`);
