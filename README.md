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

`src/` is grouped by role; each folder stays small.

```text
src/core/
  languages.js        Language registry and runtime config helpers
  lexer.js              Tokenization and semantic classification
  token-blueprint.js    Lexer output plus line/column positions (reference tokens)
  normalize-hex.js      Shared hex normalization for scripts and tooling
  sample-code.js        Shared sample snippet used by the Java config
src/theme/
  themes.js             Theme palette definitions
  specimens.js          Theme-to-SVG specimen mapping
  theme-mapper.js       Maps token types to theme colors and styles
src/render/
  highlight.js          Theme-aware render model and HTML highlighting
src/app/
  main.js               Browser bootstrap and UI event wiring
  preview.js            DOM rendering for the live preview
  appearance.js         Light/dark/system appearance handling
  style.css             UI styles
```

Supporting directories:

- `public/specimens/` contains the SVG references used by the verifier and UI
- `scripts/verify-specimens.mjs` validates token/color parity with the SVGs
- `scripts/generate-token-blueprint.mjs` generates the reference blueprint artifact
- `reference/` stores generated analysis output

## Organization Notes

- **`src/core`** is lexer- and language-only: no DOM, no theme palettes, no HTML.
- **`src/theme`** holds static theme data and the type-to-color mapping used by the verifier, generator, and highlighter.
- **`src/render`** turns classified tokens into styled HTML; it depends on core + theme but not on the DOM.
- **`src/app`** is the Vite entry and all browser-specific UI code.
- CLI scripts import from `src/core` and `src/theme` and keep their own orchestration (SVG parsing, JSON layout) in `scripts/`.

## Workflow

1. Add or update a theme in `src/theme/themes.js`.
2. Map its specimen SVG in `src/theme/specimens.js`.
3. Run `pnpm run verify:svg` to confirm token and color coverage.
4. Run `pnpm run generate:blueprint` if you need updated reference output.

## Specimens

Specimen SVGs are sourced from [VS Code Themes](https://vscodethemes.com/).

Files in `public/specimens/` are normalized to the `theme-name.svg` pattern so
they can be resolved directly from theme identifiers in the app and verifier
scripts.
