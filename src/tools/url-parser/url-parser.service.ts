export function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  }
  catch {
    return undefined;
  }
}
