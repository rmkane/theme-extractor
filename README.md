<!-- omit in toc -->

# Theme Generator

Small Vite + TypeScript app and CLI toolchain for reverse-engineering editor themes from specimen SVGs.

It does three things:

- renders sample code with the local token classifier and theme palettes
- verifies rendered token segments against reference SVG specimens
- generates a token blueprint JSON artifact for theme analysis and reverse lookup

<!-- omit in toc -->

## Table of Contents

- [Theme Generator](#theme-generator)
  - [Table of Contents](#table-of-contents)
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
- `pnpm run test` / `pnpm run test:watch` for **Vitest** (`src/**/*.test.ts`, `scripts/**/*.test.ts`)
- `pnpm run typecheck` to run the TypeScript compiler (no emit)
- `pnpm run lint` / `pnpm run lint:fix` to run ESLint (flat config + `typescript-eslint`)
- `pnpm run format` / `pnpm run format:check` for Prettier (`@trivago/prettier-plugin-sort-imports` for import order — keep **`<TS_TYPES>.*`** — and `prettier-plugin-tailwindcss` for Tailwind class sorting; Tailwind plugin is listed last in `prettier.config.js` as required)
- **VS Code / Cursor**: Install **Prettier** when prompted. Workspace settings pin Prettier, turn off the built-in TS/JS formatter, and set **Organize Imports**, **Remove unused imports**, and **ESLint fix-all** to not run on save (they run after Prettier and make saves look “random”). If anything still changes on save, check **User** settings for the same `editor.codeActionsOnSave` keys. Use **Output → Prettier** if the extension errors. Run `pnpm run format` for a CI-identical pass.
- `pnpm run verify:svg` to compare tokenized output against the SVG specimens
- `pnpm run generate:blueprint` to write `reference/token-blueprint.json`
- **CI:** on push/PR to `main`, GitHub Actions runs `test`, `typecheck`, `lint`, `format:check`, `build`, and `verify:svg`

## Project Layout

`src/` is grouped by role; each folder stays small.

```text
config/
  languages.data.json   Language definitions (keywords, sample code, lexer regex as JSON)
  specimens.data.json   Theme id → specimen SVG file name (under `public/specimens/`)
src/schemas/
  language-schema.ts    Zod schemas for `config/languages.data.json`
  specimen-schema.ts    Zod schema for `config/specimens.data.json`
  index.ts              Re-exports schema modules (`import "@/schemas"`)
src/core/
  languages.ts          Loads config JSON, validates with Zod, builds `RegExp` + `Set` runtime config
  lexer.ts              Tokenization and semantic classification
  token-blueprint.ts    Lexer output plus line/column positions (reference tokens)
  tokens.ts             Shared token shape types
  normalize-hex.ts      Shared hex normalization for scripts and tooling
src/theme/
  types.ts              Theme and palette TypeScript types
  themes.ts             Theme palette definitions
  specimens.ts          Loads config JSON, validates, exposes `getSpecimenPath`
  theme-mapper.ts       Maps token types to theme colors and styles
src/render/
  highlight.ts          Theme-aware render model and HTML highlighting
src/app/
  main.ts               Browser bootstrap and UI event wiring (Vite entry)
  preview.ts            DOM rendering for the live preview
  appearance.ts         Light/dark/system appearance handling
  style.css             UI styles
tsconfig.json           Strict TS; `@/*` → `./src/*`, `@config/*` → `./config/*` (Vite mirrors both)
vite.config.ts          Vite + Tailwind plugin
```

Supporting directories:

- `public/specimens/` contains the SVG references used by the verifier and UI
- `scripts/verify-specimens/` — SVG parsing, comparison, and `cli.ts` entry (`pnpm run verify:svg`)
- `scripts/generate-token-blueprint/` — blueprint aggregation helpers and `cli.ts` entry (`pnpm run generate:blueprint`)
- `reference/` stores generated analysis output

## Organization Notes

- **`config/`** holds JSON-only inputs. TypeScript loads them via the `@config/…` import alias.
- **`src/schemas`** is the Zod layer: schemas for `config/*.data.json`, re-exported from `index.ts` as **`@/schemas`**.
- **`src/core`** is lexer- and language-only: no DOM, no theme palettes, no HTML. Language metadata is loaded from `config/languages.data.json` and validated with **`@/schemas`**.
- **`src/theme`** holds static theme **code** (palettes, mapper, specimen loader). Specimen file names live in `config/specimens.data.json` (validated via **`@/schemas`**).
- **`src/render`** turns classified tokens into styled HTML; it depends on core + theme but not on the DOM.
- **`src/app`** is the Vite entry and all browser-specific UI code.
- CLI scripts import from `src/core` and `src/theme` and keep their own orchestration (SVG parsing, JSON layout) in `scripts/`.

## Workflow

1. Add or update a theme in `src/theme/themes.ts`.
2. Map its specimen SVG in `config/specimens.data.json` (shape is enforced by `src/schemas/specimen-schema.ts`).
3. Run `pnpm run verify:svg` to confirm token and color coverage.
4. Run `pnpm run generate:blueprint` if you need updated reference output.

To add another language, edit `config/languages.data.json` (shape is enforced by `src/schemas/language-schema.ts`), including a `tokenPattern` with `source` and `flags` for `new RegExp(...)`, and point `defaultLanguageId` at the right key when you want it as the default.

## Specimens

Specimen SVGs are sourced from [VS Code Themes](https://vscodethemes.com/).

Files in `public/specimens/` are normalized to the `theme-name.svg` pattern so
they can be resolved directly from theme identifiers in the app and verifier
scripts.
