import styles from './app.module.scss';
import Editor from './view/editor/index';
import Player from './view/player';
import { useStore } from './store';
import { useCallback } from 'react';
import { getSnapshotAtTime } from './core/doc/raw-doc';

export default function App() {
  const { doc, currentTime, updateSnapshot } = useStore((state) => ({
    doc: state.doc,
    currentTime: state.currentTime,
    updateSnapshot: state.updateSnapshot,
  }));

  const [currentSnapshotIndex, currentSnapshotOffset] = getSnapshotAtTime(
    doc,
    currentTime
  );
  const currentSnapShot = doc.snapshots[currentSnapshotIndex];
  console.log('currentSnapshotIndex', currentSnapshotIndex);
  const handleCodeUpdate = useCallback(
    (code: string) => {
      updateSnapshot(currentSnapshotIndex, {
        ...currentSnapShot,
        code,
      });
    },
    [currentSnapShot, currentSnapshotIndex, updateSnapshot]
  );

  return (
    <div className={styles.layout}>
      <div className={styles.editorWrapper}>
        <Editor
          currentSnapshotIndex={currentSnapshotIndex}
          currentSnapshotOffset={currentSnapshotOffset}
          doc={doc}
          onCodeUpdate={handleCodeUpdate}
        />
      </div>
      <div className={styles.playerWrapper}>
        <Player currentTime={currentTime} doc={doc} />
      </div>
    </div>
  );
}
