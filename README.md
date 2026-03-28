<!-- omit in toc -->
# Theme Generator

Small Vite app and CLI toolchain for reverse-engineering editor themes from specimen SVGs.

It does three things:

- renders sample code with the local token classifier and theme palettes
- verifies rendered token segments against reference SVG specimens
- generates a token blueprint JSON artifact for theme analysis and reverse lookup

<!-- omit in toc -->
## Table of Contents

- [Commands](#commands)
- [Project Layout](#project-layout)
- [Organization Notes](#organization-notes)
- [Workflow](#workflow)
- [Specimens](#specimens)

## Commands

Install dependencies with `pnpm install`, then use:

- `pnpm dev` to run the preview UI
- `pnpm build` to build the app
- `pnpm preview` to serve the production build
- `pnpm run verify:svg` to compare tokenized output against the SVG specimens
- `pnpm run generate:blueprint` to write `reference/token-blueprint.json`

## Project Layout

The source tree is intentionally small and flat.

```text
src/
  languages.js      Language registry and runtime config helpers
  main.js           Browser bootstrap and UI event wiring
  preview.js        DOM rendering for the live preview
  sample-code.js    Shared sample snippet used by the Java config
  specimens.js      Theme-to-SVG specimen mapping
  style.css         UI styles
  themes.js         Theme palette definitions
  tokenizer.js      Tokenization, blueprint generation, and HTML highlighting
```

Supporting directories:

- `public/specimens/` contains the SVG references used by the verifier and UI
- `scripts/verify-specimens.mjs` validates token/color parity with the SVGs
- `scripts/generate-token-blueprint.mjs` generates the reference blueprint artifact
- `reference/` stores generated analysis output

## Organization Notes

`src/` is well-organized for its current size:

- data modules are separated from behavior modules
- CLI scripts live outside `src/` and consume shared modules instead of duplicating logic
- language-specific configuration is isolated in `languages.js`, which keeps the tokenizer API language-first

The one boundary worth enforcing was keeping DOM preview rendering out of `tokenizer.js`; that logic now lives in `preview.js`. If the project grows to support multiple languages or more UI modes, the next sensible split would be `src/data/` and `src/lib/`, but that would be premature today.

## Workflow

1. Add or update a theme in `src/themes.js`.
2. Map its specimen SVG in `src/specimens.js`.
3. Run `pnpm run verify:svg` to confirm token and color coverage.
4. Run `pnpm run generate:blueprint` if you need updated reference output.

## Specimens

Specimen SVGs are sourced from [VS Code Themes](https://vscodethemes.com/).

Files in `public/specimens/` are normalized to the `theme-name.svg` pattern so
they can be resolved directly from theme identifiers in the app and verifier
scripts.
