import clsx from 'clsx';
import addIcon from '../../../assets/icons/add.svg';
import { clamp } from '../../../utils/number';
import { type DocSnapshot } from '../../../core/doc/raw-doc';
import Icon from '../../icon';
import { Snapshot } from './snapshot';
import snapshotStyles from './snapshot/index.module.scss';
import { useStore } from '../../../store';
import styles from './index.module.scss';

interface SnapshotsProps {
  snapshots: DocSnapshot[];
  currentSnapshotIndex: number;
  currentSnapshotOffset: number;
}

export default function Snapshots({
  snapshots,
  currentSnapshotIndex,
  currentSnapshotOffset,
}: SnapshotsProps) {
  const duplicateSnapshot = useStore((state) => state.duplicateSnapshot);

  return (
    <div className={styles.snapshots}>
      {snapshots.map((snapshot, index) => (
        <Snapshot
          key={snapshot.id}
          deletable={snapshots.length > 1}
          index={index}
          active={index === currentSnapshotIndex}
          snapshot={snapshot}
          progress={clamp(
            currentSnapshotOffset / snapshot.duration +
              currentSnapshotIndex -
              index,
            0,
            1
          )}
        />
      ))}
      <button
        type="button"
        className={clsx(snapshotStyles.snapshot, styles.add)}
        title={`Duplicate #${snapshots.length - 1}`}
        onClick={() => {
          duplicateSnapshot(snapshots.length - 1);
        }}
      >
        <Icon name={addIcon} />
      </button>
    </div>
  );
}
