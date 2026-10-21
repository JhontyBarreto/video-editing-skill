---
name: video-editing
description: Make and edit short-form videos (Reels, TikToks, Shorts, video ads, explainers, VSLs) with Remotion, ElevenLabs and 21st.dev. Covers the script, ElevenLabs voiceover with word timestamps, a speech-to-text check of every take, ElevenLabs music beds and sound effects, 21st.dev UI components and brand logos ported into Remotion scenes, captions synced to the voice, rendering, loudness normalising to -14 LUFS and a QA pass. Use when someone asks to make, edit, re-cut, resize or render a reel, short, video ad, VSL or any Remotion video, or to add a voiceover, captions, music or sound effects to one.
---

# Video editing: Remotion + ElevenLabs + 21st.dev

This is how we make short-form video. It's the same pipeline we use every week for brand reels, client reels and paid ads. Read this file first, then open the reference file for whichever step you're on.

**The pipeline in one line:** script JSON > ElevenLabs voiceover with word timestamps > scribe check > music + SFX > scenes built in Remotion (UI pieces sourced from 21st.dev, ported to frame-driven animation) with every cut and caption pinned to the word it's spoken on > render > loudness normalise > QA > hand over as a draft.

## The one idea: the voiceover is the clock

We generate the voiceover first, with character-level timestamps from ElevenLabs. Every scene start, caption, pop-in and sound effect is then pinned to the exact frame a word is spoken. Nothing is timed by hand. Change a line, re-run the voiceover script, and the whole video re-times itself.

## What each tool is for

| Tool | Job in the pipeline |
|---|---|
| **Remotion** | The video itself. Each scene is a React component, every frame is a function of `useCurrentFrame()`. Renders the mp4. |
| **ElevenLabs** | Voiceover with timestamps (TTS), speech-to-text check of each take (Scribe), music beds, sound effects. |
| **21st.dev** | Ready-made UI pieces to build scenes from (stat cards, notification toasts, chat bubbles, buttons, text effects, backgrounds) and real SVG brand logos. They're web components, so they always get ported to frame-driven animation first. |
| **ffmpeg-static** | Loudness normalising, silence detection, final stream check. |

## Keys and accounts (never in the repo)

- **ElevenLabs:** the API key lives in an env file outside any repo, e.g. `~/.credentials/elevenlabs.env` with one line `ELEVENLABS_API_KEY=...`. Scripts load it with `node --env-file=...`. Never hardcode it, paste it into a chat, or commit it.
- **21st.dev:** log in with `21st login` (browser flow). No key needed for search, code and logos. The optional MCP needs your own key from https://21st.dev/mcp, set as an env var, never in a file you commit.
- If a key is missing, stop and ask for it to be set up. Don't work around it.

## Before you start, get the brief

You need: brand, what the video is for (organic reel, paid ad, VSL), platform and format, target length, the one CTA, the facts and claims it can make, and any assets (logo, screenshots, product shots, b-roll). If any of that is missing, ask before writing anything.

## Workflow

1. **Set up the project.** New machine or new project: follow [references/setup.md](references/setup.md). Copy `templates/` and `scripts/` from this skill into the project.
2. **Write the script.** One line per scene, 30 to 40 seconds, hook in under 2 seconds. Rules and format: [references/script.md](references/script.md). **Get the script approved before spending any ElevenLabs credits.**
3. **Voiceover.** `node --env-file=$HOME/.credentials/elevenlabs.env scripts/voiceover.mjs <id>`. Voices, settings and the per-line variant: [references/elevenlabs.md](references/elevenlabs.md).
4. **Scribe check.** `node --env-file=$HOME/.credentials/elevenlabs.env scripts/scribe-check.mjs <id>`. Never skip it. Regenerate any take with a stutter, repeat or misread.
5. **Music and SFX.** `scripts/music.mjs` and `scripts/sfx.mjs`, then profile the music with `scripts/audio-check.mjs`. See [references/elevenlabs.md](references/elevenlabs.md).
6. **Source UI from 21st.dev and port it.** Search, pull the code, strip every time-based animation, rebuild it on the frame, scale it up for 1080 wide. See [references/21st-dev.md](references/21st-dev.md).
7. **Build the scenes in Remotion.** Timing helpers, composition, captions, layout rules: [references/remotion.md](references/remotion.md).
8. **Stills, render, loudness, QA.** Look at a still of every scene, render, normalise to -14 LUFS, run the checklist: [references/render-and-qa.md](references/render-and-qa.md).
9. **Hand over.** The final mp4, the cover frame time, and a post caption. **Never publish anything.** Deliver it as a draft and wait for an explicit "post it".

## Hard rules

- No API keys, tokens or passwords in code, scripts, commits, captions or chat.
- Voiceover first. Every cut, caption and effect is pinned to a word frame. No hand-timed animation.
- No CSS transitions, CSS keyframes, Tailwind `animate-*`, framer-motion, `setInterval` or `useEffect` timers. They don't render. Everything comes from `useCurrentFrame()` with `interpolate()` and `spring()`.
- Every `remotion` and `@remotion/*` package on the exact same version, pinned without a caret.
- Scribe check every voiceover take before building on it.
- Every claim in the video must be true today. No invented stats, no made-up testimonials, no "guaranteed results". Brand logos only where the relationship is real.
- No em dashes anywhere: script, captions, on-screen text, post caption. Use commas or full stops.
- A cloned voice is only ever used for the person it was cloned from, on their own content.
- Final audio at -14 LUFS (±0.5), true peak at or below -1.5 dBTP.
- Never publish or schedule. Draft only.

## Files in this skill

```
SKILL.md                    this file
references/
  setup.md                  new machine, new project, folder layout
  script.md                 script format and writing rules
  elevenlabs.md             voices, VO, scribe check, music, SFX, credits
  21st-dev.md               finding components and logos, porting them to Remotion
  remotion.md               timing, composition, captions, layout, formats
  render-and-qa.md          stills, render, loudness, QA checklist, delivery, gotchas
scripts/
  voiceover.mjs             script JSON > mp3 + word captions + per-line timing
  scribe-check.mjs          transcribes the mp3 and diffs it against the script
  music.mjs                 generate a music bed
  sfx.mjs                   generate a sound effect
  audio-check.mjs           streams, silence, loudness and true peak of any file
  loudnorm.mjs              two-pass loudness normalise to -14 LUFS
templates/
  remotion.config.ts
  src/                      a working example reel: theme, timing, captions, kit, scenes
  elevenlabs.env.example    shape of the key file (no key in it)
```
