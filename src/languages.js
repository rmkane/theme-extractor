import { sampleCode } from "./sample-code.js";

const languages = {
  java: {
    label: "Java",
    sampleCode,
    keywords: [
      "abstract",
      "assert",
      "boolean",
      "break",
      "byte",
      "case",
      "catch",
      "char",
      "class",
      "const",
      "continue",
      "default",
      "do",
      "double",
      "else",
      "enum",
      "extends",
      "final",
      "finally",
      "float",
      "for",
      "goto",
      "if",
      "implements",
      "import",
      "instanceof",
      "int",
      "interface",
      "long",
      "native",
      "new",
      "package",
      "private",
      "protected",
      "public",
      "return",
      "short",
      "static",
      "strictfp",
      "super",
      "switch",
      "synchronized",
      "this",
      "throw",
      "throws",
      "transient",
      "try",
      "void",
      "volatile",
      "while",
      "var",
      "record",
      "sealed",
      "permits",
      "non-sealed",
      "yield",
    ],
    literals: ["true", "false", "null"],
    primitiveTypes: [
      "byte",
      "short",
      "int",
      "long",
      "float",
      "double",
      "boolean",
      "char",
      "void",
    ],
    declarationKeywords: ["class", "interface", "enum", "record"],
    typeContextKeywords: [
      "new",
      "extends",
      "implements",
      "throws",
      "throw",
      "catch",
      "instanceof",
    ],
    controlKeywords: [
      "if",
      "for",
      "while",
      "switch",
      "catch",
      "return",
      "new",
      "throw",
      "throws",
    ],
    declarationFollowers: ["=", ";", ",", ")", "["],
    tokenPattern:
      /\/\*[\s\S]*?\*\/|\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@[A-Za-z_$][\w$]*|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[dDfFlL]?\b|\b[A-Za-z_$][\w$]*\b|[{}()[\];,.:<>!=+\-*/%&|^~?]|\s+|./gm,
  },
};

const defaultLanguageId = "java";
const cachedLanguageConfigs = new Map();

function createRuntimeConfig(language) {
  return {
    ...language,
    keywordSet: new Set(language.keywords),
    literalSet: new Set(language.literals),
    primitiveTypeSet: new Set(language.primitiveTypes),
    declarationKeywordSet: new Set(language.declarationKeywords),
    typeContextKeywordSet: new Set(language.typeContextKeywords),
    controlKeywordSet: new Set(language.controlKeywords),
    declarationFollowerSet: new Set(language.declarationFollowers),
  };
}

function getLanguageConfig(languageId = defaultLanguageId) {
  const language = languages[languageId];
  if (!language) {
    throw new Error(`Unsupported language: ${languageId}`);
  }
  if (!cachedLanguageConfigs.has(languageId)) {
    cachedLanguageConfigs.set(languageId, createRuntimeConfig(language));
  }
  return cachedLanguageConfigs.get(languageId);
}

function getLanguageOptions() {
  return Object.entries(languages).map(([id, language]) => ({
    id,
    label: language.label,
  }));
}

export { languages, defaultLanguageId, getLanguageConfig, getLanguageOptions };
