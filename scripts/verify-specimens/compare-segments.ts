import type { ActualSegment } from '@scripts/verify-specimens/actual-segments'
import type { ExpectedChar } from '@scripts/verify-specimens/svg-specimen'

const isWhitespace = (value: string): boolean => /^\s+$/.test(value)

export interface MismatchExample {
  segmentIndex: number
  token: string
  reason: string
  expected: string
  actual: string
  type: string
}

export function buildExpectedCodeAndColors(expectedChars: ExpectedChar[]): {
  code: string
  colors: (string | null)[]
} {
  const chars: string[] = []
  const colors: (string | null)[] = []
  for (const entry of expectedChars) {
    chars.push(entry.character)
    colors.push(entry.color)
  }
  return {
    code: chars.join(''),
    colors,
  }
}

export function compareSegmentsToSvg(
  expectedCode: string,
  expectedColors: (string | null)[],
  actualSegments: ActualSegment[],
  maxExamples = 12,
): {
  mismatchCount: number
  examples: MismatchExample[]
  expectedLength: number
  actualLength: number
} {
  const mismatches: MismatchExample[] = []
  let cursor = 0

  const nextNonWhitespace = (start: number): number => {
    let index = start
    while (index < expectedCode.length && /\s/.test(expectedCode[index]!)) {
      index += 1
    }
    return index
  }

  for (let segmentIndex = 0; segmentIndex < actualSegments.length; segmentIndex += 1) {
    const segment = actualSegments[segmentIndex]!
    if (!segment.text || isWhitespace(segment.text)) {
      continue
    }

    const expectedPalette: (string | null)[] = []
    for (let i = 0; i < segment.text.length; i += 1) {
      const char = segment.text[i]!
      if (/\s/.test(char)) {
        continue
      }

      cursor = nextNonWhitespace(cursor)
      if (cursor >= expectedCode.length) {
        mismatches.push({
          segmentIndex,
          token: segment.text,
          reason: 'expected-exhausted',
          expected: '<none>',
          actual: `${char} ${segment.color}`,
          type: segment.type,
        })
        break
      }

      const expectedChar = expectedCode[cursor]!
      const expectedColor = expectedColors[cursor]!
      if (expectedChar !== char) {
        mismatches.push({
          segmentIndex,
          token: segment.text,
          reason: 'character',
          expected: `${expectedChar} ${expectedColor}`,
          actual: `${char} ${segment.color}`,
          type: segment.type,
        })
        cursor += 1
        break
      }

      expectedPalette.push(expectedColor)
      cursor += 1
    }

    if (expectedPalette.length > 0) {
      const expectedColor = expectedPalette[0]!
      const colorMismatch = expectedPalette.some((color) => color !== segment.color)
      if (colorMismatch || expectedColor !== segment.color) {
        mismatches.push({
          segmentIndex,
          token: segment.text,
          reason: 'color',
          expected: `${expectedColor} (${[...new Set(expectedPalette)].join(',')})`,
          actual: String(segment.color),
          type: segment.type,
        })
      }
    }
  }

  const trailing = nextNonWhitespace(cursor)
  if (trailing < expectedCode.length) {
    mismatches.push({
      segmentIndex: actualSegments.length,
      token: '<end>',
      reason: 'unmatched-svg-tail',
      expected: expectedCode.slice(trailing, trailing + 20),
      actual: '<none>',
      type: 'tail',
    })
  }

  return {
    mismatchCount: mismatches.length,
    examples: mismatches.slice(0, maxExamples),
    expectedLength: expectedCode.length,
    actualLength: actualSegments.reduce((sum, segment) => sum + segment.text.length, 0),
  }
}
