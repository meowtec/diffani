import {
  Application,
  BitmapFontManager,
  TextStyle,
  Text,
  type TextStyleOptions,
  Container,
} from 'pixi.js';
import { easeQuadInOut } from 'd3-ease';
import { assert } from '../../utils/assert';
import { type Doc, createDoc } from '../doc/doc';
import {
  type RawDoc,
  getSnapshotAtTime,
  isOffsetTimeInTransition,
} from '../doc/raw-doc';
import {
  applyPositionTransition,
  applyTransition,
  computeTransitionState,
} from '../transition/transition';
import { checkSafeForMonospaceFont, getLastLine } from '../../utils/string';
import { type Position } from '../../types/base';
import { Theme } from '../theme/index';
import { clamp01 } from '../../utils/number';
import { type Token } from '../tokenize';

const ASSERT_DOC_MSG =
  'renderer.doc is empty, make sure call setDoc before render';

export class MovieRenderer {
  private readonly app: Application;

  public readonly readyPromise: Promise<void>;

  public ready = false;

  private doc?: Doc;
  /**
   * Array[snapshotIndex][tokenIndex] represent for the token position
   */
  private tokenPositionsList: Position[][] = [];

  private cachedTexts: Text[][] = [];

  private readonly finalText = this.createFinalText();

  private readonly textsContainer = new Container();

  private _theme: Theme | null = null;

  currentTime = -1;

  constructor(public readonly canvas: HTMLCanvasElement) {
    this.app = new Application();
    this.readyPromise = this.init();
  }

  async init() {
    this.app.stage.addChild(this.textsContainer, this.finalText);

    await this.app.init({
      background: '#000',
      canvas: this.canvas,
      webgl: {
        preserveDrawingBuffer: true,
      },
      antialias: true,
    });
    this.ready = true;
  }

  setDoc(rawDoc: RawDoc) {
    if (rawDoc === this.doc?.raw) return;
    this.doc = createDoc(rawDoc);
    this.tokenPositionsList = [];
    this.currentTime = -1;
    this.cachedTexts = [];
    this._theme = null;

    void this.readyPromise.then(() => {
      this.app.renderer.resize(rawDoc.width, rawDoc.height);
    });
  }

  /**
   * render a new frame
   * @param time
   * @returns
   */
  render(time: number) {
    const { doc, currentTime, app } = this;

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

    if (this.ready) {
      app.render();
    }
  }

