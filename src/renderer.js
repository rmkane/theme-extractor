import { defaultLanguageId } from "./languages.js";
import { tokenizeCode } from "./lexer.js";
import { getTokenColor, getTokenStyle } from "./theme-mapper.js";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

function buildRenderModel(languageId = defaultLanguageId, code = "", theme) {
  return buildTokenBlueprint(languageId, code).map((token) => {
    if (token.type === "string" && token.value.length >= 2) {
      return {
        ...token,
        parts: [
          {
            role: "string-quote",
            value: token.value[0],
            color: getTokenColor(theme, "string-quote"),
          },
          {
            role: "string",
            value: token.value.slice(1, -1),
            color: getTokenColor(theme, "string"),
          },
          {
            role: "string-quote",
            value: token.value[token.value.length - 1],
            color: getTokenColor(theme, "string-quote"),
          },
        ].filter((part) => part.value.length > 0),
        color: null,
        style: getTokenStyle(theme, token.type),
      };
    }

    return {
      ...token,
      color: getTokenColor(theme, token.type),
      style: getTokenStyle(theme, token.type),
      parts: null,
    };
  });
}

function highlightCode(languageId = defaultLanguageId, code = "", theme) {
  return buildRenderModel(languageId, code, theme)
    .map((token) => {
      if (token.parts) {
        return token.parts
          .map((part) => {
            const escaped = escapeHtml(part.value);
            return part.color
              ? `<span style="color: ${part.color}">${escaped}</span>`
              : escaped;
          })
          .join("");
      }

      const color = token.color;
      const style = token.style;
      const escaped = escapeHtml(token.value);

      if (!color && !style) {
        return escaped;
      }

      const css = [];
      if (color) {
        css.push(`color: ${color}`);
      }
      const styleTokens = Array.isArray(style)
        ? style
        : typeof style === "string"
          ? style.split(/\s+/).filter(Boolean)
          : [];
      if (styleTokens.includes("italic")) {
        css.push("font-style: italic");
      }
      if (styleTokens.includes("underline")) {
        css.push("text-decoration: underline");
      }
      if (styleTokens.includes("bold")) {
        css.push("font-weight: bold");
      }

      return `<span style="${css.join("; ")}">${escaped}</span>`;
    })
    .join("");
}

export { buildTokenBlueprint, buildRenderModel, highlightCode };
