#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { LanguageId } from '@/core/languages'
import type { Theme } from '@/theme/types'

import { defaultLanguageId, getLanguageConfig } from '@/core/languages'
import { tokenizeCode } from '@/core/lexer'
import { normalizeHex } from '@/core/normalize-hex'
import { specimenByTheme } from '@/theme/specimens'
import { getTokenColor } from '@/theme/theme-mapper'
import { themes } from '@/theme/themes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const baseDir = path.resolve(__dirname, '..')
const specimensDir = path.join(baseDir, 'public', 'specimens')

const isWhitespace = (value: string): boolean => /^\s+$/.test(value)

function decodeEntities(text: string): string {
  return text
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

interface SvgRun {
  text: string
  color: string | null
}

function extractSvgCodeRuns(svgContent: string): SvgRun[] {
  const monoTextMatch =
    svgContent.match(/<text[^>]*font-family="[^"]*SFMono-Regular[^"]*"[^>]*>[\s\S]*?<\/text>/) ||
    svgContent.match(/<text[^>]*font-family='[^']*SFMono-Regular[^']*'[^>]*>[\s\S]*?<\/text>/)

  if (!monoTextMatch) {
    throw new Error('Unable to find monospaced code block in specimen SVG.')
  }

  const monoTextBlock = monoTextMatch[0]!
  const inheritedFillMatch = monoTextBlock.match(/<text[^>]*\sfill="(#[0-9A-Fa-f]{3,8})"/)
  const inheritedFill = normalizeHex(inheritedFillMatch?.[1] ?? null)

  const runPattern = /<tspan([^>]*)>([^<]*)<\/tspan>/g
  const runs: SvgRun[] = []
  let match: RegExpExecArray | null

  while ((match = runPattern.exec(monoTextBlock)) !== null) {
    const attrs = match[1] ?? ''
    const text = decodeEntities(match[2] ?? '')
    if (!text) {
      continue
    }

    const fillMatch = attrs.match(/\sfill="(#[0-9A-Fa-f]{3,8})"/)
    const color = normalizeHex(fillMatch?.[1] ?? inheritedFill)

    runs.push({ text, color })
  }

  return runs
}

interface ExpectedChar {
  character: string
  color: string | null
}

function buildExpectedCharStreamFromSvg(svgContent: string): ExpectedChar[] {
  const runs = extractSvgCodeRuns(svgContent)
  const stream: ExpectedChar[] = []

  for (const run of runs) {
    for (const character of run.text) {
      if (character === '\n' || character === '\r') {
        continue
      }
      stream.push({ character, color: run.color })
    }
  }

  return stream
}

interface ActualSegment {
  text: string
  color: string | null
  type: string
}

function buildActualSegments(languageId: LanguageId, theme: Theme, code: string): ActualSegment[] {
  const segments: ActualSegment[] = []

  for (const token of tokenizeCode(languageId, code)) {
    if (token.type === 'string' && token.value.length >= 2) {
      const quoteColor = normalizeHex(getTokenColor(theme, 'string-quote'))
      const contentColor = normalizeHex(getTokenColor(theme, 'string'))
      segments.push({ text: token.value[0]!, color: quoteColor, type: 'string-quote' })
      if (token.value.length > 2) {
        segments.push({
          text: token.value.slice(1, -1),
          color: contentColor,
          type: 'string-content',
        })
      }
      segments.push({
        text: token.value[token.value.length - 1]!,
        color: quoteColor,
        type: 'string-quote',
      })
      continue
    }

    segments.push({
      text: token.value,
      color: normalizeHex(getTokenColor(theme, token.type)),
      type: token.type,
    })
  }

  return segments
}

function buildExpectedCodeAndColors(expectedChars: ExpectedChar[]): {
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

interface MismatchExample {
  segmentIndex: number
  token: string
  reason: string
  expected: string
  actual: string
  type: string
}

function compareSegmentsToSvg(
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

function validateCoverage(): {
  ok: boolean
  missingThemeMappings: string[]
  unknownMappings: string[]
  missingFiles: string[]
  unmappedFiles: string[]
  svgCount: number
  mappedCount: number
} {
  const svgFiles = fs.readdirSync(specimensDir).filter((fileName) => fileName.endsWith('.svg'))

  const mappingValues = Object.values(specimenByTheme)
  const mappingKeys = Object.keys(specimenByTheme)
  const themeNames = themes.map((theme) => theme.name)

  const missingThemeMappings = themeNames.filter((name) => !mappingKeys.includes(name))
  const unknownMappings = mappingKeys.filter((name) => !themeNames.includes(name))
  const missingFiles = mappingValues.filter((fileName) => !svgFiles.includes(fileName))
  const unmappedFiles = svgFiles.filter((fileName) => !mappingValues.includes(fileName))

  return {
    ok:
      missingThemeMappings.length === 0 &&
      unknownMappings.length === 0 &&
      missingFiles.length === 0 &&
      unmappedFiles.length === 0,
    missingThemeMappings,
    unknownMappings,
    missingFiles,
    unmappedFiles,
    svgCount: svgFiles.length,
    mappedCount: mappingValues.length,
  }
}

interface ThemeReport {
  theme: string
  skipped: boolean
  reason?: string
  specimenFile?: string
  mismatchCount?: number
  examples?: MismatchExample[]
  expectedLength?: number
  actualLength?: number
}

function main(): void {
  const languageId = defaultLanguageId
  const { sampleCode } = getLanguageConfig(languageId)
  const coverage = validateCoverage()
  if (!coverage.ok) {
    console.log('coverage: FAIL')
    if (coverage.missingThemeMappings.length > 0) {
      console.log(`  - missing theme mappings: ${coverage.missingThemeMappings.join(', ')}`)
    }
    if (coverage.unknownMappings.length > 0) {
      console.log(`  - unknown mapping keys: ${coverage.unknownMappings.join(', ')}`)
    }
    if (coverage.missingFiles.length > 0) {
      console.log(`  - missing files: ${coverage.missingFiles.join(', ')}`)
    }
    if (coverage.unmappedFiles.length > 0) {
      console.log(`  - unmapped svg files: ${coverage.unmappedFiles.join(', ')}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `coverage: PASS (${coverage.svgCount} svg files, ${coverage.mappedCount} mapped themes)`,
  )

  const reports: ThemeReport[] = []

  for (const theme of themes) {
    const specimenFile = specimenByTheme[theme.name]
    if (!specimenFile) {
      reports.push({ theme: theme.name, skipped: true, reason: 'No specimen mapping' })
      continue
    }

    const specimenPath = path.join(specimensDir, specimenFile)
    const svgContent = fs.readFileSync(specimenPath, 'utf8')
    const expectedChars = buildExpectedCharStreamFromSvg(svgContent)
    const { code: expectedCode, colors: expectedColors } = buildExpectedCodeAndColors(expectedChars)
    const actualSegments = buildActualSegments(languageId, theme, sampleCode)
    const comparison = compareSegmentsToSvg(expectedCode, expectedColors, actualSegments)

    reports.push({
      theme: theme.name,
      skipped: false,
      specimenFile,
      ...comparison,
    })
  }

  let hasFailure = false
  for (const report of reports) {
    if (report.skipped) {
      console.log(`${report.theme}: SKIPPED (${report.reason})`)
      continue
    }

    if (report.mismatchCount === 0) {
      console.log(
        `${report.theme}: PASS (${report.expectedLength} svg chars verified against ${report.specimenFile})`,
      )
      continue
    }

    hasFailure = true
    console.log(
      `${report.theme}: FAIL (${report.mismatchCount} mismatches, expected ${report.expectedLength}, actual ${report.actualLength})`,
    )
    for (const example of report.examples ?? []) {
      console.log(
        `  - seg ${example.segmentIndex} [${example.type}] '${example.token}' ${example.reason}: expected ${example.expected}, actual ${example.actual}`,
      )
    }
  }

  if (hasFailure) {
    process.exitCode = 1
  }
}

main()
