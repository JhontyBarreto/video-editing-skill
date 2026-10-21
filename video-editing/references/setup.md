# Setup

## One-time, per machine

- **Node 20.6 or newer** (the scripts use `node --env-file`). Check with `node -v`.
- **ElevenLabs key file**, outside every repo:

  ```bash
  mkdir -p ~/.credentials && chmod 700 ~/.credentials
  cp templates/elevenlabs.env.example ~/.credentials/elevenlabs.env
  chmod 600 ~/.credentials/elevenlabs.env
  # open it and paste your key after ELEVENLABS_API_KEY=
  ```

  On Windows use something like `C:\Users\<you>\.credentials\elevenlabs.env` and pass the full path to `--env-file`.

- **21st.dev CLI** for searching components and logos:

  ```bash
  npm i -g @21st-dev/cli
  21st login          # opens the browser, saves the login locally
  21st search "stat card" --type c --limit 5   # confirms the login works
  ```

  Don't export a 21st token from your shell profile. An env var beats the stored login, so a stale one silently breaks everything. `21st whoami` only reads the stored login, so test with a real `21st search`.

- **Optional, Remotion agent skills** so Claude has the Remotion docs to hand: `npx skills add remotion-dev/skills`.

## New project

```bash
npx create-video@latest my-reels      # pick the blank template, TypeScript
cd my-reels
npm i @remotion/captions @remotion/google-fonts @remotion/media @remotion/transitions
npm i -D ffmpeg-static
```

Then **pin every Remotion package to the exact same version, without a caret**. Open `package.json` and make sure `remotion`, `@remotion/cli`, `@remotion/media`, `@remotion/google-fonts`, `@remotion/captions`, `@remotion/transitions` and `@remotion/eslint-config-flat` all read the same number, e.g. `"4.0.537"`. One mismatched version breaks the bundle. Upgrade them together with `npx remotion upgrade`.

Copy the skill's files in:

```bash
cp -R <skill>/templates/src/* src/          # overwrites the blank Root.tsx and index.ts
cp <skill>/templates/remotion.config.ts .
mkdir -p scripts && cp <skill>/scripts/*.mjs scripts/
```

`tsconfig.json` needs `"resolveJsonModule": true` (timing reads the JSON the voiceover script writes). The blank template usually has it, check anyway.

Add to `.gitignore`:

```
out/
final/
*.env
.env*
```

### Prove the setup works

```bash
node --env-file=$HOME/.credentials/elevenlabs.env scripts/voiceover.mjs example-reel
node --env-file=$HOME/.credentials/elevenlabs.env scripts/scribe-check.mjs example-reel
npx tsc --noEmit
npx remotion render ExampleReel out/example.mp4
node scripts/loudnorm.mjs out/example.mp4 out/Example-Reel.mp4
```

That's about 150 characters of ElevenLabs credit. You should get a 13 second 1080x1920 reel at about -14 LUFS with a headline, a counter that lands on 42 as the word is said, captions and a CTA button.

## Folder layout

```
src/
  Root.tsx                    registers every composition (use <Folder> per brand)
  index.ts
  theme.ts                    brand colours, font, FPS, safe zones
  <id>.script.json            the script, one object per line
  <id>.timing.json            written by voiceover.mjs, don't edit by hand
  <name>/                     one folder per video
    <Name>Reel.tsx            main composition
    timing.ts                 frames from the VO timestamps
    Captions.tsx              word-highlight captions
    kit.tsx                   reusable visual pieces, incl. ported 21st.dev components
    scenes/Hook.tsx, ...      one component per script line
public/
  vo/<id>.mp3                 voiceover
  vo/<id>.captions.json       word timings, written by voiceover.mjs
  vo/musicN.mp3               music beds
  sfx/*.mp3                   whoosh, buzz, ding, click...
  img/                        logos, screenshots, photos
scripts/                      the .mjs scripts from this skill
out/                          renders (gitignored)
final/                        loudness-normalised deliverables (gitignored)
```

For a new video, copy `src/example/` to `src/<name>/`, rename the composition, point `timing.ts` at the new `<id>.timing.json` and captions file, and register it in `Root.tsx`.
