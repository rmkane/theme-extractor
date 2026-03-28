import type { LanguageId } from '@/core/languages'
import type { BlueprintToken } from '@/core/tokens'
import type { Theme } from '@/theme/types'

import { defaultLanguageId } from '@/core/languages'
import { buildTokenBlueprint } from '@/core/token-blueprint'
import { getTokenColor, getTokenStyle } from '@/theme/theme-mapper'

interface StringPart {
  role: string
  value: string
  color: string | undefined
}

export type RenderToken =
  | (BlueprintToken & {
      parts: StringPart[]
      color: null
      style: string | null
    })
  | (BlueprintToken & {
      parts: null
      color: string | undefined
      style: string | null
    })

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildRenderModel(
  languageId: LanguageId = defaultLanguageId,
  code = '',
  theme: Theme,
): RenderToken[] {
  return buildTokenBlueprint(languageId, code).map((token) => {
    if (token.type === 'string' && token.value.length >= 2) {
      const withParts: RenderToken = {
        ...token,
        parts: [
          {
            role: 'string-quote',
            value: token.value[0]!,
            color: getTokenColor(theme, 'string-quote'),
          },
          {
            role: 'string',
            value: token.value.slice(1, -1),
            color: getTokenColor(theme, 'string'),
          },
          {
            role: 'string-quote',
            value: token.value[token.value.length - 1]!,
            color: getTokenColor(theme, 'string-quote'),
          },
        ].filter((part) => part.value.length > 0),
        color: null,
        style: getTokenStyle(theme, token.type),
      }
      return withParts
    }

    const simple: RenderToken = {
      ...token,
      color: getTokenColor(theme, token.type),
      style: getTokenStyle(theme, token.type),
      parts: null,
    }
    return simple
  })
}

function highlightCode(
  languageId: LanguageId = defaultLanguageId,
  code = '',
  theme: Theme,
): string {
  return buildRenderModel(languageId, code, theme)
    .map((token) => {
      if (token.parts) {
        return token.parts
          .map((part) => {
            const escaped = escapeHtml(part.value)
            return part.color ? `<span style="color: ${part.color}">${escaped}</span>` : escaped
          })
          .join('')
      }

      const color = token.color
      const style = token.style
      const escaped = escapeHtml(token.value)

      if (!color && !style) {
        return escaped
      }

      const css: string[] = []
      if (color) {
        css.push(`color: ${color}`)
      }
      const styleTokens = Array.isArray(style)
        ? style
        : typeof style === 'string'
          ? style.split(/\s+/).filter(Boolean)
          : []
      if (styleTokens.includes('italic')) {
        css.push('font-style: italic')
      }
      if (styleTokens.includes('underline')) {
        css.push('text-decoration: underline')
      }
      if (styleTokens.includes('bold')) {
        css.push('font-weight: bold')
      }

      return `<span style="${css.join('; ')}">${escaped}</span>`
    })
    .join('')
}

export { buildRenderModel, highlightCode }
