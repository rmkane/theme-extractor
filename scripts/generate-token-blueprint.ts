#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { BlueprintToken } from '@/core/tokens'
import type { Theme } from '@/theme/types'

import { defaultLanguageId, getLanguageConfig } from '@/core/languages'
import { normalizeHex } from '@/core/normalize-hex'
import { buildTokenBlueprint } from '@/core/token-blueprint'
import { getTokenColor } from '@/theme/theme-mapper'
import { themes } from '@/theme/themes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'reference', 'token-blueprint.json')

function buildTypeGroups(
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

function buildThemeReverseLookup(
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

function main(): void {
  const languageId = defaultLanguageId
  const { sampleCode } = getLanguageConfig(languageId)
  const blueprint = buildTokenBlueprint(languageId, sampleCode)
  const typeGroups = buildTypeGroups(blueprint)

  const themeReverseLookup: Record<string, Record<string, { type: string; value: string }[]>> = {}
  for (const theme of themes) {
    themeReverseLookup[theme.name] = buildThemeReverseLookup(theme, blueprint)
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      languageId,
      sampleCode,
      tokenCount: blueprint.length,
      nonWhitespaceTokenCount: blueprint.filter((token) => !token.isWhitespace).length,
    },
    tokenBlueprint: blueprint,
    groupsByType: typeGroups,
    reverseLookupByTheme: themeReverseLookup,
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Wrote blueprint: ${outputPath}`)
}

main()
