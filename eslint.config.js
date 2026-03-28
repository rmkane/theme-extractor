import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**'],
  },
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
    ignores: ['src/schemas/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.\\.?/',
              message:
                'Use @/, @config/, or @scripts/ instead of relative imports. Barrel ./ re-exports are only allowed in src/schemas/index.ts.',
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
)
