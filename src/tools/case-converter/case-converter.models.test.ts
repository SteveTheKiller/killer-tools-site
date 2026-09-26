import { describe, expect, it } from 'vitest';
import { convertCase } from './case-converter.models';

describe('case converter shared logic', () => {
  it('keeps the website formats available to other callers', () => {
    expect(convertCase('hello world')).toEqual(expect.arrayContaining([
      { label: 'Camelcase', value: 'helloWorld' },
      { label: 'Headercase', value: 'Hello-World' },
      { label: 'Snakecase', value: 'hello_world' },
      { label: 'Mockingcase', value: 'HeLlO WoRlD' },
    ]));
    expect(convertCase('hello world')).toHaveLength(14);
  });
});
