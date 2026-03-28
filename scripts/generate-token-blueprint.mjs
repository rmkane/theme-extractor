#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { themes } from "../src/theme/themes.js";
import { defaultLanguageId, getLanguageConfig } from "../src/core/languages.js";
import { buildTokenBlueprint } from "../src/core/token-blueprint.js";
import { getTokenColor } from "../src/theme/theme-mapper.js";
import { normalizeHex } from "../src/core/normalize-hex.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "reference", "token-blueprint.json");

function buildTypeGroups(blueprint) {
  const groups = new Map();

  for (const token of blueprint) {
    if (!groups.has(token.type)) {
      groups.set(token.type, []);
    }
    groups.get(token.type).push(token.value);
  }

  const output = {};
  for (const [type, values] of groups.entries()) {
    const uniqueValues = [...new Set(values)].sort((left, right) =>
      left.localeCompare(right),
    );
    output[type] = {
      count: values.length,
      uniqueValues,
    };
  }

  return output;
}

function buildThemeReverseLookup(theme, blueprint) {
  const colorToExamples = new Map();

  for (const token of blueprint) {
    if (token.isWhitespace) {
      continue;
    }

    const color = normalizeHex(getTokenColor(theme, token.type));
    if (!color) {
      continue;
    }

    if (!colorToExamples.has(color)) {
      colorToExamples.set(color, []);
    }

    const bucket = colorToExamples.get(color);
    const duplicate = bucket.some(
      (entry) => entry.type === token.type && entry.value === token.value,
    );

    if (!duplicate) {
      bucket.push({ type: token.type, value: token.value });
    }
  }

  const reverseLookup = {};
  for (const [color, entries] of colorToExamples.entries()) {
    reverseLookup[color] = entries;
  }

  return reverseLookup;
}

function main() {
  const languageId = defaultLanguageId;
  const { sampleCode } = getLanguageConfig(languageId);
  const blueprint = buildTokenBlueprint(languageId, sampleCode);
  const typeGroups = buildTypeGroups(blueprint);

  const themeReverseLookup = {};
  for (const theme of themes) {
    themeReverseLookup[theme.name] = buildThemeReverseLookup(theme, blueprint);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      languageId,
      sampleCode,
      tokenCount: blueprint.length,
      nonWhitespaceTokenCount: blueprint.filter((token) => !token.isWhitespace)
        .length,
    },
    tokenBlueprint: blueprint,
    groupsByType: typeGroups,
    reverseLookupByTheme: themeReverseLookup,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote blueprint: ${outputPath}`);
}

main();
