import { describe, expect, it } from 'vitest'

import { tokenizeCode } from '@/core/lexer'

describe('tokenizeCode', () => {
  it('classifies Java keywords and declaration name', () => {
    const tokens = tokenizeCode('java', 'public class Main')
    const types = tokens.map((t) => t.type)
    const values = tokens.map((t) => t.value)

    expect(types).toContain('keyword')
    expect(types).toContain('class')
    expect(values.join('')).toBe('public class Main')
  })

  it('classifies string literals', () => {
    const tokens = tokenizeCode('java', '"hello"')
    const stringToken = tokens.find((t) => t.type === 'string')
    expect(stringToken?.value).toBe('"hello"')
  })

  it('classifies numbers', () => {
    const tokens = tokenizeCode('java', '3.14')
    expect(tokens.some((t) => t.type === 'number' && t.value === '3.14')).toBe(true)
  })

  it('classifies line comments', () => {
    const tokens = tokenizeCode('java', '// todo')
    expect(tokens.some((t) => t.type === 'comment')).toBe(true)
  })

  it('returns empty array for empty code', () => {
    expect(tokenizeCode('java', '')).toEqual([])
  })
})
