import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import { Phrase } from '../../trsx';
import { PlayTooltip } from './PlayTooltip';

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

    if (this.phrase.kwClasses.length > 0) {
      attributes.className += ` kw ${this.phrase.kwClasses.join(' ')}`;
    }

    return h(
      'span',
      attributes,
      this.phrase.text,
    );
  }
}
