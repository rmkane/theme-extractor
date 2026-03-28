import languagesDataJson from '@config/languages.data.json'

import { type LanguageRecordJson, languagesDataFileSchema } from '@/schemas'

export interface LanguageDefinition {
  label: string
  sampleCode: string
  keywords: string[]
  literals: string[]
  primitiveTypes: string[]
  declarationKeywords: string[]
  typeContextKeywords: string[]
  controlKeywords: string[]
  declarationFollowers: string[]
  tokenPattern: RegExp
}

export interface LanguageRuntimeConfig extends LanguageDefinition {
  keywordSet: Set<string>
  literalSet: Set<string>
  primitiveTypeSet: Set<string>
  declarationKeywordSet: Set<string>
  typeContextKeywordSet: Set<string>
  controlKeywordSet: Set<string>
  declarationFollowerSet: Set<string>
}

const parsed = languagesDataFileSchema.parse(languagesDataJson)

function recordToDefinition(record: LanguageRecordJson): LanguageDefinition {
  const { tokenPattern, ...rest } = record
  return {
    ...rest,
    tokenPattern: new RegExp(tokenPattern.source, tokenPattern.flags),
  }
}

const languages: Record<string, LanguageDefinition> = Object.fromEntries(
  Object.entries(parsed.languages).map(([id, record]) => [id, recordToDefinition(record)]),
)

export type LanguageId = string

export const defaultLanguageId: LanguageId = parsed.defaultLanguageId

const cachedLanguageConfigs = new Map<LanguageId, LanguageRuntimeConfig>()

function createRuntimeConfig(language: LanguageDefinition): LanguageRuntimeConfig {
  return {
    ...language,
    keywordSet: new Set(language.keywords),
    literalSet: new Set(language.literals),
    primitiveTypeSet: new Set(language.primitiveTypes),
    declarationKeywordSet: new Set(language.declarationKeywords),
    typeContextKeywordSet: new Set(language.typeContextKeywords),
    controlKeywordSet: new Set(language.controlKeywords),
    declarationFollowerSet: new Set(language.declarationFollowers),
  }
}

function getLanguageConfig(languageId: LanguageId = defaultLanguageId): LanguageRuntimeConfig {
  const language = languages[languageId]
  if (!language) {
    throw new Error(`Unsupported language: ${languageId}`)
  }
  if (!cachedLanguageConfigs.has(languageId)) {
    cachedLanguageConfigs.set(languageId, createRuntimeConfig(language))
  }
  return cachedLanguageConfigs.get(languageId)!
}

function getLanguageOptions(): { id: LanguageId; label: string }[] {
  return (Object.entries(languages) as [LanguageId, LanguageDefinition][]).map(
    ([id, language]) => ({
      id,
      label: language.label,
    }),
  )
}

export { languages, getLanguageConfig, getLanguageOptions }
