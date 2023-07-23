import { describe, expect, it } from 'vitest';
import { type RawDoc, getSnapshotAtTime } from '../src/core/doc/raw-doc.js';

describe('doc', () => {
  it('getSnapshotAtTime', async () => {
    const doc: Pick<RawDoc, 'snapshots'> = {
      snapshots: [
        {
          code: 'const a = 1;',
          duration: 2,
          transitionTime: 1,
        },
        {
          code: 'const a = 2;',
          duration: 2,
          transitionTime: 1,
        },
      ],
    };

    expect(getSnapshotAtTime(doc, 0)).toEqual([0, 0]);
    expect(getSnapshotAtTime(doc, 1)).toEqual([0, 1]);
    expect(getSnapshotAtTime(doc, 2)).toEqual([1, 0]);
    expect(getSnapshotAtTime(doc, 3)).toEqual([1, 1]);
    expect(getSnapshotAtTime(doc, 4)).toEqual([1, 2]);
    expect(getSnapshotAtTime(doc, 5)).toEqual([1, 2]);
  });
});
