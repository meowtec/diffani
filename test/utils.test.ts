import { describe, expect, it } from 'vitest';
import { checkSafeForMonospaceFont, getLastLine } from '../src/utils/string.js';

describe('utils', () => {
  it('checkSafeForMonospaceFont', () => {
    expect(
      checkSafeForMonospaceFont(
        '1234567890 -=`~qwertyuiop[]asdfghjkl;\'zxcvbnm,./|{}":?><!@#$%^&*()_+'
      )
    ).toBe(true);

    expect(checkSafeForMonospaceFont('汉')).toBe(false);
    expect(checkSafeForMonospaceFont('，')).toBe(false);
  });

  it('getLastLine', () => {
    expect(getLastLine('')).toBe('');
    expect(getLastLine('hello')).toBe('hello');
    expect(getLastLine('hello\nworld')).toBe('world');
    expect(getLastLine('hi!\nhello\nworld')).toBe('world');
    expect(getLastLine('hello\n\rworld')).toBe('world');
  });
});
