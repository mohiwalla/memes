---
name: tag-meme
description: Tag meme assets by actual visual content, not filenames. Use when populating or updating `src/lib/tags-database.ts`, classifying meme images/GIFs, or generating search tags for meme libraries. Workflow uses Bun scripts, GIF frame sheets, alias previews to hide filenames, and Gemini CLI for visual tagging.
---

# Tag Meme

Use this skill when meme assets need search tags based on what is visibly happening, not asset filenames.

## Tools

Need:

- `bun`
- `gemini`
- `ffmpeg`
- `ffprobe`
- `sips`

## Core method

1. Build previews inside workspace.
2. For GIFs, extract 6 frames across duration and tile into 3x2 sheet.
3. For still images, convert to resized PNG preview.
4. Create alias preview copies like `img001.png` so model cannot anchor on original filenames.
5. Ask Gemini to inspect alias previews by visible content only.
6. Require 6 to 8 lowercase tags mixing:
   - source/person/character if identifiable
   - visible expression or action
   - likely meme search intent
7. Save batch checkpoints after every Gemini batch.
8. Merge tags into `src/lib/tags-database.ts`, strip exact filler tags like `reaction`, sort keys.
9. Spot-check weird or high-risk entries with image viewer before finalizing.

## Files

- Build previews: [`scripts/build-previews.ts`](./scripts/build-previews.ts)
- Generate tags from previews: [`scripts/generate-tags.ts`](./scripts/generate-tags.ts)
- Merge generated tags into database: [`scripts/write-tags-database.ts`](./scripts/write-tags-database.ts)
- Run end-to-end flow: [`scripts/run-tag-meme.ts`](./scripts/run-tag-meme.ts)

## Standard commands

Sample first:

```bash
bun .agents/skills/tag-meme/scripts/run-tag-meme.ts --limit 5
```

Full run:

```bash
bun .agents/skills/tag-meme/scripts/run-tag-meme.ts
```

Resume from checkpoint:

```bash
bun .agents/skills/tag-meme/scripts/run-tag-meme.ts --resume
```

Write after every batch:

```bash
bun .agents/skills/tag-meme/scripts/run-tag-meme.ts --apply-after-batch
```

## Behavior rules

- Do not trust filenames for semantic tags.
- Use alias previews when calling Gemini.
- Keep batch size small. Default `6`.
- Retry Gemini batch on API or JSON parse failure.
- Write checkpoint JSON after each successful batch.
- If user asks for trial run, use `--limit`.
- If generated tags look weak or identity-sensitive, inspect preview manually before keeping them.

## Prompt shape for Gemini

Prompt must say:

- files are workspace PNGs
- some are stills, some are GIF contact sheets
- infer tags from pixels only
- keys must be alias names exactly
- tags lowercase
- no generic filler like `meme`, `gif`, `image`, `reaction`
- use descriptive visual tags if identity unclear

## Output locations

- Preview PNGs: `.gemini-previews/`
- Alias PNGs: `.gemini-previews-id/`
- Generated checkpoint JSON: `.gemini-previews/tags.generated.json`
- Final database: `src/lib/tags-database.ts`

## When to inspect manually

- Celebrity or character identity uncertain
- One-frame still looks ambiguous
- Generated tags include generic junk
- Asset appears corrupted or decoder-specific

## Notes

- For static WEBP/PNG/JPG, `sips` is more reliable than `ffmpeg` on some files.
- For GIFs, `ffprobe` duration plus `ffmpeg` tile sheet gives better context than first-frame only.
- Incremental apply matters. User may want results written before whole run finishes.
