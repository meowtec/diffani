import { type RawDoc } from '../../core/doc/raw-doc';
import CodeEditor from './code-editor';
import Snapshots from './snapshots';
import styles from './index.module.scss';

interface EditorProps {
  currentSnapshotIndex: number;
  currentSnapshotOffset: number;
  doc: RawDoc;
  onCodeUpdate: (code: string) => void;
}

export default function Editor({
  currentSnapshotIndex,
  currentSnapshotOffset,
  doc,
  onCodeUpdate,
}: EditorProps) {
  const currentSnapShot = doc.snapshots[currentSnapshotIndex];

  return (
    <div className={styles.editor}>
      <CodeEditor
        value={currentSnapShot.code}
        language={doc.language}
        onChange={onCodeUpdate}
        className={styles.codeEditor}
      />
      <Snapshots
        snapshots={doc.snapshots}
        currentSnapshotIndex={currentSnapshotIndex}
        currentSnapshotOffset={currentSnapshotOffset}
      />
    </div>
  );
}
