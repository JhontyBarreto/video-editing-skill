# Building the video in Remotion

Start from `templates/src/example/`. It's a working 3-scene reel that shows every pattern below.

## Timing: the voiceover drives everything

`src/<name>/timing.ts` reads `<id>.timing.json` and `<id>.captions.json` (both written by voiceover.mjs) and gives you:

| Helper | Returns |
|---|---|
| `SCENES` | every script line as `{ id, from }`, each scene starting 150ms before its line is spoken |
| `sceneRange(id)` | `{ from, durationInFrames }` for a scene's `<Sequence>` |
| `wordFrame(word, nth?)` | absolute frame where a spoken word starts. Throws if the word is gone. |
| `atWord(sceneId, word, nth?)` | the same, relative to the scene, for use inside a scene component |
| `wordIndexFrame(i)` | frame of the i-th spoken word, handy for SFX |
| `TOTAL_FRAMES` | VO length + offset + a 2.2s hold on the CTA |

Inside a scene, `useCurrentFrame()` starts at 0 when the scene starts. So to pop something in exactly as "forty" is said in the `proof` scene:

```tsx
const pop = usePop(atWord("proof", "forty"));
```

Words are matched lowercase with trailing punctuation stripped. Display swaps apply, so after `["example dot com", "example.com"]` you match `"example.com"`. If a word appears twice, pass `nth`.

When the script changes, re-run voiceover.mjs. If a word a scene relies on has gone, `wordFrame` throws and the Studio shows which one. That's deliberate.

## The composition

`<Name>Reel.tsx` maps each script line id to a scene component, wraps each in a `<Sequence>` from `sceneRange()`, then layers captions, the voiceover (offset by `VO_OFFSET`), the music bed and SFX. See `templates/src/example/ExampleReel.tsx`.

Register it in `Root.tsx`:

```tsx
<Composition id="MyReel" component={MyReel} durationInFrames={TOTAL_FRAMES} fps={30}
  width={1080} height={1920} defaultProps={{ total: TOTAL_FRAMES }} />
```

Group compositions in a `<Folder name="Brand">` per brand.

### Formats

| Format | Size | Use |
|---|---|---|
| 9:16 | 1080x1920 | Reels, TikTok, Shorts, Stories, most ads |
| 4:5 | 1080x1350 | Feed ads |
| 1:1 | 1080x1080 | Some feed placements |
| 16:9 | 1920x1080 | VSLs, YouTube, landing page hero |

For ads, build 9:16 and 4:5 as separate compositions that share the same scenes and timing. Lay scenes out with flex and the `SAFE` values rather than fixed y positions so they adapt.

## Rules

- **All animation from the frame:** `useCurrentFrame()` with `interpolate()` and `spring()`. No CSS transitions or keyframes, no framer-motion, no timers. They don't render.
- Always clamp: `interpolate(f, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`.
- Assets in `public/`, loaded with `staticFile()`. Use `<Img>`, `<OffthreadVideo>` and `<Audio>` from `@remotion/media`, never plain `<img>` / `<video>` / `<audio>`.
- Fonts via `@remotion/google-fonts` (`loadFont()` in `theme.ts`), or a local font with `FontFace`.
- One component per scene in `scenes/`. Reusable pieces (cards, toasts, phone frames, buttons, ported 21st.dev components) in `kit.tsx`. Reuse kits from older videos where they fit.
- Brand colours, font and safe zones only from `theme.ts`.

## Layout

- **Big text:** headlines 90 to 140px, captions about 62px bold, body at least 40px. If it isn't readable on a phone at 400px wide, it's too small.
- **Safe zones:** keep key info out of the top ~200px and bottom ~250px (platform UI covers them) and ~70px in from the sides.
- One idea on screen at a time. If the VO is saying it and the screen is spelling it out, skip captions on that scene.
- Contrast: real text on real backgrounds. Over photos or b-roll, add a dark scrim.

## Captions

`Captions.tsx` shows word-highlight captions: a new "page" at each sentence end or every ~1.1s, the word being spoken highlighted. Set `CAPTION_SCENES` to the scenes that need them, usually the ones without on-screen text. Never put a caption over a headline. Never split captions by word count, always use the timestamps (proportional captions drift badly).

## B-roll, screenshots and photos

- Stock or AI clips: `<OffthreadVideo>` under a dark scrim so captions stay readable. To fill a longer scene, slow it with `playbackRate` rather than looping.
- Screenshots of a real product: put them in a phone or browser frame from the kit, and make sure what they show is true today.
- Photos: client's own photos where possible. Blur number plates and faces you don't have permission for.

## Transitions

Scene cuts land on the word, so most of the time a hard cut plus a whoosh is right. For a softer move, fade or slide the outgoing scene's content in its last 6 to 8 frames, or use `@remotion/transitions` with a `TransitionSeries` (remember a transition overlaps two scenes, so the total gets shorter by the transition length).

## Studio

```bash
npm run dev          # Remotion Studio, scrub through every scene
npx tsc --noEmit     # type check after every batch of changes
```
