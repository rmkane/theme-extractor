import specimensDataJson from '@config/specimens.data.json'

import { specimensDataFileSchema } from '@/schemas'

const specimenByTheme: Record<string, string> = specimensDataFileSchema.parse(specimensDataJson)

function getSpecimenPath(themeName: string): string | null {
  const fileName = specimenByTheme[themeName]
  return fileName ? `/specimens/${fileName}` : null
}

export { specimenByTheme, getSpecimenPath }
