import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import { extractKeywordsClassNames, Phrase } from '../../trsx';
import { PlayTooltip } from './PlayTooltip';

const PHRASE_KW_PREFIX = 'pkw';

const playTooltip: PlayTooltip = new PlayTooltip();
export class PhraseElement implements RedomComponent {
  public el: HTMLElement;

  private static playTooltip: PlayTooltip | null;

  private phrase: Phrase;
  private transcriptConfig: TranscriptConfig;
  private onPlay: (begin: number) => void;

  public constructor(
    phrase: Phrase,
    transcriptConfig: TranscriptConfig,
    onPlay: (begin: number) => void,
  ) {
    this.phrase = phrase;
    this.transcriptConfig = transcriptConfig;
    this.onPlay = onPlay;
    this.el = this.render();
  }

  public get offSetTop(): number {
    return this.el.offsetTop;
  }

  public get begin(): number {
    return this.phrase.begin;
  }

  public updateTime(currentTime: number) {
    if (currentTime > this.phrase.begin) {
      this.el.classList.add('played');
    } else {
      this.el.classList.remove('played');
    }
  }

  private handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    playTooltip.onPlay = this.onPlay;
    playTooltip.open(this.phrase.begin, e.pageX, e.pageY);
    this.el.appendChild(playTooltip.el);
  };

  private render(): HTMLElement {
    // Have to create classes separatelly to allow stupid characters
    // in keyword classes such as #.
    const attributes = {
      className: this.transcriptConfig.enablePhraseSeek ? 'seekable' : '',
      onclick: this.handleClick,
      'data-idx': this.phrase.index,
    };

    const classNames = extractKeywordsClassNames(PHRASE_KW_PREFIX, this.phrase.keywordInstances);
    if (classNames.length > 0) {
      attributes.className += ` ${PHRASE_KW_PREFIX} ${classNames.join(' ')}`;
    }

    return h(
      'span',
      attributes,
      this.phrase.text,
    );
  }
}
