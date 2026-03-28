const specimenByTheme = {
  darcula: "darcula.svg",
  "deepdark-material-theme": "deepdark-material-theme.svg",
  dracula: "dracula.svg",
  "gruvbox-dark-hard": "gruvbox-dark-hard.svg",
  "jarvis-3d": "jarvis-3d.svg",
  "monokai-night": "monokai-night.svg",
  "monokai-pro-filter-spectrum": "monokai-pro-filter-spectrum.svg",
  nord: "nord.svg",
  "one-dark-pro-night-flat": "one-dark-pro-night-flat.svg",
  "synthwave-84": "synthwave-84.svg",
  "tokyo-night": "tokyo-night.svg",
};

function getSpecimenPath(themeName) {
  const fileName = specimenByTheme[themeName];
  return fileName ? `/specimens/${fileName}` : null;
}

export { specimenByTheme, getSpecimenPath };
