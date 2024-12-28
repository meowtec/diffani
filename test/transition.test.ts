import { describe, expect, it } from 'vitest';
import { type Token } from '../src/core/tokenize/index.js';
import { createMutation } from '../src/core/transition/mutation.js';
import {
  computeTransitionState,
  type TransitionConfig,
  type TransitionState,
} from '../src/core/transition/transition.js';

function roundTransition(transition: TransitionState) {
  const roundFloat = (value: number) =>
    Math.round(value * 1000000 + 0.00000001) / 1000000;

  return {
    outProgress: roundFloat(transition.outProgress),
    inProgress: roundFloat(transition.inProgress),
    moveProgress: roundFloat(transition.moveProgress),
  };
}

const transitionConfig: TransitionConfig = {
  outDurationProportion: 0.3,
  moveDurationProportion: 0.4,
  inDurationProportion: 0.5,
  ease: (x) => x,
};

describe('transition', () => {
  it('create mutation from two tokens list', () => {
    const leftTokens: Token[] = [
      {
        value: 'hello',
        types: [],
      },
      {
        value: ' ',
        types: [],
      },
      {
        value: 'new',
        types: [],
      },
      {
        value: ' ',
        types: [],
      },
      {
        value: 'world',
        types: [],
      },
    ];

    const rightTokens: Token[] = [
      {
        value: 'hello',
        types: [],
      },
      {
        value: ' ',
        types: [],
      },
      {
        value: 'world',
        types: [],
      },
      {
        value: '!',
        types: [],
      },
    ];

    // 'hello new world' -> 'hello world!'
    const transition = createMutation(leftTokens, rightTokens);

    expect(transition).toEqual({
      diffs: [
        {
          leftIndex: 0,
          rightIndex: 0,
        },
        {
          leftIndex: 1,
          rightIndex: 1,
        },
        {
          leftIndex: 2,
          rightIndex: null,
        },
        {
          leftIndex: 3,
          rightIndex: null,
        },
        {
          leftIndex: 4,
          rightIndex: 2,
        },
        {
          leftIndex: null,
          rightIndex: 3,
        },
      ],
      left: leftTokens,
      right: rightTokens,
    });
  });

  it('transition calculation', () => {
    expect(
      roundTransition(computeTransitionState(0, transitionConfig)),
    ).toEqual({
      outProgress: 0,
      inProgress: 0,
      moveProgress: 0,
    });
    expect(
      roundTransition(computeTransitionState(0.1, transitionConfig)),
    ).toEqual(
      roundTransition({
        outProgress: 1 / 3,
        inProgress: 0,
        moveProgress: 0,
      }),
    );
    expect(
      roundTransition(computeTransitionState(0.2, transitionConfig)),
    ).toEqual(
      roundTransition({
        outProgress: 2 / 3,
        inProgress: 0,
        moveProgress: 0,
      }),
    );
    expect(
      roundTransition(computeTransitionState(0.3, transitionConfig)),
    ).toEqual(
      roundTransition({
        outProgress: 1,
        inProgress: 0,
        moveProgress: 1 / 4,
      }),
    );
    expect(
      roundTransition(computeTransitionState(0.5, transitionConfig)),
    ).toEqual({
      outProgress: 1,
      inProgress: 0,
      moveProgress: 3 / 4,
    });
    expect(
      roundTransition(computeTransitionState(0.6, transitionConfig)),
    ).toEqual({
      outProgress: 1,
      inProgress: 1 / 5,
      moveProgress: 1,
    });
    expect(
      roundTransition(computeTransitionState(0.7, transitionConfig)),
    ).toEqual({
      outProgress: 1,
      inProgress: 2 / 5,
      moveProgress: 1,
    });
    expect(roundTransition(computeTransitionState(1))).toEqual({
      outProgress: 1,
      inProgress: 1,
      moveProgress: 1,
    });
  });
});
