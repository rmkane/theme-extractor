import type { LanguageId } from '@/core/languages'
import type { BlueprintToken } from '@/core/tokens'

import { defaultLanguageId } from '@/core/languages'
import { tokenizeCode } from '@/core/lexer'

function buildTokenBlueprint(
  languageId: LanguageId = defaultLanguageId,
  code = '',
): BlueprintToken[] {
  let line = 1
  let column = 1

  return tokenizeCode(languageId, code).map((token, index) => {
    const startLine = line
    const startColumn = column

    for (const character of token.value) {
      if (character === '\n') {
        line += 1
        column = 1
      } else {
        column += 1
      }
    }

    return {
      index,
      type: token.type,
      value: token.value,
      startLine,
      startColumn,
      isWhitespace: token.type === 'plain' && /^\s+$/.test(token.value),
    }
  })
}

export { buildTokenBlueprint }
