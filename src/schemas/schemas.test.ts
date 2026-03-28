import { describe, expect, it } from 'vitest'

import languagesDataJson from '@config/languages.data.json' with { type: 'json' }
import specimensDataJson from '@config/specimens.data.json' with { type: 'json' }
import themesDataJson from '@config/themes.data.json' with { type: 'json' }

import { languagesDataFileSchema } from '@/schemas/language-schema'
import { specimensDataFileSchema } from '@/schemas/specimen-schema'
import { themesDataFileSchema } from '@/schemas/theme-schema'

describe('languagesDataFileSchema', () => {
  it('accepts committed config', () => {
    expect(() => languagesDataFileSchema.parse(languagesDataJson)).not.toThrow()
  })

  it('rejects defaultLanguageId missing from languages', () => {
    const parsed = languagesDataFileSchema.parse(languagesDataJson)
    expect(() =>
      languagesDataFileSchema.parse({
        defaultLanguageId: 'missing',
        languages: parsed.languages,
      }),
    ).toThrow()
  })
})

describe('specimensDataFileSchema', () => {
  it('accepts committed config', () => {
    expect(() => specimensDataFileSchema.parse(specimensDataJson)).not.toThrow()
  })

  it('rejects non-svg file names', () => {
    expect(() =>
      specimensDataFileSchema.parse({
        theme: 'theme.png',
      }),
    ).toThrow()
  })
})

describe('themesDataFileSchema', () => {
  it('accepts committed config', () => {
    expect(() => themesDataFileSchema.parse(themesDataJson)).not.toThrow()
  })

  it('rejects unknown color keys', () => {
    const parsed = themesDataFileSchema.parse(themesDataJson)
    const first = parsed.themes[0]!
    expect(() =>
      themesDataFileSchema.parse({
        themes: [{ ...first, colors: { ...first.colors, typoKey: '#000000' } }],
      }),
    ).toThrow()
  })
})
