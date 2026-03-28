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
  importOrder: ['<BUILTIN_MODULES>', '<TS_TYPES>.*', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[.]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx'],
}

export default config