  private get theme() {
    const { doc, _theme } = this;
    assert(doc, ASSERT_DOC_MSG);
    if (_theme) return _theme;

    const theme = Theme.getTheme(doc.raw.theme);
    this._theme = theme;

    return theme;
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
        offsetTime1,
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
   * @param snapshotIndex
   */
  private measureTokenPositions(snapshotIndex: number): Position[] {
    const { doc } = this;
    assert(doc, ASSERT_DOC_MSG);

    const { snapshots, raw: rawDoc } = doc;

    const snapshotView = snapshots[snapshotIndex];

    const textStyle = new TextStyle(this.getBaseTextStyle());

    const textSize = BitmapFontManager.measureText('X', textStyle);

    const monospaceCharWidth = textSize.width * textSize.scale;

    const positions: Position[] = [];
    let x = 0;
    let y = 0;

    const getTextWidth = (text: string) => {
      if (checkSafeForMonospaceFont(text)) {
        return monospaceCharWidth * text.length;
      }

      if (text.length === 0) return 0;

      return BitmapFontManager.measureText(text, textStyle).width;
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

  private getBaseTextStyle(): Partial<TextStyleOptions> {
    const { theme, doc } = this;
    assert(doc, ASSERT_DOC_MSG);
    const {
      raw: { fontSize },
    } = doc;

    return {
      fontSize,
      fontFamily: theme.data.fontFace,
    };
  }

  private createText(token: Token, snapshotIndex: number, tokenIndex: number) {
    const snapshotTexts = (this.cachedTexts[snapshotIndex] ||= []);
    if (snapshotTexts[tokenIndex]) {
      return snapshotTexts[tokenIndex];
    }
    const { theme, doc } = this;
    assert(doc, ASSERT_DOC_MSG);
    const tokenStyle = theme.getTypesStyle(token.types);

    const textStyle = this.getBaseTextStyle();

    const text = new Text({
      text: token.value,
      style: {
        ...textStyle,
        fill: tokenStyle.color ?? '#fff',
      },
    });

    snapshotTexts[tokenIndex] = text;

    return text;
  }

  createFinalText() {
    const text = new Text({
      text: 'Made with diffani',
      style: {
        fill: '#fff',
        align: 'center',
      },
    });
    text.alpha = 0;
    return text;
  }

  private baseRenderStatic(snapshotIndex: number, doc: Doc, globalAlpha = 1) {
    const {
      snapshots,
      raw: { padding },
    } = doc;
    const { minScrollTop } = this.computeScrollPosition(snapshotIndex);

    const positions = this.getTokenPositions(snapshotIndex);
    const { tokens } = snapshots[snapshotIndex];

    this.finalText.alpha = 0;
    this.textsContainer.removeChildren();

    this.textsContainer.alpha = globalAlpha;
    this.textsContainer.x = padding.left;
    this.textsContainer.y = padding.top - minScrollTop;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const position = positions[i];
      const text = this.createText(token, snapshotIndex, i);
      text.x = position.x;
      text.y = position.y;
      this.textsContainer.addChild(text);
    }
  }

  private renderStatic(snapshotIndex: number) {
    const { doc } = this;
    assert(doc, ASSERT_DOC_MSG);
    this.baseRenderStatic(snapshotIndex, doc);
  }

  private renderTransition(leftSnapshotIndex: number, progress: number) {
    const rightSnapshotIndex = leftSnapshotIndex + 1;
    const { doc, finalText } = this;
    assert(doc, ASSERT_DOC_MSG);

    const {
      raw: { padding },
    } = doc;
    const transitionState = computeTransitionState(progress);
    const { minScrollTop: leftMinScrollTop } =
      this.computeScrollPosition(leftSnapshotIndex);
    const { minScrollTop: rightMinScrollTop } =
      this.computeScrollPosition(rightSnapshotIndex);

    finalText.alpha = 0;
    this.textsContainer.removeChildren();

    this.textsContainer.x = padding.left;
    this.textsContainer.y =
      padding.top -
      applyTransition(progress, leftMinScrollTop, rightMinScrollTop);

    const mutation = doc.transitions[leftSnapshotIndex];
    const { left, right, diffs } = mutation;

    for (const { leftIndex, rightIndex } of diffs) {
      if (leftIndex == null) {
        assert(
          rightIndex,
          'leftIndex and rightIndex cannot be null at same time',
        );
        // add
        const token = right[rightIndex];
        const position = this.getTokenPositions(rightSnapshotIndex)[rightIndex];
        const text = this.createText(token, rightSnapshotIndex, rightIndex);
        text.x = position.x;
        text.y = position.y;
        text.alpha = applyTransition(transitionState.inProgress, 0, 1);
        this.textsContainer.addChild(text);
      } else if (rightIndex == null) {
        // delete
        const token = left[leftIndex];
        const position = this.getTokenPositions(leftSnapshotIndex)[leftIndex];
        const text = this.createText(token, leftSnapshotIndex, leftIndex);
        text.x = position.x;
        text.y = position.y;
        text.alpha = applyTransition(transitionState.outProgress, 1, 0);
        this.textsContainer.addChild(text);
      } else {
        // move
        const leftToken = left[leftIndex];
        const leftPosition =
          this.getTokenPositions(leftSnapshotIndex)[leftIndex];
        const rightPosition =
          this.getTokenPositions(rightSnapshotIndex)[rightIndex];

        const text = this.createText(leftToken, leftSnapshotIndex, leftIndex);
        const position = applyPositionTransition(
          transitionState.moveProgress,
          leftPosition,
          rightPosition,
        );
        text.x = position.x;
        text.y = position.y;
        text.alpha = 1;
        this.textsContainer.addChild(text);
      }
    }
  }

  private renderFinalTransition(leftSnapshotIndex: number, progress: number) {
    const { doc, finalText } = this;
    assert(doc, ASSERT_DOC_MSG);
    this.baseRenderStatic(
      leftSnapshotIndex,
      doc,
      easeQuadInOut(clamp01(1 - progress * 2)),
    );
    finalText.y = doc.raw.height / 2;
    finalText.x = doc.raw.width / 2 - finalText.width / 2;
    finalText.alpha = easeQuadInOut(progress);
    Object.assign(finalText.style, this.getBaseTextStyle());
  }
}
