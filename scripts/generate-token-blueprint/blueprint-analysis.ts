import type { BlueprintToken } from '@/core/tokens'
import type { Theme } from '@/theme/types'

import { normalizeHex } from '@/core/normalize-hex'
import { getTokenColor } from '@/theme/theme-mapper'

export function buildTypeGroups(
  blueprint: BlueprintToken[],
): Record<string, { count: number; uniqueValues: string[] }> {
  const groups = new Map<string, string[]>()

  for (const token of blueprint) {
    if (!groups.has(token.type)) {
      groups.set(token.type, [])
    }
    groups.get(token.type)!.push(token.value)
  }

  const output: Record<string, { count: number; uniqueValues: string[] }> = {}
  for (const [type, values] of groups.entries()) {
    const uniqueValues = [...new Set(values)].sort((left, right) => left.localeCompare(right))
    output[type] = {
      count: values.length,
      uniqueValues,
    }
  }

  return output
}

export function buildThemeReverseLookup(
  theme: Theme,
  blueprint: BlueprintToken[],
): Record<string, { type: string; value: string }[]> {
  const colorToExamples = new Map<string, { type: string; value: string }[]>()

  for (const token of blueprint) {
    if (token.isWhitespace) {
      continue
    }

    const color = normalizeHex(getTokenColor(theme, token.type))
    if (!color) {
      continue
    }

    if (!colorToExamples.has(color)) {
      colorToExamples.set(color, [])
    }

    const bucket = colorToExamples.get(color)!
    const duplicate = bucket.some(
      (entry) => entry.type === token.type && entry.value === token.value,
    )

    if (!duplicate) {
      bucket.push({ type: token.type, value: token.value })
    }
  }

  const reverseLookup: Record<string, { type: string; value: string }[]> = {}
  for (const [color, entries] of colorToExamples.entries()) {
    reverseLookup[color] = entries
  }

  return reverseLookup
}
