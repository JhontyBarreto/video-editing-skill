import React from "react";
import { AbsoluteFill } from "remotion";
import { C, SAFE } from "../../theme";
import { Bg, usePop } from "../kit";
import { atWord } from "../timing";

export const Cta: React.FC = () => {
  const head = usePop(atWord("cta", "then"));
  const button = usePop(atWord("cta", "example.com"));
  return (
    <Bg>
      <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`, alignItems: "center", justifyContent: "center", gap: 70 }}>
        <div style={{ ...head, fontSize: 110, fontWeight: 800, textAlign: "center", lineHeight: 1.05 }}>One clear call to action.</div>
        <div
          style={{
            ...button,
            fontSize: 80,
            fontWeight: 800,
            background: C.accent,
            border: `6px solid ${C.ink}`,
            boxShadow: `12px 12px 0 ${C.ink}`,
            borderRadius: 999,
            padding: "28px 70px",
          }}
        >
          example.com
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
