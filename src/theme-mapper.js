function getTokenColor(theme, type) {
  switch (type) {
    case "comment":
      return theme.colors.comment;
    case "string":
      return theme.colors.string;
    case "string-quote":
      return theme.colors.stringQuote || theme.colors.string;
    case "number":
      return theme.colors.number || theme.colors.value;
    case "literal":
      return theme.colors.literal || theme.colors.value;
    case "keyword":
      return theme.colors.reservedWord;
    case "primitive-type":
      return (
        theme.colors.primitiveType ||
        theme.colors.typeName ||
        theme.colors.reservedWord
      );
    case "parameter-type":
      return (
        theme.colors.parameterType ||
        theme.colors.typeName ||
        theme.colors.className ||
        theme.colors.reservedWord
      );
    case "type":
      return (
        theme.colors.typeName ||
        theme.colors.className ||
        theme.colors.reservedWord
      );
    case "class":
    case "annotation":
      return theme.colors.className;
    case "function-declaration":
      return (
        theme.colors.functionDeclaration ||
        theme.colors.functionName ||
        theme.colors.className
      );
    case "function-call":
      return (
        theme.colors.functionCall ||
        theme.colors.functionName ||
        theme.colors.className
      );
    case "function":
      return (
        theme.colors.functionName ||
        theme.colors.functionDeclaration ||
        theme.colors.functionCall ||
        theme.colors.className
      );
    case "parameter":
      return theme.colors.parameter || theme.colors.plain || null;
    case "variable":
      return theme.colors.variable || theme.colors.plain || null;
    case "member":
      return (
        theme.colors.member ||
        theme.colors.variable ||
        theme.colors.typeName ||
        theme.colors.plain ||
        null
      );
    case "operator":
      return theme.colors.operator || theme.colors.plain || null;
    case "punctuation-paren":
      return (
        theme.colors.punctuationParen ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation-empty-call-paren":
      return (
        theme.colors.punctuationEmptyCallParen ||
        theme.colors.punctuationParen ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation-brace":
      return (
        theme.colors.punctuationBrace ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation-delimiter":
      return (
        theme.colors.punctuationDelimiter ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation-bracket":
      return (
        theme.colors.punctuationBracket ||
        theme.colors.punctuationParen ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation-dot":
      return (
        theme.colors.punctuationDot ||
        theme.colors.punctuationDelimiter ||
        theme.colors.punctuation ||
        theme.colors.plain ||
        null
      );
    case "punctuation":
      return theme.colors.punctuation || theme.colors.plain || null;
    case "plain":
      return theme.colors.plain || null;
    default:
      return null;
  }
}

function getTokenStyle(theme, type) {
  return (theme.styles && theme.styles[type]) || null;
}

export { getTokenColor, getTokenStyle };
