import { diffArrays } from 'diff';
import { isTokenSpaces, type Token } from '../tokenize/index';

export interface TokenDiff {
  /**
   * Index in the `from` token list
   * Be `null` when the token is added
   */
  leftIndex: number | null;
  /**
   * Index in the `to` token list
   * Be `null` when the token is deleted
   */
  rightIndex: number | null;
}
export interface MovMutation {
  left: Token[];
  right: Token[];
  diffs: TokenDiff[];
}

export function createMutation(left: Token[], right: Token[]): MovMutation {
  const diffResult = diffArrays(left, right, {
    comparator: (left, right) => {
      if (isTokenSpaces(left) && isTokenSpaces(right)) {
        return true;
      }

      return left.value === right.value;
    },
  });

  const diffs: TokenDiff[] = [];

  let leftIndex = 0;
  let rightIndex = 0;

  for (const group of diffResult) {
    const count = group.count ?? 0;
    const existedInLeft = group.added == null;
    const existedInRight = group.removed == null;

    diffs.push(
      ...group.value.map((token, idx) => ({
        leftIndex: existedInLeft ? leftIndex + idx : null,
        rightIndex: existedInRight ? rightIndex + idx : null,
      }))
    );

    if (existedInLeft) {
      leftIndex += count;
    }

    if (existedInRight) {
      rightIndex += count;
    }
  }

  return {
    left,
    right,
    diffs,
  };
}
