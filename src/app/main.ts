import type { LanguageId } from '@/core/languages'

import { initializeAppearance } from '@/app/appearance'
import { renderTheme } from '@/app/preview'
import '@/app/style.css'
import { defaultLanguageId, getLanguageConfig, getLanguageOptions } from '@/core/languages'
import { getSpecimenPath } from '@/theme/specimens'
import { themes } from '@/theme/themes'

const appearanceSelector = document.getElementById('appearance-selector') as HTMLSelectElement
const themeSelector = document.getElementById('theme-selector') as HTMLSelectElement
const languageSelector = document.getElementById('language-selector') as HTMLSelectElement
const codeInput = document.getElementById('code-input') as HTMLTextAreaElement
const specimenImage = document.getElementById('specimen-image') as HTMLImageElement | null

function populateThemeDropdown(): void {
  themeSelector.innerHTML = ''
  themes.forEach((theme) => {
    const option = document.createElement('option')
    option.value = theme.name
    option.textContent = theme.name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase())
    themeSelector.appendChild(option)
  })
}

function populateLanguageDropdown(): void {
  languageSelector.innerHTML = ''
  getLanguageOptions().forEach((language) => {
    const option = document.createElement('option')
    option.value = language.id
    option.textContent = language.label
    languageSelector.appendChild(option)
  })
}

function updateSpecimen(themeName: string): void {
  if (!specimenImage) {
    return
  }
  const specimenPath = getSpecimenPath(themeName)
  if (!specimenPath) {
    specimenImage.removeAttribute('src')
    specimenImage.alt = `No specimen mapped for ${themeName}`
    return
  }
  specimenImage.src = specimenPath
  specimenImage.alt = `${themeName} specimen`
}

function updatePreview(): void {
  const themeName = themeSelector.value
  const languageId = languageSelector.value as LanguageId
  renderTheme(languageId, themeName, codeInput.value)
  updateSpecimen(themeName)
}

populateThemeDropdown()
populateLanguageDropdown()
initializeAppearance(appearanceSelector)

languageSelector.value = defaultLanguageId
codeInput.value = getLanguageConfig(defaultLanguageId).sampleCode

themeSelector.addEventListener('change', (event) => {
  const themeName = (event.target as HTMLSelectElement).value
  renderTheme(languageSelector.value as LanguageId, themeName, codeInput.value)
  updateSpecimen(themeName)
})

languageSelector.addEventListener('change', (event) => {
  const languageId = (event.target as HTMLSelectElement).value as LanguageId
  codeInput.value = getLanguageConfig(languageId).sampleCode
  updatePreview()
})

codeInput.addEventListener('input', updatePreview)
codeInput.addEventListener('paste', () => {
  requestAnimationFrame(updatePreview)
})

themeSelector.value = themes[0]!.name
updatePreview()
