# Writing the script

## Format

`src/<id>.script.json`. Each line becomes one scene, and its `id` is the scene's name everywhere else.

```json
{
  "voiceId": "JBFqnCBsd6RMkjVDRZzb",
  "speed": 1.08,
  "display": [
    ["gafferly dot com", "gafferly.com"],
    ["thirty", "30"]
  ],
  "lines": [
    { "id": "hook", "say": "This is the British tradesperson. Rarely seen without a flask." },
    { "id": "rest", "say": "Ten hours on the tools. At last, they rest." },
    { "id": "stir", "say": "But wait. The phone stirs." },
    { "id": "cta",  "say": "Gafferly. Try it free for thirty days, at gafferly dot com." }
  ]
}
```

- `say` is exactly what the voice reads.
- `display` swaps spoken words for how they should appear in captions. Multi-word phrases merge into one caption token ("gafferly dot com." becomes "gafferly.com."), and the token keeps its timing, so `wordFrame("gafferly.com")` works.
- `voiceId`, `speed`, `stability`, `style`, `model` are optional. Env vars (`VOICE_ID`, `VO_SPEED`, ...) override them for a quick test.
- A plain array of lines (no wrapper object) also works, with no display swaps.

## Rules that have worked for us

- **30 to 40 seconds total**, 7 to 9 lines. Reels massively outperform carousels for us (roughly 5x reach), and short ones hold.
- **The hook lands in under 2 seconds** and makes one clear, specific claim or image. No "Hey guys", no logo intro.
- Short sentences. One idea per line. Write how people actually talk.
- Write numbers and URLs the way they're **spoken** ("thirty", "gafferly dot com") and put the written form in `display`.
- If the voice mispronounces a brand, spell it phonetically in `say` and swap it back in `display`.
- **Every claim must be true.** Check the real product, site or results before you write it. No invented stats, no fake testimonials, no "results guaranteed". If you can't verify it, cut it.
- **No em dashes** anywhere: script, captions, on-screen text, post caption. Use commas or full stops.
- End on **one** CTA: try free, book a call, comment a word. Not two.
- Humour works best when it's specific, like a nature-documentary parody of a tradesperson's day. Generic "relatable" lines don't land.

## Hook patterns we reuse

- A specific image: "This is the British tradesperson. Rarely seen without a flask."
- A cost the viewer already feels: "You quoted on Monday. It's Friday. Still nothing."
- A pattern break: start mid-action, a sound effect, or an on-screen object that doesn't belong.
- A direct callout: "If you run a cleaning company, stop scrolling."

For ad tests, write 3 to 5 hooks in front of one shared body and generate each hook as its own line (see the per-line variant in elevenlabs.md).

## Approval gate

Show the script (and the hook options) and get a yes **before** generating any audio. A rewrite after the VO costs credits and a full re-time.
