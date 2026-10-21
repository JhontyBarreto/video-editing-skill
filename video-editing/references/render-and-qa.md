# Stills, render, loudness, QA, delivery

## 1. Stills first

Render a still from every scene and actually look at each one: text cut off, overlaps, things off-screen, unreadable on a phone, typos, a caption covering a headline.

```bash
npx tsc --noEmit
npx remotion still MyReel out/stills/hook.png --frame=30
npx remotion still MyReel out/stills/proof.png --frame=150
```

Pick frames just after each key pop-in. For anything that animates, check the start, the middle and the settled state.

## 2. Render

```bash
npx remotion render MyReel out/my-reel.mp4
```

## 3. Loudness normalise to -14 LUFS

Social platforms target about -14 LUFS. Remotion's bundled ffmpeg has no `loudnorm`, so the script uses `ffmpeg-static`. Two passes, video copied untouched.

```bash
mkdir -p final
node scripts/loudnorm.mjs out/my-reel.mp4 final/My-Reel.mp4
node scripts/audio-check.mjs final/My-Reel.mp4
```

Aim for -14 to -14.5 LUFS and a true peak around -1.5 dBTP or lower.

## 4. QA checklist

- [ ] Scribe check matches the script word for word, brand names checked by ear
- [ ] Every scene still checked: nothing cut off, nothing in the safe zones, readable at phone size
- [ ] Every pop-in, counter and cut lands on its word (scrub it in the Studio with sound)
- [ ] Captions sync with the voice and never sit over on-screen text
- [ ] Music doesn't fight the VO, no dead air at the start, ends cleanly with the fade
- [ ] SFX on cuts and key moments only, not too loud
- [ ] Loudness -14 LUFS (±0.5), true peak about -1.5 dBTP or lower
- [ ] `audio-check.mjs` shows one video stream (H.264, right resolution, 30fps, yuv420p or yuvj420p) and one audio stream
- [ ] Every claim in the video is true today, every logo is a real relationship
- [ ] No em dashes in on-screen text, captions or the post caption
- [ ] Cover frame picked (in ms) that shows the hook clearly

## 5. Hand over

Deliver:

1. The final mp4 from `final/`, named `<Brand>-<Topic>-<format>.mp4` (e.g. `Gafferly-Portal-9x16.mp4`)
2. The cover frame time in ms
3. A post caption: hook line first, 2 to 4 short lines, the CTA, a few relevant hashtags. Same rules as the script: true claims, no em dashes, sounds like a person.

**Never publish, schedule or upload to an ad account.** Hand it over as a draft and wait for an explicit "post it".

## Gotchas we've hit

- **Music silence:** generated music can open with 1 to 5s of silence and fade early. Always run `audio-check.mjs` and set the trim.
- **Remotion's ffmpeg** (`npx remotion ffmpeg`) has no `loudnorm`, `volumedetect` or `ebur128`. Use `ffmpeg-static` (the scripts already do).
- **Clone voices stutter** more than premade ones. Scribe check every take.
- **Script edits:** any change to `say` means re-running voiceover.mjs. `wordFrame()` throws if a word it needs is gone, which is what you want.
- **Proportional captions** (splitting by word count) drift. Always use the timestamps.
- **Package versions:** one mismatched `@remotion/*` version breaks the bundle.
- **Web animation in a ported component** (a leftover `transition` or `animate-pulse`) shows as flicker or a frozen state in the render even if it looks fine in the Studio. Grep `kit.tsx` for `transition`, `animate`, `motion`, `useEffect` before rendering.
- **zsh:** `$VAR:l` is read as a lowercase modifier. Write `${VAR}`.
- **Windows:** pass the full path to `--env-file`, and use `npx remotion` from the project root.
- **Credits:** a 35s VO is about 500 characters. Approve the script before generating, reuse music and SFX.
