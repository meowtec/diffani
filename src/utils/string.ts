export function isSpaces(text: string): boolean {
  return /^\s*$/.test(text);
}

export function splitToTokens(text: string): string[] {
  return text.split(/\b/);
}

/**
 * Check whether a given string can safely be rendered in a monospace font.
 * That means each of them has the same width
 * @param text
 */
export function checkSafeForMonospaceFont(inputString: string) {
  const safeCharacters = /^[a-zA-Z0-9 `~!@#$%^&*()_\-+=[\]{}|\\;:'",.<>/?]+$/;
  return safeCharacters.test(inputString);
}

export function getLastLine(text: string) {
  const breakIndex = text.lastIndexOf('\n');
  let lastLineIndex = breakIndex + 1;
  if (text[breakIndex + 1] === '\r') {
    lastLineIndex += 1;
  }

  return text.slice(lastLineIndex);
}

export function getLinesCount(text: string): number {
  return text.match(/\n/g)?.length ?? 0;
}
