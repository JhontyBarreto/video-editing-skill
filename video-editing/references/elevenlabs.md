# ElevenLabs: voiceover, scribe check, music, SFX

All scripts read `ELEVENLABS_API_KEY` from the key file you pass with `--env-file`. Nothing else holds the key.

```bash
KEY=$HOME/.credentials/elevenlabs.env
node --env-file=$KEY scripts/voiceover.mjs <id>
node --env-file=$KEY scripts/scribe-check.mjs <id>
node --env-file=$KEY scripts/music.mjs "<prompt>" 44 public/vo/music1.mp3
node --env-file=$KEY scripts/sfx.mjs "<description>" 0.8 public/sfx/whoosh.mp3
```

## Voiceover

`scripts/voiceover.mjs <id>` joins every line, calls `text-to-speech/{voice}/with-timestamps` once, and writes:

- `public/vo/<id>.mp3`
- `public/vo/<id>.captions.json`: one entry per spoken word with start/end ms (Remotion `Caption[]` shape), display swaps applied
- `src/<id>.timing.json`: start/end of every script line plus total duration

One call for the whole script gives the most natural flow between lines.

### Voices

| Use | Voice | voice_id | Notes |
|---|---|---|---|
| Brand and client reels, ads | George, warm British (premade) | `JBFqnCBsd6RMkjVDRZzb` | Our default. Speed 1.06 to 1.13 |
| Product tours, training, explainers | Daniel, British (premade) | `onwK4e9ZLuTAKqWW03F9` | Calmer, more educational |
| Someone's personal account | Their own cloned voice | ask them for the ID | Only ever for that person's own content |

Premade voices work on any ElevenLabs account. A cloned voice only exists on the account that made it, and it's never used for anyone or anything else.

- Model: `eleven_multilingual_v2`.
- Defaults: stability 0.4, similarity 0.8, style 0.35, speaker boost on, speed 1.06.
- Faster, punchier read: raise `speed` (1.12 to 1.13 suits a 35s reel).
- More drama: lower `stability`, raise `style`.
- Cloned voices: stability 0.5, similarity 0.85, style 0.2, speed 1.04 is a good start. They stutter more than premade voices, so scribe check every take.

### Variant: one call per line

When lines need to swap independently (5 hooks in front of one body) or you want exact comic pauses, call the API once per line and pass the neighbouring lines so the delivery still flows:

```js
body: JSON.stringify({
  text: line.say,
  model_id: "eleven_multilingual_v2",
  previous_text: lines[i - 1]?.say,
  next_text: lines[i + 1]?.say,
  voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true, speed: 1.08 },
}),
```

Write each line to its own mp3 and keep a `vo.json` of `{ [id]: { durationMs, words } }`. Each scene then plays its own clip, and scene length is the clip length plus a short gap.

## Scribe check (never skip)

The timestamps can look perfect while the audio has a stutter, a repeated phrase or a misread word. We've had a clone voice say "asked ChatGPT, asked ChatGPT" with clean-looking alignment.

`scripts/scribe-check.mjs <id>` transcribes the mp3 with Scribe and diffs it word by word against the script. Numbers and "dot com" are normalised on both sides, so "42" matches "forty two".

- **Match:** carry on, but still listen to brand names by ear, Scribe always mangles them.
- **Repeat, stutter or misread:** regenerate. A new take is cheap.
- **Glitch only at the very start:** trim the mp3 and shift the timings instead of paying for a full re-read.
- Any change to `say` means re-running voiceover.mjs and the scribe check.

## Music bed

```bash
node --env-file=$KEY scripts/music.mjs \
  "upbeat modern instrumental bed for a 35 second social reel, light plucked synths, soft kick, no vocals, steady energy, clean ending" \
  44 public/vo/music1.mp3
node scripts/audio-check.mjs public/vo/music1.mp3
```

- Describe mood, instruments and pace. Always say **no vocals**. Match the tone to the script (a "wildlife documentary score" for a nature-doc parody, for example).
- Ask for about **5 seconds longer** than the video.
- **Profile it before use.** Generated tracks sometimes open with up to 5s of silence and go quiet early. `audio-check.mjs` prints every silence over 0.4s. If it opens silent, set `MUSIC_TRIM_FRAMES` (seconds x 30) in the composition. Make sure the video ends before any silence near the end.
- It sits **under** the VO at volume 0.12 to 0.18, short fade in, 1.5s fade out.
- Reusing a good bed across videos is fine and saves credits.

## Sound effects

```bash
node --env-file=$KEY scripts/sfx.mjs "short phone vibration buzz on a wooden table" 1.2 public/sfx/buzz.mp3
```

Keep a small library in `public/sfx/` (whoosh, buzz, ding, click, rewind, pop) and reuse it. Rough volumes: buzz 0.11, whoosh 0.18, UI click 0.5. Use them on scene changes and key moments only, not every pop-in.

## Credits

- A 35s reel VO is about 500 characters. Every regenerate costs the same again, so get the script approved first.
- Music and SFX use credits too. Reuse beds and effects.
- If a call fails with 401, the key is wrong or expired. Stop and ask, don't hunt for another key.
