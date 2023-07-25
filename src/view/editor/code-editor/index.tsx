import { useEffect, useMemo, useRef } from 'react';
import { minimalSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDarkTheme } from '@codemirror/theme-one-dark';
import { assertNonNull } from '../../../utils/assert';
import {
  codeMirrorLanguageMap,
  type Language,
} from '../../../core/code-languages/languages';

interface CodeEditorProps {
  value: string;
  language: Language;
  className?: string;
  onChange: (value: string) => void;
}

const theme = EditorView.theme(
  {
    '&': {
      padding: '0.5rem',
      background: 'none',
    },
    '.cm-scroller': {
      font: `16px 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Source Code Pro', 'source-code-pro', monospace`,
    },
  },
  {
    dark: true,
  }
);
const extensionsCompartment = new Compartment();

export default function CodeEditor({
  value,
  language,
  className,
  onChange,
}: CodeEditorProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView>();
  const latestDocRef = useRef(value);

  const updateListener = useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          if (newValue === latestDocRef.current) return;
          latestDocRef.current = newValue;
          onChange(newValue);
        }
      }),
    [onChange]
  );

  // create editor
  useEffect(() => {
    if (editorRef.current != null) return;
    const editorView = new EditorView({
      state: EditorState.create({
        doc: latestDocRef.current,
        extensions: [
          minimalSetup,
          theme,
          oneDarkTheme,
          keymap.of([indentWithTab]),
          extensionsCompartment.of([]),
        ],
      }),
      parent: assertNonNull(elRef.current),
    });
    editorRef.current = editorView;
  }, []);

  // update configs
  useEffect(() => {
    editorRef.current?.dispatch({
      effects: extensionsCompartment.reconfigure([
        updateListener,
        codeMirrorLanguageMap[language],
      ]),
    });
  }, [language, updateListener]);

  // update doc
  useEffect(() => {
    const editor = assertNonNull(editorRef.current);
    if (value !== latestDocRef.current) {
      const transaction = editor.state.update({
        changes: [
          {
            from: 0,
            to: editor.state.doc.length,
            insert: value,
          },
        ],
      });
      editor.dispatch(transaction);
      latestDocRef.current = value;
    }
  }, [value]);

  return <div ref={elRef} className={className}></div>;
}
