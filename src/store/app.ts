import { type StateCreator } from 'zustand';
import dedent from 'dedent';
import {
  type RawDoc,
  type DocSnapshot,
  getSumDuration,
} from '../core/doc/raw-doc';
import { Language } from '../core/code-languages/languages';
import { clamp } from '../utils/number';
import { removeArrayAt, updateArrayAt } from '../utils/array';

export interface AppSliceState {
  doc: RawDoc;

  currentTime: number;

  playing: boolean;
}

export const initialState: AppSliceState = {
  doc: {
    language: Language.jsx,
    fontSize: 30,
    lineHeight: 42,
    width: 1280,
    height: 720,
    theme: 'default',
    padding: {
      top: 0,
      left: 50,
      bottom: 0,
    },
    snapshots: [
      {
        id: '1',
        duration: 3000,
        transitionTime: 1000,
        code: dedent`
          export function Demo({ active }) {
            return (
              <div
                className={\`demo $${
                  /* workaround for bug of `dedent` */ ''
                }{active ? 'active' : ''}\`}
              ></div>
            )
          }
        `,
      },
      {
        id: '2',
        duration: 3000,
        transitionTime: 1000,
        code: dedent`
          import clsx from 'clsx'
          export function Demo({ active }) {
            return (
              <div
              className={\`demo $${
                /* workaround for bug of `dedent` */ ''
              }{active ? 'active' : ''}\`}
              ></div>
            )
          }
      `,
      },
      {
        id: '3',
        duration: 3000,
        transitionTime: 1000,
        code: dedent`
          import clsx from 'clsx'
          export function Demo({ active }) {
            return (
              <div
                className={clsx('demo', active && 'active')}
              ></div>
            )
          }
      `,
      },
    ],
  },

  currentTime: 0,

  playing: false,
};

export interface AppSliceAction {
  updateSnapshot: (index: number, snapshot: DocSnapshot) => void;

  updateDocProperties: (doc: Omit<RawDoc, 'snapshots'>) => void;

  setCurrentTime: (currentTime: number) => void;

  gotoSnapshot: (index: number) => void;

  duplicateSnapshot: (index: number) => void;

  deleteSnapshot: (index: number) => void;

  setPlaying: (playing: boolean) => void;
}

function reviseStateCurrentTime<
  T extends Pick<AppSliceState, 'doc' | 'currentTime'>
>(state: T): T {
  const totalDuration = getSumDuration(state.doc);
  return {
    ...state,
    currentTime: clamp(state.currentTime, 0, totalDuration),
  };
}

export const createAppSlice: StateCreator<
  AppSliceState & AppSliceAction,
  [],
  [],
  AppSliceState & AppSliceAction
> = (set, get) => ({
  ...initialState,

  updateSnapshot(index, snapshot) {
    set((state) => {
      const snapshots = updateArrayAt(state.doc.snapshots, index, snapshot);
      const newDoc = {
        ...state.doc,
        snapshots,
      };

      return reviseStateCurrentTime({
        doc: newDoc,
        currentTime: state.currentTime,
      });
    });
  },

  updateDocProperties(doc) {
    set((state) => ({
      doc: {
        ...state.doc,
        ...doc,
      },
    }));
  },

  setCurrentTime(currentTime) {
    const clampCurrentTime = clamp(currentTime, 0, getSumDuration(get().doc));
    set((state) =>
      reviseStateCurrentTime({
        currentTime: clampCurrentTime,
        doc: state.doc,
      })
    );
  },

  gotoSnapshot(index) {
    set((state) => {
      const newCurrentTime = getSumDuration(state.doc, index);

      return reviseStateCurrentTime({
        currentTime: newCurrentTime,
        doc: state.doc,
      });
    });
  },

  duplicateSnapshot(index) {
    set((state) => {
      const snapshot = state.doc.snapshots[index];
      const newSnapshot = {
        ...snapshot,
        id: String(Date.now()),
      };
      const snapshots = updateArrayAt(
        state.doc.snapshots,
        index + 1,
        newSnapshot
      );
      const newDoc = {
        ...state.doc,
        snapshots,
      };
      const newCurrentTime = getSumDuration(state.doc, index + 1);

      return reviseStateCurrentTime({
        doc: newDoc,
        playing: false,
        currentTime: newCurrentTime,
      });
    });
  },

  deleteSnapshot(index) {
    set((state) => {
      const snapshots = removeArrayAt(state.doc.snapshots, index);

      const newDoc = {
        ...state.doc,
        snapshots,
      };

      return reviseStateCurrentTime({
        doc: newDoc,
        currentTime: state.currentTime,
      });
    });
  },

  setPlaying(playing) {
    set({ playing });
  },
});
