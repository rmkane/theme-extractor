import { describe, expect, it } from 'vitest'

import { normalizeHex } from '@/core/normalize-hex'

describe('normalizeHex', () => {
  it('returns null for empty input', () => {
    expect(normalizeHex(null)).toBeNull()
    expect(normalizeHex(undefined)).toBeNull()
    expect(normalizeHex('')).toBeNull()
  })

  it('expands 3-digit hex', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
    expect(normalizeHex('#f00')).toBe('#FF0000')
  })

  it('keeps 6-digit hex uppercased', () => {
    expect(normalizeHex('#aabbcc')).toBe('#AABBCC')
    expect(normalizeHex('#FF0000')).toBe('#FF0000')
  })

  it('strips alpha from 8-digit hex', () => {
    expect(normalizeHex('#FF000080')).toBe('#FF0000')
  })
})
