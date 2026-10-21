# 21st.dev: sourcing UI and logos for scenes

## What it is and why we use it

21st.dev is a community registry of React + Tailwind components in the shadcn style: cards, buttons, text effects, backgrounds, testimonials, pricing tables, charts. It also has themes, templates, and a library of real SVG brand logos.

They're built for websites, not video. We use them as a fast starting point for on-screen UI, because pulling a polished stat card or notification toast takes two minutes and designing one from scratch takes an hour. **Nothing from 21st.dev goes into a video unported.** Web components animate over time (CSS, framer-motion, timers), and Remotion renders each frame on its own, so those animations either don't show or flicker.

## What to pull for videos

- Stat and KPI cards, number tickers
- Notification toasts, chat bubbles, message and email cards, phone-style UI
- Buttons and CTA pills
- Text effects: highlighter, gradient text, word rotate, typewriter
- Backgrounds: dot grid, grid, beams, aurora, border beam
- Review and testimonial cards (real reviews only, word for word)
- Checklist rows, pricing cards, comparison tables
- **Brand logos** for "works with" or "as seen on" moments, only where the relationship is real

## Getting the code

**Browser:** go to 21st.dev, search, open the component, copy the code (component, demo, and the dependency list).

**CLI** (needs `21st login`, see setup.md):

```bash
21st search "number ticker" --type c --limit 10
21st search "notification toast" --type c --limit 10
21st get <id>                     # prints the component code plus its demo
21st logo "xero" --limit 5        # SVG brand logos, free, no login needed
21st theme <id>                   # a theme's CSS, handy for colour ideas
```

Prefer `21st get` and porting by hand over `21st add`. `add` installs the component into a shadcn-style `components/ui` folder with its dependencies (often framer-motion), which you'd then have to strip out again.

**MCP (optional):** lets Claude search and pull components inside Claude Code. Run `npx @21st-dev/cli@latest init --client claude` and follow it, or add the HTTP server `https://21st.dev/api/mcp` with your own key from https://21st.dev/mcp in the `x-api-key` header. Keep the key in an env var (`API_KEY_21ST`), never in a committed file. Old "Magic MCP" keys were reset and no longer work.

**Magic UI** (magicui.design) is a similar library we also pull from (dot pattern, border beam, highlighter, animated beam). Same porting rules apply.

## Porting a component to Remotion

1. **Paste it into `src/<video>/kit.tsx`** with a source comment, e.g. `// From 21st.dev: <author>/<slug>`.
2. **Delete everything time-based or interactive:**
   - `"use client"`
   - `framer-motion` / `motion` imports, `motion.div`, `AnimatePresence`, `useSpring`, `useMotionValue`, `useInView`
   - `useEffect` timers, `setInterval`, `setTimeout`, `requestAnimationFrame`, `IntersectionObserver`
   - `useState` that drives animation
   - CSS `transition`, `@keyframes`, `animation`, and Tailwind `animate-*`, `transition-*`, `duration-*`, `delay-*`, `hover:*`, `focus:*`
   - `onClick`, `onHover`, inputs, links, scroll handlers
3. **Rebuild each animation from the frame:**
   - entrance: `spring({ frame: frame - startAt, fps, config: { damping: 14, stiffness: 200 } })`
   - counting / progress: `interpolate()` or a `spring` with `durationInFrames`
   - looping (beams, shimmer, rotation): `(frame / period) * 360` or `frame % period`
   - stagger: `startAt + i * 4`
4. **Give it a `startAt` prop** (a frame relative to the scene) so the scene can pin it to a word with `atWord("scene", "word")`.
5. **Tailwind to inline styles.** Our projects use inline styles. Translate as you go (`p-4` is 16px, `rounded-xl` is 12px, `text-sm` is 14px) and then scale up (next step). If a component is huge, `@remotion/tailwind-v4` can enable Tailwind in the project instead, same version as the other Remotion packages.
6. **Scale for video.** Web components assume 14 to 16px text on a laptop screen. In a 1080x1920 frame multiply by about 3: body text 40 to 48px, headlines 90 to 140px, captions about 62px, border radius x2.5, borders 3 to 6px. Check it's readable at 400px wide.
7. **Swap shadcn colour variables** (`bg-background`, `text-muted-foreground`, `hsl(var(--primary))`) for the brand colours in `theme.ts`.
8. **Media:** `<img>` becomes `<Img src={staticFile(...)}/>`, `<video>` becomes `<OffthreadVideo>`. Put files in `public/`. `lucide-react` icons are fine as they're static SVG (pin the version).
9. **Check three stills:** at `startAt`, mid-animation, and settled. Make sure nothing jumps between renders.

### Example: number ticker

Before, as it comes from the web:

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function NumberTicker({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true });
  useEffect(() => { if (isInView) motionValue.set(value); }, [isInView]);
  useEffect(() => springValue.on("change", (v) => {
    if (ref.current) ref.current.textContent = Math.round(v).toString();
  }), [springValue]);
  return <span ref={ref} className="tabular-nums text-4xl font-bold">0</span>;
}
```

After, ported (this is in `templates/src/example/kit.tsx`):

```tsx
export const NumberTicker: React.FC<{ value: number; startAt: number; endAt: number; style?: React.CSSProperties }> = ({ value, startAt, endAt, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startAt, fps, config: { damping: 200 }, durationInFrames: Math.max(1, endAt - startAt) });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(p * value)}</span>;
};

// in the scene: starts counting on "counts", lands as "42" is spoken
<NumberTicker value={42} startAt={atWord("proof", "counts")} endAt={atWord("proof", "42")} />
```

### Example: border beam

The web version spins a conic gradient with a CSS keyframe. In Remotion the angle comes from the frame:

```tsx
const angle = (useCurrentFrame() / period) * 360;
// background: `conic-gradient(from ${angle}deg, transparent 0deg, transparent 250deg, ${color} 320deg, #fff 345deg, transparent 360deg)`
```

Full version in `templates/src/example/kit.tsx`.

## Licences and logos

- Check each component's licence on its page. Most are free to use, some are paid. Only use paid components under an account that has paid for them.
- Brand logos are trademarks. Use them only where the claim is true (we really integrate with Xero, the client really is accredited). Never imply an endorsement or partnership that doesn't exist.
- Reuse ported components. Once a stat card or toast is ported and looks right, copy it into the next video's kit rather than porting it again.
