// Transcribe a voiceover with ElevenLabs Scribe and diff it against the script.
//
//   node --env-file=$HOME/.credentials/elevenlabs.env scripts/scribe-check.mjs <id> [file.mp3]
//
// Defaults to public/vo/<id>.mp3 against src/<id>.script.json.
// Exits 1 when the words differ. Brand names and numbers often show up as false
// differences ("thirty" vs "30"), so listen to those bits by ear before regenerating.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [ID, file] = process.argv.slice(2);
if (!ID) {
  console.error("Usage: node --env-file=<key file> scripts/scribe-check.mjs <id> [file.mp3]");
  process.exit(1);
}
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set. Pass your key file with --env-file.");
  process.exit(1);
}

const root = process.cwd();
const spec = JSON.parse(readFileSync(resolve(root, `src/${ID}.script.json`), "utf8"));
const LINES = Array.isArray(spec) ? spec : spec.lines;
const expected = LINES.map((l) => l.say).join(" ");
const audioPath = resolve(root, file ?? `public/vo/${ID}.mp3`);

const form = new FormData();
form.append("model_id", process.env.STT_MODEL ?? "scribe_v1");
form.append("file", new Blob([readFileSync(audioPath)], { type: "audio/mpeg" }), "vo.mp3");
const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
  method: "POST",
  headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
  body: form,
});
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
const { text: heard } = await res.json();

// Normalise both sides the same way so "42" matches "forty two" and "example.com" matches "example dot com"
const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const spell = (n) =>
  n < 20 ? ONES[n]
  : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "")
  : n < 1000 ? `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${spell(n % 100)}` : ""}`
  : n < 1e6 ? `${spell(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${spell(n % 1000)}` : ""}`
  : String(n);
const tok = (s) =>
  s
    .toLowerCase()
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/([a-z0-9])\.(?=[a-z])/g, "$1 dot ")
    .replace(/%/g, " percent ")
    .replace(/&/g, " and ")
    .replace(/\d+/g, (d) => ` ${spell(Number(d))} `)
    .replace(/[^a-z'\s]/g, " ")
    .replace(/\b(hundred|thousand)\s+and\b/g, "$1")
    .split(/\s+/)
    .filter(Boolean);
const a = tok(expected);
const b = tok(heard);

// Word-level diff (longest common subsequence)
const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
for (let i = a.length - 1; i >= 0; i--)
  for (let j = b.length - 1; j >= 0; j--)
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

const ops = [];
let i = 0;
let j = 0;
while (i < a.length && j < b.length) {
  if (a[i] === b[j]) { ops.push(["=", a[i]]); i++; j++; }
  else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(["-", a[i++]]);
  else ops.push(["+", b[j++]]);
}
while (i < a.length) ops.push(["-", a[i++]]);
while (j < b.length) ops.push(["+", b[j++]]);

// Group runs of changes, with the three words before each as context
const diffs = [];
const said = [];
for (let k = 0; k < ops.length; ) {
  if (ops[k][0] === "=") { said.push(ops[k++][1]); continue; }
  const d = { at: said.slice(-3).join(" "), missing: [], extra: [] };
  while (k < ops.length && ops[k][0] !== "=") {
    (ops[k][0] === "-" ? d.missing : d.extra).push(ops[k][1]);
    k++;
  }
  diffs.push(d);
}

console.log(`Script: ${expected}\n`);
console.log(`Heard:  ${heard}\n`);
if (!diffs.length) {
  console.log("Match. Still listen to brand names by ear.");
  process.exit(0);
}
console.log(`${diffs.length} difference(s):`);
for (const d of diffs) {
  const parts = [];
  if (d.missing.length) parts.push(`script "${d.missing.join(" ")}"`);
  if (d.extra.length) parts.push(`heard "${d.extra.join(" ")}"`);
  console.log(`  after "...${d.at}": ${parts.join(", ")}`);
}
console.log("\nRepeats, stutters or misreads: regenerate the take. Numbers and brand names: check by ear.");
process.exit(1);
