import type { LanguageId } from '@/core/languages'
import type { Theme } from '@/theme/types'

import { tokenizeCode } from '@/core/lexer'
import { normalizeHex } from '@/core/normalize-hex'
import { getTokenColor } from '@/theme/theme-mapper'

export interface ActualSegment {
  text: string
  color: string | null
  type: string
}

export function buildActualSegments(
  languageId: LanguageId,
  theme: Theme,
  code: string,
): ActualSegment[] {
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
