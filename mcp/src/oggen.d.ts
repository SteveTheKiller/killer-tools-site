declare module '@it-tools/oggen' {
  export function generateMeta(metadata: Record<string, unknown>, options?: { generateTwitterCompatibleMeta?: boolean }): string;
}
