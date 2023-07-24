import { easeQuadInOut } from 'd3-ease';
import { assert } from '../../utils/assert';
import { type Doc, createDoc } from '../doc/doc';
import {
  type RawDoc,
  getSnapshotAtTime,
  isOffsetTimeInTransition,
} from '../doc/raw-doc';
import { type Token } from '../tokenize/index';
import {
  applyPositionTransition,
  applyTransition,
  computeTransitionState,
} from '../transition/transition';
import { getFontProperty } from './utils';
import { checkSafeForMonospaceFont, getLastLine } from '../../utils/string';
import { type Position } from '../../types/base';
import { Theme } from '../theme/index';
import { clamp01 } from '../../utils/number';

const ASSERT_DOC_MSG =
  'renderer.doc is empty, make sure call setDoc before render';
export class MovieRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  private doc?: Doc;
  /**
   * Array[snapshotIndex][tokenIndex] represent for the token position
   */
  private tokenPositionsList: Position[][] = [];

  currentTime = -1;

  constructor(
    public readonly canvas: HTMLCanvasElement,
    public readonly ratio = 0.5
  ) {
    const ctx = canvas.getContext('2d');
    if (ctx == null) {
      throw new Error('Failed to get canvas context');
    }

    this.ctx = ctx;
  }

  setDoc(rawDoc: RawDoc) {
    if (rawDoc === this.doc?.raw) return;
    this.doc = createDoc(rawDoc);
    this.tokenPositionsList = [];
    this.currentTime = -1;
    this.canvas.width = rawDoc.width * this.ratio;
    this.canvas.height = rawDoc.height * this.ratio;
  }

  /**
   * render a new frame
   * @param time
   * @returns
   */
  render(time: number) {
    const { doc, currentTime } = this;

    assert(doc, ASSERT_DOC_MSG);

    if (!this.shouldReRender(currentTime, time)) {
      return;
    }

    this.currentTime = time;
    const [snapshotIndex, offsetTime] = getSnapshotAtTime(doc.raw, time);

    const snapshot = doc.raw.snapshots[snapshotIndex];

    if (isOffsetTimeInTransition(snapshot, offsetTime)) {
      const transitionProgressRate =
        (offsetTime - snapshot.duration + snapshot.transitionTime) /
        snapshot.transitionTime;
      if (snapshotIndex < doc.raw.snapshots.length - 1) {
        this.renderTransition(snapshotIndex, transitionProgressRate);
      } else {
        this.renderFinalTransition(snapshotIndex, transitionProgressRate);
      }
    } else {
      this.renderStatic(snapshotIndex);
    }
  }

  private get theme() {
    const { doc } = this;
    assert(doc, ASSERT_DOC_MSG);

    return Theme.getTheme(doc.raw.theme);
  }

  /**
   * Check if we should rerender when currentTime changed
   * @todo
   * @param oldTime
   * @param newTime
   * @returns
   */
  public shouldReRender(oldTime: number, newTime: number) {
    const { doc } = this;
    assert(doc, ASSERT_DOC_MSG);

    if (oldTime < 0) return true;
    if (oldTime === newTime) return false;

    const [snapshotIndex1, offsetTime1] = getSnapshotAtTime(doc.raw, oldTime);
    const [snapshotIndex2, offsetTime2] = getSnapshotAtTime(doc.raw, newTime);

    if (snapshotIndex1 !== snapshotIndex2) {
      return true;
    }

    if (
      !isOffsetTimeInTransition(
        doc.raw.snapshots[snapshotIndex1],
        offsetTime1
      ) &&
      !isOffsetTimeInTransition(doc.raw.snapshots[snapshotIndex2], offsetTime2)
    ) {
      return false;
    }

    return true;
  }

  private getTokenPositions(snapshotIndex: number) {
    const { tokenPositionsList } = this;

    return (tokenPositionsList[snapshotIndex] ??=
      this.measureTokenPositions(snapshotIndex));
  }

  /**
   * Measure all tokens of a snapshot and calculate their basic positions
   * If a token is invisible, will return null
   * Else return it's x and y
   * @param snapshotIndex
   */
  private measureTokenPositions(snapshotIndex: number): Position[] {
    const { doc, ctx, theme } = this;
    assert(doc, ASSERT_DOC_MSG);

    const { snapshots, raw: rawDoc } = doc;

    const snapshotView = snapshots[snapshotIndex];
    ctx.font = getFontProperty({
      fontSize: rawDoc.fontSize,
      fontFace: theme.data.fontFace,
    });

    const monospaceCharWidth = ctx.measureText('X').width;

    const positions: Position[] = [];
    let x = 0;
    let y = 0;

    const getTextWidth = (text: string) => {
      if (checkSafeForMonospaceFont(text)) {
        return monospaceCharWidth * text.length;
      }

      if (text.length === 0) return 0;

      return ctx.measureText(text).width;
    };

    for (const token of snapshotView.tokens) {
      positions.push({ x, y });
      const { value } = token;

      const breaksCount = value.match(/\n/g)?.length ?? 0;
      if (breaksCount === 0) {
        x += getTextWidth(value);
      } else {
        const lastLineText = getLastLine(value);
        y += rawDoc.lineHeight * breaksCount;
        x = getTextWidth(lastLineText);
      }
    }

    return positions;
  }

  private wrapRender(fn: (doc: Doc) => void) {
    const { ctx, doc, theme } = this;
    assert(doc, ASSERT_DOC_MSG);

    const { raw: rawDoc } = doc;
    ctx.clearRect(0, 0, rawDoc.width * this.ratio, rawDoc.height * this.ratio);
    ctx.fillStyle = theme.data.backgroundColor;
    ctx.fillRect(0, 0, rawDoc.width * this.ratio, rawDoc.height * this.ratio);
    ctx.font = getFontProperty({
      fontSize: rawDoc.fontSize * this.ratio,
      fontFace: theme.data.fontFace,
    });
    ctx.fillStyle = theme.data.color;
    ctx.textBaseline = 'middle';

    fn(doc);
  }

  private drawToken(
    token: Token,
    position: Position,
    doc: Doc,
    opacity: number,
    globalOffset: Position = { x: 0, y: 0 }
  ) {
    const { ctx, theme } = this;
    const { raw: rawDoc } = doc;

    ctx.save();

    const tokenStyle = theme.getTypesStyle(token.types);

    if (tokenStyle.color) {
      ctx.fillStyle = tokenStyle.color;
    }

    ctx.globalAlpha = (tokenStyle.opacity ?? 1) * opacity;

    ctx.font = getFontProperty({
      ...tokenStyle,
      fontFace: theme.data.fontFace,
      fontSize: rawDoc.fontSize * this.ratio,
    });

    if (!token.invisible) {
      ctx.fillText(
        token.value,
        (globalOffset.x + position.x) * this.ratio,
        (globalOffset.y + position.y + rawDoc.lineHeight / 2) * this.ratio
      );
    }

    ctx.restore();
  }

  private computeScrollPosition(snapshotIndex: number) {
    const { doc } = this;
    assert(doc, ASSERT_DOC_MSG);
    const {
      snapshots,
      raw: { height, padding, lineHeight },
    } = doc;
    const snapshotView = snapshots[snapshotIndex];

    const contentHeight = snapshotView.linesCount * lineHeight;
    const heightWithPaddings = contentHeight + padding.top + padding.bottom;
    const minScrollTop = Math.min(0, (heightWithPaddings - height) / 2);
    const maxScrollTop = Math.max(0, heightWithPaddings - height);

    return {
      minScrollTop,
      // Reserved for auto-scroll feature
      maxScrollTop,
    };
  }

  private baseRenderStatic(snapshotIndex: number, doc: Doc, globalAlpha = 1) {
    const {
      snapshots,
      raw: { padding },
    } = doc;
    const { minScrollTop } = this.computeScrollPosition(snapshotIndex);

    const positions = this.getTokenPositions(snapshotIndex);
    const { tokens } = snapshots[snapshotIndex];
    this.ctx.translate(
      padding.left * this.ratio,
      (padding.top - minScrollTop) * this.ratio
    );

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const position = positions[i];
      this.drawToken(token, position, doc, globalAlpha);
    }

    this.ctx.resetTransform();
  }

  private renderStatic(snapshotIndex: number) {
    this.wrapRender((doc) => {
      this.baseRenderStatic(snapshotIndex, doc);
    });
  }

  private renderTransition(leftSnapshotIndex: number, progress: number) {
    const rightSnapshotIndex = leftSnapshotIndex + 1;
    this.wrapRender((doc) => {
      const {
        raw: { padding },
      } = doc;
      const transitionState = computeTransitionState(progress);
      const { minScrollTop: leftMinScrollTop } =
        this.computeScrollPosition(leftSnapshotIndex);
      const { minScrollTop: rightMinScrollTop } =
        this.computeScrollPosition(rightSnapshotIndex);

      this.ctx.translate(
        padding.left * this.ratio,
        (padding.top -
          applyTransition(progress, leftMinScrollTop, rightMinScrollTop)) *
          this.ratio
      );

      const mutation = doc.transitions[leftSnapshotIndex];
      const { left, right, diffs } = mutation;

      for (const { leftIndex, rightIndex } of diffs) {
        if (leftIndex == null) {
          assert(
            rightIndex,
            'leftIndex and rightIndex cannot be null at same time'
          );
          // add
          const token = right[rightIndex];
          const position =
            this.getTokenPositions(rightSnapshotIndex)[rightIndex];
          this.drawToken(
            token,
            position,
            doc,
            applyTransition(transitionState.inProgress, 0, 1)
          );
        } else if (rightIndex == null) {
          // delete
          const token = left[leftIndex];
          const position = this.getTokenPositions(leftSnapshotIndex)[leftIndex];
          this.drawToken(
            token,
            position,
            doc,
            applyTransition(transitionState.outProgress, 1, 0)
          );
        } else {
          // move
          const leftToken = left[leftIndex];
          const leftPosition =
            this.getTokenPositions(leftSnapshotIndex)[leftIndex];
          const rightPosition =
            this.getTokenPositions(rightSnapshotIndex)[rightIndex];

          this.drawToken(
            leftToken,
            applyPositionTransition(
              transitionState.moveProgress,
              leftPosition,
              rightPosition
            ),
            doc,
            1
          );
        }
      }

      this.ctx.resetTransform();
    });
  }

  private renderFinalTransition(leftSnapshotIndex: number, progress: number) {
    this.wrapRender((doc) => {
      const { ctx } = this;
      this.baseRenderStatic(
        leftSnapshotIndex,
        doc,
        easeQuadInOut(clamp01(1 - progress * 2))
      );

      ctx.save();
      ctx.globalAlpha = easeQuadInOut(progress);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Made with diffani.co',
        (doc.raw.width / 2) * this.ratio,
        (doc.raw.height / 2) * this.ratio
      );
      ctx.restore();
    });
  }
}
