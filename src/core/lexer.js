import { defaultLanguageId, getLanguageConfig } from "./languages.js";

function classifyPunctuationToken(value) {
  if (value === "(" || value === ")") {
    return "punctuation-paren";
  }
  if (value === "[" || value === "]") {
    return "punctuation-bracket";
  }
  if (value === "{" || value === "}") {
    return "punctuation-brace";
  }
  if (value === ".") {
    return "punctuation-dot";
  }
  if (value === ";" || value === "," || value === ":") {
    return "punctuation-delimiter";
  }
  return "punctuation";
}

function isTypeLike(type) {
  return type === "type" || type === "primitive-type" || type === "parameter-type";
}

function tokenizeCode(languageId = defaultLanguageId, code = "") {
  const language = getLanguageConfig(languageId);
  const tokenPattern = new RegExp(
    language.tokenPattern.source,
    language.tokenPattern.flags,
  );
  const tokens = [];
  let match;
  let lastIndex = 0;
  let previousSignificant = null;
  let previousType = null;
  let expectDeclarationName = false;
  let parameterDepth = 0;

  while ((match = tokenPattern.exec(code)) !== null) {
    const value = match[0];
    let type = "plain";

    if (/^\s+$/.test(value)) {
      type = "plain";
    } else if (value.startsWith("//") || value.startsWith("/*")) {
      type = "comment";
    } else if (value.startsWith('"') || value.startsWith("'")) {
      type = "string";
    } else if (value.startsWith("@")) {
      type = "annotation";
    } else if (/^\d/.test(value)) {
      type = "number";
    } else if (/^[{}()[\];,.:<>!=+\-*/%&|^~?]$/.test(value)) {
      if (value === "=") {
        type = "operator";
      } else {
        type = classifyPunctuationToken(value);

        if (value === "(" && previousType === "function-call") {
          const nextSlice = code.slice(tokenPattern.lastIndex);
          const nextSignificantMatch = nextSlice.match(/^\s*([^\s])/);
          if (nextSignificantMatch && nextSignificantMatch[1] === ")") {
            type = "punctuation-empty-call-paren";
          }
        }

        if (
          value === ")" &&
          previousSignificant === "(" &&
          previousType === "function-call"
        ) {
          type = "punctuation-empty-call-paren";
        }
      }
    } else if (language.keywordSet.has(value)) {
      if (language.primitiveTypeSet.has(value)) {
        type = "primitive-type";
      } else {
        type = "keyword";
        if (language.declarationKeywordSet.has(value)) {
          expectDeclarationName = true;
        }
      }
    } else if (language.literalSet.has(value)) {
      type = "literal";
    } else {
      const nextSlice = code.slice(tokenPattern.lastIndex);
      const nextSignificantMatch = nextSlice.match(
        /^\s*([A-Za-z_$][\w$]*|[{}()[\];,.:<>!=+\-*/%&|^~?])/,
      );
      const nextSignificant = nextSignificantMatch
        ? nextSignificantMatch[1]
        : "";
      const nextIsIdentifier = /^[A-Za-z_$][\w$]*$/.test(nextSignificant);

      if (expectDeclarationName) {
        type = "class";
        expectDeclarationName = false;
      } else if (
        isTypeLike(previousType) &&
        language.declarationFollowerSet.has(nextSignificant)
      ) {
        type = parameterDepth > 0 ? "parameter" : "variable";
      } else if (parameterDepth > 0 && isTypeLike(previousType)) {
        type = "parameter";
      } else if (language.typeContextKeywordSet.has(previousSignificant)) {
        type = "type";
      } else if (
        nextSignificant === "(" &&
        !language.controlKeywordSet.has(value) &&
        !language.keywordSet.has(value)
      ) {
        type = isTypeLike(previousType) ? "function-declaration" : "function-call";
      } else if (
        parameterDepth > 0 &&
        /^[A-Z][\w$]*$/.test(value) &&
        (nextIsIdentifier || ["[", "<"].includes(nextSignificant))
      ) {
        type = "parameter-type";
      } else if (previousSignificant === "." || nextSignificant === ".") {
        type = "member";
      } else if (
        /^[A-Z][\w$]*$/.test(value) &&
        (nextIsIdentifier || ["[", "<"].includes(nextSignificant))
      ) {
        type = "type";
      } else {
        type = "variable";
      }
    }

    tokens.push({ type, value });
    if (value === "(" && previousType === "function-declaration") {
      parameterDepth += 1;
    } else if (value === ")" && parameterDepth > 0) {
      parameterDepth -= 1;
    }

    if (type !== "plain") {
      previousSignificant = value;
      if (
        !type.startsWith("punctuation") &&
        type !== "operator" &&
        type !== "comment"
      ) {
        previousType = type;
      }
    }

    lastIndex = tokenPattern.lastIndex;
  }

  return tokens;
}

export { tokenizeCode };
