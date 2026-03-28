import { defaultLanguageId } from "./languages.js";
import { tokenizeCode } from "./lexer.js";

function buildTokenBlueprint(languageId = defaultLanguageId, code = "") {
  let line = 1;
  let column = 1;

  return tokenizeCode(languageId, code).map((token, index) => {
    const startLine = line;
    const startColumn = column;

    for (const character of token.value) {
      if (character === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
    }

    return {
      index,
      type: token.type,
      value: token.value,
      startLine,
      startColumn,
      isWhitespace: token.type === "plain" && /^\s+$/.test(token.value),
    };
  });
}

export { buildTokenBlueprint };
