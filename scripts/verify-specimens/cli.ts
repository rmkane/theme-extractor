#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { MismatchExample } from './compare-segments'

import { defaultLanguageId, getLanguageConfig } from '@/core/languages'
import { specimenByTheme } from '@/theme/specimens'
import { themes } from '@/theme/themes'

import { buildActualSegments } from './actual-segments'
import { buildExpectedCodeAndColors, compareSegmentsToSvg } from './compare-segments'
import { validateSpecimenCoverage } from './coverage'
import { buildExpectedCharStreamFromSvg } from './svg-specimen'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const baseDir = path.resolve(__dirname, '../..')
const specimensDir = path.join(baseDir, 'public', 'specimens')

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
  const coverage = validateSpecimenCoverage(specimensDir)
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
