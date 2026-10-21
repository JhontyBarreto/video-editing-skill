import React from "react";
import { AbsoluteFill } from "remotion";
import { C, SAFE } from "../../theme";
import { Bg, usePop } from "../kit";
import { atWord } from "../timing";

// Each chunk of the headline pops in on the word that starts it
const Chunk: React.FC<{ text: string; word: string; highlight?: boolean }> = ({ text, word, highlight }) => {
  const pop = usePop(atWord("hook", word));
  return (
    <div style={{ ...pop, fontSize: 130, fontWeight: 800, lineHeight: 1.05, textAlign: "center" }}>
      <span style={{ background: highlight ? C.accent : "transparent", borderRadius: 20, padding: "0 16px" }}>{text}</span>
    </div>
  );
};

export const Hook: React.FC = () => (
  <Bg>
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`, justifyContent: "center", gap: 20 }}>
      <Chunk text="Every line" word="every" />
      <Chunk text="becomes" word="becomes" />
      <Chunk text="one scene." word="one" highlight />
    </AbsoluteFill>
  </Bg>
);
