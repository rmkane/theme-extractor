function normalizeHex(input) {
  if (!input) {
    return null;
  }
  const hex = input.toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(hex)) {
    return `#${hex
      .slice(1)
      .split("")
      .map((character) => character + character)
      .join("")}`;
  }
  if (/^#[0-9A-F]{8}$/.test(hex)) {
    return hex.slice(0, 7);
  }
  return hex;
}

export { normalizeHex };
