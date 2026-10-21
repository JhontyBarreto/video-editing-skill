import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { C } from "../theme";
import { ReelCaptions } from "./Captions";
import { Cta } from "./scenes/Cta";
import { Hook } from "./scenes/Hook";
import { Proof } from "./scenes/Proof";
import { SCENES, sceneRange, VO_OFFSET } from "./timing";

// One component per script line, keyed by the line id
const SCENE_COMPONENTS: Record<string, React.FC> = { hook: Hook, proof: Proof, cta: Cta };

// Set to e.g. "vo/music1.mp3" once you've generated and profiled a bed
const MUSIC: string | null = null;
const MUSIC_TRIM_FRAMES = 0; // skip silence at the start of the track
const MUSIC_VOLUME = 0.15;

// Sound effects pinned to frames, e.g. { at: sceneRange("cta").from - 3, src: "sfx/whoosh.mp3", volume: 0.18 }
const SFX: { at: number; src: string; volume: number }[] = [];

export const ExampleReel: React.FC<{ total: number }> = ({ total }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {SCENES.map((s) => {
      const Scene = SCENE_COMPONENTS[s.id];
      const r = sceneRange(s.id);
      return (
        <Sequence key={s.id} from={r.from} durationInFrames={r.durationInFrames} name={s.id}>
          <Scene />
        </Sequence>
      );
    })}
    <ReelCaptions />

    <Sequence from={VO_OFFSET} name="voiceover">
      <Audio src={staticFile("vo/example-reel.mp3")} />
    </Sequence>
    {MUSIC && (
      <Audio
        src={staticFile(MUSIC)}
        trimBefore={MUSIC_TRIM_FRAMES}
        volume={(f) =>
          interpolate(f, [0, 8, total - 45, total], [0, MUSIC_VOLUME, MUSIC_VOLUME, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    )}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} durationInFrames={45} name={`sfx ${s.src}`}>
        <Audio src={staticFile(s.src)} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
