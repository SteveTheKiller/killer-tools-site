import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  kebabCase,
  noCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
  trainCase,
} from 'change-case';

const baseConfig = { stripRegexp: /\P{L}+/gu } as any;

export function convertCase(input: string) {
  return [
    { label: 'Lowercase', value: input.toLocaleLowerCase() },
    { label: 'Uppercase', value: input.toLocaleUpperCase() },
    { label: 'Camelcase', value: camelCase(input, baseConfig) },
    { label: 'Capitalcase', value: capitalCase(input, baseConfig) },
    { label: 'Constantcase', value: constantCase(input, baseConfig) },
    { label: 'Dotcase', value: dotCase(input, baseConfig) },
    { label: 'Headercase', value: trainCase(input, baseConfig) },
    { label: 'Nocase', value: noCase(input, baseConfig) },
    { label: 'Paramcase', value: kebabCase(input, baseConfig) },
    { label: 'Pascalcase', value: pascalCase(input, baseConfig) },
    { label: 'Pathcase', value: pathCase(input, baseConfig) },
    { label: 'Sentencecase', value: sentenceCase(input, baseConfig) },
    { label: 'Snakecase', value: snakeCase(input, baseConfig) },
    { label: 'Mockingcase', value: input.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('') },
  ];
}
