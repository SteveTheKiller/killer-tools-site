declare module 'iarna-toml-esm' {
  export const parse: (toml: string) => unknown;
  export const stringify: (value: unknown) => string;
}
