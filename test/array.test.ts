import { describe, expect, it } from 'vitest';
import { createArray } from '../src/utils/array';

describe('array', () => {
  it('createArray', () => {
    expect(createArray(4, (i) => i * i)).toEqual([0, 1, 4, 9]);
  });
});
