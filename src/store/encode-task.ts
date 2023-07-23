import { type StateCreator } from 'zustand';
import { VideoEncoder } from '../core/video-encode';
import { type AppSliceState } from './app';

export enum EncodeStatus {
  Encoding = 'encoding',
  Done = 'done',
  Error = 'error',
}

export interface EncodeSliceState {
  encodeState:
    | {
        status: EncodeStatus.Encoding;
        progress: number;
        encoder: VideoEncoder;
      }
    | {
        status: EncodeStatus.Done;
        result: Blob;
      }
    | {
        status: EncodeStatus.Error;
        error: Error;
      }
    | null;
}

export interface EncodeSliceAction {
  startEncodeTask: () => void;
  abortEncodeTask: () => void;
}

export const createEncodeSlice: StateCreator<
  AppSliceState & EncodeSliceState & EncodeSliceAction,
  [],
  [],
  EncodeSliceState & EncodeSliceAction
> = (set, get) => ({
  encodeState: null,

  startEncodeTask: () => {
    const { doc, abortEncodeTask } = get();
    abortEncodeTask();
    const encoder = new VideoEncoder(doc, {
      onProgress: (progress) => {
        set((state) => {
          if (
            state.encodeState?.status !== EncodeStatus.Encoding ||
            state.encodeState.encoder !== encoder
          ) {
            return {};
          }

          return {
            encodeState: {
              progress,
              status: EncodeStatus.Encoding,
              encoder,
            },
          };
        });
      },
    });

    encoder
      .encode()
      .then((result) => {
        set({ encodeState: { status: EncodeStatus.Done, result } });
      })
      .catch((err) => {
        if (err?.message === 'Aborted') return;

        set({ encodeState: { status: EncodeStatus.Error, error: err } });
      });

    set({
      encodeState: { status: EncodeStatus.Encoding, progress: 0, encoder },
    });
  },

  abortEncodeTask: () => {
    set((state) => {
      const { encodeState: encode } = state;
      if (encode?.status === EncodeStatus.Encoding) {
        encode.encoder.abort();
      }

      return {
        encodeState: null,
      };
    });
  },
});
