import type { ThemeRecordJson } from '@/schemas/theme-schema'
import type { Theme, ThemeColors } from '@/theme/types'

import themesDataJson from '@config/themes.data.json' with { type: 'json' }

import { themesDataFileSchema } from '@/schemas/theme-schema'

function toThemeColors(colors: ThemeRecordJson['colors']): ThemeColors {
  const entries = Object.entries(colors).filter(([, value]) => value !== undefined) as [
    string,
    string,
  ][]
  return Object.fromEntries(entries) as ThemeColors
}

function toTheme(record: ThemeRecordJson): Theme {
  const theme: Theme = { name: record.name, colors: toThemeColors(record.colors) }
  if (record.semanticTheme !== undefined) {
    theme.semanticTheme = record.semanticTheme
  }
  if (record.styles !== undefined) {
    theme.styles = record.styles
  }
  return theme
}

const parsed = themesDataFileSchema.parse(themesDataJson)

const themes: Theme[] = [...parsed.themes]
  .map(toTheme)
  .sort((left, right) => left.name.localeCompare(right.name))

export { themes }
