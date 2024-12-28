import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';
import { type DocSnapshot } from '../../../../core/doc/raw-doc';
import { useStore } from '../../../../store';
import iconMinus from '../../../../assets/icons/minus.svg';
import styles from './index.module.scss';
import Icon from '../../../icon';

interface SnapshotProps {
  deletable: boolean;
  index: number;
  active: boolean;
  progress: number;
  snapshot: DocSnapshot;
}

export function Snapshot({
  deletable,
  index,
  progress,
  active,
}: SnapshotProps) {
  const { gotoSnapshot, deleteSnapshot, playing } = useStore(
    useShallow((state) => ({
      playing: state.playing,
      gotoSnapshot: state.gotoSnapshot,
      deleteSnapshot: state.deleteSnapshot,
    })),
  );

  return (
    <div className={styles.snapshotWrapper}>
      <button
        type="button"
        className={clsx(styles.snapshot, active && styles.active)}
        onClick={() => {
          gotoSnapshot(index);
        }}
      >
        {
          <span
            className={styles.progress}
            style={{ width: `${(playing ? progress : 1) * 100}%` }}
          />
        }
        #{index}
      </button>

      {deletable && (
        <button
          type="button"
          className={styles.delete}
          title="delete"
          onClick={() => {
            deleteSnapshot(index);
          }}
        >
          <Icon name={iconMinus} />
        </button>
      )}
    </div>
  );
}
