import languagesDataJson from '@config/languages.data.json'
import specimensDataJson from '@config/specimens.data.json'
import { describe, expect, it } from 'vitest'

import { languagesDataFileSchema } from '@/schemas/language-schema'
import { specimensDataFileSchema } from '@/schemas/specimen-schema'

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
