import { easeQuadInOut } from 'd3-ease';
import { clamp01 } from '../../utils/number';
import { type Position } from '../../types/base';

export interface TransitionState {
  /** 0 - 1 */
  outProgress: number;
  /** 0 - 1 */
  inProgress: number;
  /** 0 - 1 */
  moveProgress: number;
}

export interface TransitionConfig {
  outDurationProportion: number;
  moveDurationProportion: number;
  inDurationProportion: number;
  ease: (progress: number) => number;
}

const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  outDurationProportion: 0.5,
  moveDurationProportion: 1.0,
  inDurationProportion: 0.5,
  ease: easeQuadInOut,
};

/**
 * The transition is divided into three steps:
 * 1. The deleted contents fade away.
 * 2. The unchanged contents move from their original positions to target positions.
 * 3. The added contents fade in.
 * There may be overlapping in time between adjacent steps.
 *
 * @param totalDuration
 * @param currentTime
 */
export function computeTransitionState(
  progress: number,
  config: TransitionConfig = DEFAULT_TRANSITION_CONFIG
): TransitionState {
  const MOVE_START_PROPORTION =
    (1 - config.outDurationProportion - config.inDurationProportion) / 2 +
    config.outDurationProportion -
    config.moveDurationProportion / 2;

  const clampProgressAndEase = (progress: number) =>
    config.ease(clamp01(progress));

  return {
    outProgress: clampProgressAndEase(progress / config.outDurationProportion),
    inProgress: clampProgressAndEase(
      (progress - (1 - config.inDurationProportion)) /
        config.inDurationProportion
    ),
    moveProgress: clampProgressAndEase(
      (progress - MOVE_START_PROPORTION) / config.moveDurationProportion
    ),
  };
}

export function applyTransition(progress: number, from: number, to: number) {
  return from + (to - from) * progress;
}

export function applyPositionTransition(
  progress: number,
  from: Position,
  to: Position
): Position {
  return {
    x: applyTransition(progress, from.x, to.x),
    y: applyTransition(progress, from.y, to.y),
  };
}
