import { z } from 'zod'

/** Hex color: `#RGB`, `#RRGGBB`, or `#RRGGBBAA` (alpha allowed for editor-style values). */
export const hexColorSchema = z
  .string()
  .regex(
    /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
    'Expected #RGB, #RRGGBB, or #RRGGBBAA',
  )

const optionalHex = hexColorSchema.optional()

/** Palette keys aligned with `ThemeColors` in `src/theme/types.ts`. */
export const themeColorsSchema = z
  .object({
    background: optionalHex,
    reservedWord: optionalHex,
    typeName: optionalHex,
    primitiveType: optionalHex,
    parameterType: optionalHex,
    number: optionalHex,
    literal: optionalHex,
    value: optionalHex,
    string: optionalHex,
    stringQuote: optionalHex,
    comment: optionalHex,
    className: optionalHex,
    functionDeclaration: optionalHex,
    functionCall: optionalHex,
    functionName: optionalHex,
    parameter: optionalHex,
    variable: optionalHex,
    member: optionalHex,
    operator: optionalHex,
    punctuation: optionalHex,
    punctuationParen: optionalHex,
    punctuationBrace: optionalHex,
    punctuationDelimiter: optionalHex,
    punctuationBracket: optionalHex,
    punctuationDot: optionalHex,
    punctuationEmptyCallParen: optionalHex,
    plain: optionalHex,
  })
  .strict()

export const themeRecordSchema = z.object({
  name: z.string().min(1),
  semanticTheme: z.string().optional(),
  colors: themeColorsSchema,
  styles: z.record(z.string(), z.string()).optional(),
})

/** Root shape of `config/themes.data.json`. */
export const themesDataFileSchema = z.object({
  themes: z.array(themeRecordSchema),
})

export type ThemeRecordJson = z.infer<typeof themeRecordSchema>
export type ThemesDataFile = z.infer<typeof themesDataFileSchema>
