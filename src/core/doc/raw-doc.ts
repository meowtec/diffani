import { type ThemeName } from '../theme/index';
import { type Language } from '../code-languages/languages';

export interface DocSnapshot {
  id: string;
  code: string;
  /**
   * The duration of this snapshot in ms
   * Should be greater or equal to transitionTime
   */
  duration: number;
  transitionTime: number;
}

export interface DocPadding {
  top: number;
  left: number;
  bottom: number;
}

export interface RawDoc {
  language: Language;
  snapshots: DocSnapshot[];
  fontSize: number;
  lineHeight: number;
  width: number;
  height: number;
  theme: ThemeName;
  padding: DocPadding;
}

export function getSnapshotAtTime(
  movie: Pick<RawDoc, 'snapshots'>,
  time: number
): [snapshotIndex: number, offsetTime: number] {
  const { snapshots } = movie;
  let startTime = 0;

  for (let i = 0; i < snapshots.length; i++) {
    const snapshot = snapshots[i];
    const endTime = startTime + snapshot.duration;
    if (endTime > time) {
      return [i, time - startTime];
    }
    startTime = endTime;
  }

  const lastIndex = snapshots.length - 1;

  return [lastIndex, snapshots[lastIndex]?.duration ?? 0];
}

/**
 * The last transitionTime of the snapshot duration is used for transition
 * @param snapshot
 * @param offsetTime
 * @returns
 */
export function isOffsetTimeInTransition(
  snapshot: DocSnapshot,
  offsetTime: number
) {
  return offsetTime > snapshot.duration - snapshot.transitionTime;
}

/**
 * Get the video total duration in ms
 * @param doc
 * @returns
 */
export function getSumDuration(doc: RawDoc, beforeIndex?: number) {
  const { snapshots } = doc;
  return snapshots.reduce((sum, snapshot, index) => {
    if (beforeIndex !== undefined && index >= beforeIndex) {
      return sum;
    }
    return sum + snapshot.duration;
  }, 0);
}
