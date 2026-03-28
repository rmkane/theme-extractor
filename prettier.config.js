/** @type {import("prettier").Config} */
const config = {
  // Tailwind plugin must be last: https://github.com/tailwindlabs/prettier-plugin-tailwindcss
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  // `<TS_TYPES>.*` is required: without it, `import type` from `@/` shares the `^@/` group
  // with value imports and sort order fights TypeScript Organize Imports (inline `type X`).
  // `^@config/` after THIRD_PARTY so `vitest` (etc.) sorts before `@config/*.json` (@ < v alphabetically).
  importOrder: [
    '<BUILTIN_MODULES>',
    '<TS_TYPES>.*',
    '<THIRD_PARTY_MODULES>',
    '^@config/',
    '^@/(.*)$',
    '^[.]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx'],
}

export default config
