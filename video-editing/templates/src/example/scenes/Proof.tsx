import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg, NumberTicker, StatCard } from "../kit";
import { atWord } from "../timing";

// The ticker starts counting on "counts" and lands on 42 exactly as "42" is spoken
export const Proof: React.FC = () => (
  <Bg>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 300 }}>
      <StatCard label="Lands on the word" startAt={atWord("proof", "this")}>
        <NumberTicker value={42} startAt={atWord("proof", "counts")} endAt={atWord("proof", "42")} />
      </StatCard>
    </AbsoluteFill>
  </Bg>
);
