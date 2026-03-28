import { z } from 'zod'

/** Regex stored as JSON-safe `source` + `flags` (see `RegExp` constructor). */
export const tokenPatternSchema = z.object({
  source: z.string().min(1),
  flags: z.string(),
})

/** One language entry as authored in `config/languages.data.json` (before `RegExp` is built). */
export const languageRecordSchema = z.object({
  label: z.string().min(1),
  sampleCode: z.string(),
  keywords: z.array(z.string()),
  literals: z.array(z.string()),
  primitiveTypes: z.array(z.string()),
  declarationKeywords: z.array(z.string()),
  typeContextKeywords: z.array(z.string()),
  controlKeywords: z.array(z.string()),
  declarationFollowers: z.array(z.string()),
  tokenPattern: tokenPatternSchema,
})

/** Root shape of `config/languages.data.json`. */
export const languagesDataFileSchema = z
  .object({
    defaultLanguageId: z.string().min(1),
    languages: z.record(z.string(), languageRecordSchema),
  })
  .refine((data) => Object.hasOwn(data.languages, data.defaultLanguageId), {
    path: ['defaultLanguageId'],
    message: 'defaultLanguageId must match a key in languages',
  })

export type LanguageRecordJson = z.infer<typeof languageRecordSchema>
export type LanguagesDataFile = z.infer<typeof languagesDataFileSchema>
