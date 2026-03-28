(function () {
  const storageKey = "theme-generator-appearance";
  const savedMode = localStorage.getItem(storageKey) || "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = savedMode === "dark" || (savedMode === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", useDark);
  document.documentElement.style.colorScheme = useDark ? "dark" : "light";
})();