import { describe, expect, it } from 'vitest'

import { buildExpectedCodeAndColors, compareSegmentsToSvg } from './compare-segments'

describe('buildExpectedCodeAndColors', () => {
  it('joins characters and preserves color order', () => {
    const { code, colors } = buildExpectedCodeAndColors([
      { character: 'a', color: '#AA0000' },
      { character: 'b', color: '#00BB00' },
    ])
    expect(code).toBe('ab')
    expect(colors).toEqual(['#AA0000', '#00BB00'])
  })
})

describe('compareSegmentsToSvg', () => {
  it('passes when a single segment matches char and color', () => {
    const { code, colors } = buildExpectedCodeAndColors([{ character: 'x', color: '#FFFFFF' }])
    const result = compareSegmentsToSvg(code, colors, [
      { text: 'x', color: '#FFFFFF', type: 'variable' },
    ])
    expect(result.mismatchCount).toBe(0)
  })
})
