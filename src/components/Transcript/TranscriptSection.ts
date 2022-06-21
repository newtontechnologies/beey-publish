import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import { Paragraph } from '../../trsx';
import { PhraseElement } from './PhraseElm';

const secoondsToTime = (seconds: number): string => {
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  const mins = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
  const hrs = Math.floor((seconds / 60 / 60) % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

export class TranscriptSection implements RedomComponent {
  public el: HTMLElement;

  private paragraph: Paragraph;
  private trancriptConfig: TranscriptConfig;
  private onPlayFrom: (begin: number) => void;
  private onPause: () => void;

  private phraseElements: PhraseElement[] = [];
  private begin: number;
  private end: number;
  private isPlaying = false;

  constructor(
    paragraph: Paragraph,
    nextParagraph: Paragraph | undefined,
    trancriptConfig: TranscriptConfig,
    onPlayFrom: (begin: number) => void,
    onPause: () => void,
  ) {
    this.paragraph = paragraph;
    this.trancriptConfig = trancriptConfig;
    this.onPlayFrom = onPlayFrom;
    this.onPause = onPause;

    this.begin = this.paragraph.begin;
    this.end = nextParagraph === undefined
      ? this.paragraph.end
      : nextParagraph.begin;

    this.el = this.render();
  }

  public updatePlayback(currentTime: number, paused: boolean) {
    const playButton = this.el.querySelector('.play-button') as HTMLButtonElement;
    if (currentTime >= this.begin && currentTime < this.end) {
      if (paused) {
        playButton.textContent = 'play_arrow';
        this.isPlaying = false;
      } else {
        playButton.textContent = 'pause';
        this.isPlaying = true;
      }
    } else {
      playButton.textContent = 'play_arrow';
      this.isPlaying = false;
    }

    this.phraseElements.forEach((phraseElement) => phraseElement.updateTime(currentTime));
  }

  private handlePlayButtonClick = () => {
    if (this.isPlaying) {
      this.onPause();
    } else {
      this.onPlayFrom(this.paragraph.begin);
    }
  };

  private render(): HTMLElement {
    this.phraseElements = this.paragraph.phrases
      .filter((phrase) => phrase.text !== '')
      .map(
        (phrase) => new PhraseElement(phrase, this.trancriptConfig, this.onPlayFrom),
      );

    const speakerName = this.paragraph.speaker.unknown
      ? 'Mluvčí'
      : `${this.paragraph.speaker.firstname ?? ''} ${this.paragraph.speaker.surname}`;

    return h(
      'div.transcript-section',
      h(
        'div.transcript-section__player',
        this.trancriptConfig.showParagraphButtons ? [
          h(
            'button.play-button.material-icons',
            {
              onclick: this.handlePlayButtonClick,
            },
            'play_arrow',
          ),
          h('p', secoondsToTime(this.paragraph.begin)),
        ] : '',
      ),
      h(
        'div.transcript-section__text',
        this.trancriptConfig.showSpeakers
          ? h(
            `span.speaker ${this.paragraph.speaker.kwClasses.join(' ')}`,
            speakerName,
          ) : '',
        h('p', this.phraseElements),
      ),
    );
  }
}
