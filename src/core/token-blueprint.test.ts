import { describe, expect, it } from 'vitest'

import { buildTokenBlueprint } from '@/core/token-blueprint'

describe('buildTokenBlueprint', () => {
  it('tracks line and column across newlines', () => {
    const blueprint = buildTokenBlueprint('java', 'a\nb')

    expect(blueprint[0]).toMatchObject({
      value: 'a',
      startLine: 1,
      startColumn: 1,
      isWhitespace: false,
    })

    const newline = blueprint.find((t) => t.value === '\n')
    expect(newline).toMatchObject({
      startLine: 1,
      isWhitespace: true,
    })

    const b = blueprint.find((t) => t.value === 'b')
    expect(b).toMatchObject({
      startLine: 2,
      startColumn: 1,
    })
  })

  it('marks whitespace plain tokens', () => {
    const blueprint = buildTokenBlueprint('java', 'int x')
    const space = blueprint.find((t) => t.value === ' ')
    expect(space?.isWhitespace).toBe(true)
  })

  it('assigns stable indices', () => {
    const blueprint = buildTokenBlueprint('java', 'void')
    expect(blueprint.map((t) => t.index)).toEqual(blueprint.map((_, i) => i))
  })
})
