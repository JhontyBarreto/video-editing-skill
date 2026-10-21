import React from "react";
import { Composition, Folder } from "remotion";
import { ExampleReel } from "./example/ExampleReel";
import { TOTAL_FRAMES as EXAMPLE_FRAMES } from "./example/timing";
import { FPS } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Folder name="Examples">
    <Composition
      id="ExampleReel"
      component={ExampleReel}
      durationInFrames={EXAMPLE_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ total: EXAMPLE_FRAMES }}
    />
  </Folder>
);
