# Video editing skill (Remotion + ElevenLabs + 21st.dev)

A Claude Code skill that holds our whole short-form video process: script, ElevenLabs voiceover with word timestamps, a speech-to-text check of every take, music and sound effects, UI pieces from 21st.dev ported into Remotion, captions synced to the voice, render, loudness and QA.

It's the process only. There are **no API keys in this repo** and there never should be. You use your own logins, kept on your own machine.

## What's inside

```
video-editing/
  SKILL.md              the workflow and the hard rules (start here)
  references/           one file per step: setup, script, elevenlabs, 21st-dev, remotion, render-and-qa
  scripts/              voiceover, scribe check, music, sfx, audio check, loudness normalise
  templates/            a working example reel to copy into a new Remotion project
```

## Install

1. Install Claude Code if you haven't: https://docs.claude.com/en/docs/claude-code
2. Copy the skill into your skills folder:

   ```bash
   git clone https://github.com/JhontyBarreto/video-editing-skill.git
   mkdir -p ~/.claude/skills
   cp -R video-editing-skill/video-editing ~/.claude/skills/
   ```

   Or put it in a single project at `<project>/.claude/skills/video-editing/`.

3. Set up your accounts (details in `video-editing/references/setup.md`):
   - **Node 20.6+**
   - **ElevenLabs:** put your key in `~/.credentials/elevenlabs.env` (template in `templates/elevenlabs.env.example`). Never inside a project folder, never committed.
   - **21st.dev:** `npm i -g @21st-dev/cli` then `21st login`.

4. Open Claude Code in a video project and ask for what you need, e.g.
   - "Use the video-editing skill to set up a new Remotion project and render the example reel"
   - "Make a 35 second reel for <brand> about <topic>, script first"
   - "Re-cut this reel as a 4:5 feed ad"

   Claude reads `SKILL.md`, follows the steps, and stops for your approval on the script before spending any credits.

## Ground rules

- Keys stay on your machine. If you ever see one in a file that's about to be committed, stop.
- Every claim in a video has to be true. No invented stats or testimonials.
- No em dashes in scripts, captions or on-screen text.
- Nothing gets published or scheduled. Finished videos are handed over as drafts.

## Updating

Pull the latest and copy the folder over again:

```bash
cd video-editing-skill && git pull && cp -R video-editing ~/.claude/skills/
```
