interface SvgPlaceholderOptions {
  width: number
  height: number
  fontSize: number
  bgColor: string
  fgColor: string
  useExactSize: boolean
  customText: string
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&apos;';
    }
  });
}

export function buildSvgPlaceholder(options: SvgPlaceholderOptions) {
  const { width, height, fontSize, bgColor, fgColor, useExactSize, customText } = options;
  const text = customText.length > 0 ? customText : `${width}x${height}`;
  const size = useExactSize ? ` width="${width}" height="${height}"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${size}>
  <rect width="${width}" height="${height}" fill="${escapeXml(bgColor)}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize}px" fill="${escapeXml(fgColor)}">${escapeXml(text)}</text>
</svg>`;
}
