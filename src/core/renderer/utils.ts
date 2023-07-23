/**
 * Generate property `font` value
 */
export function getFontProperty({
  fontSize,
  fontFace,
  fontWeight,
  fontStyle,
}: {
  fontSize: number;
  fontFace: string;
  fontWeight?: string | number;
  fontStyle?: string;
}) {
  return `${fontSize}px ${fontWeight ?? ''} ${fontStyle ?? ''} ${fontFace}`;
}
