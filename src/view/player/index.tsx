import { type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { getSumDuration, type RawDoc } from '../../core/doc/raw-doc';
import { MovieRenderer } from '../../core/renderer';
import { useStore } from '../../store';
import playIcon from '../../assets/icons/play.svg';
import pauseIcon from '../../assets/icons/pause.svg';
import Icon from '../icon';
import { VideoExport } from '../video-export';
import styles from './index.module.scss';

interface PlayerProps {
  currentTime: number;
  doc: RawDoc;
}

export default function Player({ currentTime, doc }: PlayerProps) {
  const { setCurrentTime, setPlaying, playing } = useStore((state) => ({
    setCurrentTime: state.setCurrentTime,
    setPlaying: state.setPlaying,
    playing: state.playing,
  }));

  const duration = useMemo(() => getSumDuration(doc), [doc]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MovieRenderer>();

  useEffect(() => {
    const renderer = new MovieRenderer(canvasRef.current as HTMLCanvasElement);
    rendererRef.current = renderer;
    (window as any).__renderer = renderer;
  }, []);

  useEffect(() => {
    rendererRef.current?.setDoc(doc);
    rendererRef.current?.render(currentTime);
  }, [doc, currentTime]);

  return (
    <div className={styles.player}>
      <canvas ref={canvasRef} />
      <div className={styles.playButtonWrap}>
        <button
          type="button"
          className={styles.playButton}
          onClick={() => {
            setPlaying(!playing);
          }}
        >
          <Icon name={playing ? pauseIcon : playIcon} />
        </button>

        <div className={styles.controls}>
          <VideoExport />
        </div>
      </div>
      <input
        type="range"
        value={currentTime}
        min={0}
        max={duration}
        className={styles.slider}
        style={
          {
            '--progress-rate': currentTime / duration,
          } as CSSProperties
        }
        onChange={(e) => {
          setCurrentTime(Number(e.target.value));
        }}
      />
    </div>
  );
}
