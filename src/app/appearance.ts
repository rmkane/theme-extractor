const appearanceStorageKey = 'theme-generator-appearance'
const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)')

function getStoredAppearance(): string {
  return localStorage.getItem(appearanceStorageKey) || 'system'
}

function shouldUseDarkMode(mode: string): boolean {
  return mode === 'dark' || (mode === 'system' && systemColorScheme.matches)
}

function applyAppearance(mode = getStoredAppearance()): void {
  const useDark = shouldUseDarkMode(mode)
  document.documentElement.classList.toggle('dark', useDark)
  document.documentElement.style.colorScheme = useDark ? 'dark' : 'light'
}

function initializeAppearance(selector: HTMLSelectElement): void {
  const mode = getStoredAppearance()
  selector.value = mode
  applyAppearance(mode)

  selector.addEventListener('change', (event) => {
    const target = event.target as HTMLSelectElement
    const nextMode = target.value
    localStorage.setItem(appearanceStorageKey, nextMode)
    applyAppearance(nextMode)
  })

  systemColorScheme.addEventListener('change', () => {
    if (getStoredAppearance() === 'system') {
      applyAppearance('system')
    }
  })
}

export { applyAppearance, getStoredAppearance, initializeAppearance }
