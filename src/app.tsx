import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import Editor from './view/editor/index';
import Player from './view/player';
import { useStore } from './store';
import { getSnapshotAtTime } from './core/doc/raw-doc';
import styles from './app.module.scss';
import githubIcon from './assets/icons/github.svg';
import Icon from './view/icon';

export default function App() {
  const { doc, currentTime, updateSnapshot } = useStore(
    useShallow((state) => ({
      doc: state.doc,
      currentTime: state.currentTime,
      updateSnapshot: state.updateSnapshot,
    })),
  );

  const [currentSnapshotIndex, currentSnapshotOffset] = getSnapshotAtTime(
    doc,
    currentTime,
  );
  const currentSnapShot = doc.snapshots[currentSnapshotIndex];
  const handleCodeUpdate = useCallback(
    (code: string) => {
      updateSnapshot(currentSnapshotIndex, {
        ...currentSnapShot,
        code,
      });
    },
    [currentSnapShot, currentSnapshotIndex, updateSnapshot],
  );

  return (
    <div>
      <header className={styles.header}>
        <span className={styles.logo}>diffani.co</span>
        <a
          href="https://github.com/meowtec/diffani"
          target="_blank"
          rel="noreferrer"
          className={styles.githubLink}
        >
          <Icon name={githubIcon} />
        </a>
      </header>
      <div className={styles.layout}>
        <div className={styles.editorWrapper}>
          <h2 className={styles.title}>Edit</h2>
          <Editor
            currentSnapshotIndex={currentSnapshotIndex}
            currentSnapshotOffset={currentSnapshotOffset}
            doc={doc}
            onCodeUpdate={handleCodeUpdate}
          />
        </div>
        <div className={styles.playerWrapper}>
          <h2 className={styles.title}>Preview</h2>
          <Player currentTime={currentTime} doc={doc} />
        </div>
      </div>
    </div>
  );
}
