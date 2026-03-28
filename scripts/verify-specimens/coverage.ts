import fs from 'node:fs'

import { specimenByTheme } from '@/theme/specimens'
import { themes } from '@/theme/themes'

export function validateSpecimenCoverage(specimensDir: string): {
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
