// Reusable visual pieces for this video. UI pulled from 21st.dev lands here after it's
// been ported: no CSS/framer-motion animation, everything driven by the frame, sized for 1080 wide.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../theme";

// Pop-in for anything: scales and fades in from `startAt` (a frame relative to the scene)
export const usePop = (startAt: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startAt, fps, config: { damping: 14, stiffness: 200, mass: 0.7 } });
  return { opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }), scale: String(interpolate(p, [0, 1], [0.8, 1])) };
};

// Dot-grid background. Port of the 21st.dev / Magic UI "dot pattern", static so it renders fine as-is.
export const Bg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily, color: C.ink }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${C.ink}22 2px, transparent 2.5px)`,
        backgroundSize: "36px 36px",
        maskImage: "radial-gradient(ellipse 90% 60% at 50% 40%, #000 0%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 40%, #000 0%, transparent 75%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

// Number ticker. Ported from the web version (framer-motion useSpring + useInView + useEffect):
// the count is now a pure function of the frame, so it renders identically every time.
export const NumberTicker: React.FC<{ value: number; startAt: number; endAt: number; style?: React.CSSProperties }> = ({
  value,
  startAt,
  endAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startAt, fps, config: { damping: 200 }, durationInFrames: Math.max(1, endAt - startAt) });
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{Math.round(p * value)}</span>;
};

// Border beam. Ported from the CSS keyframe version: the conic gradient angle comes from the frame.
export const BorderBeam: React.FC<{ period?: number; width?: number; color?: string }> = ({
  period = 90,
  width = 6,
  color = C.accent,
}) => {
  const angle = (useCurrentFrame() / period) * 360;
  return (
    <div
      style={{
        position: "absolute",
        inset: -width,
        borderRadius: "inherit",
        padding: width,
        background: `conic-gradient(from ${angle}deg, transparent 0deg, transparent 250deg, ${color} 320deg, #fff 345deg, transparent 360deg)`,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
};

// Stat card. Ported from a 21st.dev stat card: Tailwind classes turned into inline styles,
// shadcn colour variables swapped for theme colours, sizes multiplied about 3x for video.
export const StatCard: React.FC<{ label: string; children: React.ReactNode; startAt: number }> = ({ label, children, startAt }) => {
  const pop = usePop(startAt);
  return (
    <div
      style={{
        position: "relative",
        width: 820,
        padding: "60px 70px",
        borderRadius: 48,
        background: C.card,
        border: `6px solid ${C.ink}`,
        boxShadow: `14px 14px 0 ${C.ink}`,
        ...pop,
      }}
    >
      <BorderBeam />
      <div style={{ fontSize: 44, fontWeight: 600, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 260, fontWeight: 800, lineHeight: 1 }}>{children}</div>
    </div>
  );
};
