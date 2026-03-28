import { themes } from "./themes.js";
import { defaultLanguageId } from "./languages.js";
import { highlightCode } from "./renderer.js";

function formatThemeName(name) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderTheme(languageId = defaultLanguageId, themeName, code) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const theme = themes.find((entry) => entry.name === themeName);

  if (!theme) {
    return;
  }

  const themeDiv = document.createElement("div");
  themeDiv.className = "flex flex-col gap-2";

  const title = document.createElement("div");
  title.className = "text-2xl capitalize text-zinc-900 dark:text-zinc-100";
  title.textContent = formatThemeName(theme.name);

  if (theme.semanticTheme) {
    title.textContent += ` (${theme.semanticTheme})`;
  }

  const previewLabel = document.createElement("label");
  previewLabel.className = "block text-sm text-zinc-600 dark:text-zinc-300";
  previewLabel.textContent = "Preview";

  const codeSample = document.createElement("pre");
  codeSample.className =
    "overflow-x-auto whitespace-pre-wrap rounded-lg border border-zinc-700 p-4 text-base leading-6";
  codeSample.style.backgroundColor = theme.colors.background || "#2e2e2e";
  codeSample.style.color = theme.colors.plain || "#ffffff";
  codeSample.innerHTML = highlightCode(languageId, code, theme);

  themeDiv.appendChild(title);
  themeDiv.appendChild(previewLabel);
  themeDiv.appendChild(codeSample);
  app.appendChild(themeDiv);
}

export { formatThemeName, renderTheme };