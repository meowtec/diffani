import dedent from 'dedent';
import { describe, expect, it } from 'vitest';
import { parseCodeToFormattedTokens } from '../src/core/tokenize/index.js';
import { Language } from '../src/core/code-languages/languages.js';

describe('tokenize', () => {
  it('parse code to flat tokens', async () => {
    const code = dedent`
      function foo(param) {
        /**
         * multiline comment
         */
        return param(true, [1, 2]);
      }`;
    const tokens = parseCodeToFormattedTokens(code, Language.typescript);

    await expect(JSON.stringify(tokens, null, '  ')).toMatchFileSnapshot(
      './snapshots/parse-code-0.json',
    );

    let restoreCode = '';

    for (const token of tokens) {
      restoreCode += token.value;
    }
    expect(restoreCode).toBe(code);
  });
});
