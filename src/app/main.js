import "./style.css";
import { initializeAppearance } from "./appearance.js";
import {
  defaultLanguageId,
  getLanguageConfig,
  getLanguageOptions,
} from "../core/languages.js";
import { renderTheme } from "./preview.js";
import { themes } from "../theme/themes.js";
import { getSpecimenPath } from "../theme/specimens.js";

const appearanceSelector = document.getElementById("appearance-selector");
const themeSelector = document.getElementById("theme-selector");
const languageSelector = document.getElementById("language-selector");
const codeInput = document.getElementById("code-input");
const specimenImage = document.getElementById("specimen-image");

function populateThemeDropdown() {
  themeSelector.innerHTML = "";
  themes.forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme.name;
    option.textContent = theme.name
      .replace(/-/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
    themeSelector.appendChild(option);
  });
}

function populateLanguageDropdown() {
  languageSelector.innerHTML = "";
  getLanguageOptions().forEach((language) => {
    const option = document.createElement("option");
    option.value = language.id;
    option.textContent = language.label;
    languageSelector.appendChild(option);
  });
}

function updateSpecimen(themeName) {
  if (!specimenImage) {
    return;
  }
  const specimenPath = getSpecimenPath(themeName);
  if (!specimenPath) {
    specimenImage.removeAttribute("src");
    specimenImage.alt = `No specimen mapped for ${themeName}`;
    return;
  }
  specimenImage.src = specimenPath;
  specimenImage.alt = `${themeName} specimen`;
}

function updatePreview() {
  const themeName = themeSelector.value;
  const languageId = languageSelector.value;
  renderTheme(languageId, themeName, codeInput.value);
  updateSpecimen(themeName);
}

populateThemeDropdown();
populateLanguageDropdown();
initializeAppearance(appearanceSelector);

languageSelector.value = defaultLanguageId;
codeInput.value = getLanguageConfig(defaultLanguageId).sampleCode;

themeSelector.addEventListener("change", (event) => {
  const themeName = event.target.value;
  renderTheme(languageSelector.value, themeName, codeInput.value);
  updateSpecimen(themeName);
});

languageSelector.addEventListener("change", (event) => {
  const languageId = event.target.value;
  codeInput.value = getLanguageConfig(languageId).sampleCode;
  updatePreview();
});

codeInput.addEventListener("input", updatePreview);
codeInput.addEventListener("paste", () => {
  requestAnimationFrame(updatePreview);
});

themeSelector.value = themes[0].name;
updatePreview();
