import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSumDuration } from '../core/doc/raw-doc';
import { setRafInterval } from '../utils/raf';
import { type AppSliceState, type AppSliceAction, createAppSlice } from './app';
import {
  type EncodeSliceAction,
  type EncodeSliceState,
  createEncodeSlice,
} from './encode-task';

export function createStore() {
  const useStore = create<
    AppSliceState & AppSliceAction & EncodeSliceState & EncodeSliceAction
  >()(
    persist(
      (...args) => ({
        ...createAppSlice(...args),
        ...createEncodeSlice(...args),
      }),
      {
        name: 'app-store',
        version: 0,
        partialize: (state) => ({
          doc: state.doc,
          currentTime: 0,
          playing: false,
        }),
      },
    ),
  );

  /**
   * start the interval
   */
  setRafInterval((delta) => {
    const { doc, currentTime, playing, setCurrentTime } = useStore.getState();

    if (!playing) {
      return;
    }

    const totalDuration = getSumDuration(doc);
    const newCurrentTime = (currentTime + delta) % totalDuration;

    setCurrentTime(newCurrentTime);
  });

  return useStore;
}

export const useStore = createStore();

Object.assign(window, {
  __useStore: useStore,
});
