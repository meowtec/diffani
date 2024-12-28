import Prism, { type TokenStream } from 'prismjs';
import memoize from 'memoizerific';
import { type Language } from '../code-languages/languages';
import { isSpaces, splitToTokens } from '../../utils/string';

export interface BaseToken {
  value: string;
  types: string[];
}
export type Token = BaseToken;

/**
 * Recursive map prism tokens tree to a flat token array
 * Notice that currently `index` `line` `col ` has not been initialed, we will do it later
 * @param tokens The TokenStream produced by prism
 * @param types The parent token types
 * @returns
 */
function flattenPrismTokens(
  tokens: TokenStream,
  types?: string[],
): BaseToken[] {
  if (Array.isArray(tokens)) {
    return tokens.flatMap((token) => flattenPrismTokens(token, types));
  }

  if (typeof tokens === 'string') {
    return [
      {
        value: tokens,
        types: [],
      },
    ];
  }

  const joinedTypes = types?.includes(tokens.type)
    ? types
    : [...(types ?? []), tokens.type];

  if (typeof tokens.content === 'string') {
    return [
      {
        value: tokens.content,
        types: joinedTypes,
      },
    ];
  }

  return flattenPrismTokens(tokens.content, joinedTypes);
}

/**
 * Create `Token[]` from `BaseToken[]`
 *
 * - Add `line` and `col` property
 * - Split token if has space inside
 * @param baseTokens
 * @returns
 */
function processTokensWithAttrs(baseTokens: BaseToken[]) {
  const tokens: Token[] = [];

  for (const token of baseTokens) {
    /**
     * In Prism, there are certain tokens that are not actually individual tokens;
     * Instead, they consist of a sequence of tokens with the same format, such as comments.
     * We should split them into real tokens, `\b` is good for that - it break a string into multiple parts at each word boundary
     * Example:
     * "Hello, world!" -> ["Hello", ", ", "world", "!"]
     */
    const subTokens = splitToTokens(token.value);

    for (const subToken of subTokens) {
      tokens.push({
        ...token,
        value: subToken,
      });
    }
  }

  return tokens;
}

export function parseCodeToFormattedTokens(code: string, language: Language) {
  const baseTokens = flattenPrismTokens(
    Prism.tokenize(code, Prism.languages[language]),
  );

  return processTokensWithAttrs(baseTokens);
}

export function isTokenSpaces(token: Token) {
  return isSpaces(token.value);
}

export const memoizedParseCodeToFormattedTokens = memoize(256)(
  parseCodeToFormattedTokens,
);
