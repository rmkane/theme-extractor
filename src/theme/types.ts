/** Keys referenced by `theme-mapper` and optional per-theme palette entries. */
export interface ThemeColors {
  background?: string
  reservedWord?: string
  typeName?: string
  primitiveType?: string
  parameterType?: string
  number?: string
  literal?: string
  value?: string
  string?: string
  stringQuote?: string
  comment?: string
  className?: string
  functionDeclaration?: string
  functionCall?: string
  functionName?: string
  parameter?: string
  variable?: string
  member?: string
  operator?: string
  punctuation?: string
  punctuationParen?: string
  punctuationBrace?: string
  punctuationDelimiter?: string
  punctuationBracket?: string
  punctuationDot?: string
  punctuationEmptyCallParen?: string
  plain?: string
}

export interface Theme {
  name: string
  semanticTheme?: string
  colors: ThemeColors
  /** Token-type keys (e.g. `italic`, `bold`) mapped to CSS-ish tokens. */
  styles?: Partial<Record<string, string>>
}
