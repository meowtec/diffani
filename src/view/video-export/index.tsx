import { useShallow } from 'zustand/shallow';
import { useStore } from '../../store';
import downloadIcon from '../../assets/icons/download.svg';
import Icon from '../icon';
import { EncodeStatus } from '../../store/encode-task';
import { downloadBlob } from '../../utils/download';
import styles from './index.module.scss';

export function VideoExport() {
  const { encodeState, startEncodeTask, abortEncodeTask } = useStore(
    useShallow((state) => ({
      encodeState: state.encodeState,
      startEncodeTask: state.startEncodeTask,
      abortEncodeTask: state.abortEncodeTask,
    })),
  );

  const handleClick = () => {
    if (encodeState == null || encodeState.status === EncodeStatus.Error) {
      startEncodeTask();
    } else if (encodeState.status === EncodeStatus.Encoding) {
      abortEncodeTask();
    } else if (encodeState.status === EncodeStatus.Done) {
      downloadBlob(encodeState.result, `video-${Date.now()}.webm`);
      abortEncodeTask();
    }
  };

  const progress =
    encodeState?.status === EncodeStatus.Encoding
      ? encodeState.progress
      : encodeState?.status === EncodeStatus.Done
        ? 1
        : 0;

  const progressPercent = `${Math.round(progress * 100)}%`;

  return (
    <button
      type="button"
      className={styles.export}
      title={
        encodeState?.status === EncodeStatus.Encoding ? 'Click to cancel' : ''
      }
      onClick={handleClick}
    >
      <Icon name={downloadIcon} className={styles.exportIcon} />

      <span className={styles.exportText}>
        {encodeState == null
          ? 'Export'
          : encodeState.status === EncodeStatus.Done
            ? 'Save'
            : encodeState.status === EncodeStatus.Encoding
              ? progressPercent
              : 'Re-Export'}
      </span>

      <span
        className={styles.progress}
        style={{
          width: progressPercent,
        }}
      />
    </button>
  );
}
