#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defaultLanguageId, getLanguageConfig } from '@/core/languages'
import { buildTokenBlueprint } from '@/core/token-blueprint'
import { themes } from '@/theme/themes'

import { buildThemeReverseLookup, buildTypeGroups } from './blueprint-analysis'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')
const outputPath = path.join(projectRoot, 'reference', 'token-blueprint.json')

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
