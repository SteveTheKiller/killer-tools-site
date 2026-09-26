export function getStringSizeInBytes(text: string) {
  return new TextEncoder().encode(text).buffer.byteLength;
}

export function getTextStatistics(text: string) {
  return {
    charCount: text.length,
    wordCount: text === '' ? 0 : text.split(/\s+/).length,
    lineCount: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
    byteSize: getStringSizeInBytes(text),
  };
}
