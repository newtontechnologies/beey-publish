import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import { extractKeywordsClassNames, Paragraph } from '../../trsx';
import { PhraseElement } from './PhraseElm';
import { colorCode } from '../SpeakersSelect';

const secondsToTime = (seconds: number): string => {
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  const mins = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
  const hrs = Math.floor((seconds / 60 / 60) % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

const SPEAKER_KW_PREFIX = 'skw';

export class TranscriptSection implements RedomComponent {
  public el: HTMLElement;

  private paragraph: Paragraph;
  private trancriptConfig: TranscriptConfig;
  private showSpeakers: boolean;
  private onPlayFrom: (begin: number) => void;
  private onPause: () => void;
  private onScrollTo: (offSet: number) => void;

  private phraseElements: PhraseElement[] = [];
  public readonly begin: number;
  public readonly end: number;
  private isPlaying = false;

  constructor(
    paragraph: Paragraph,
    nextParagraph: Paragraph | undefined,
    trancriptConfig: TranscriptConfig,
    showSpeakers: boolean,
    onPlayFrom: (begin: number) => void,
    onPause: () => void,
    onScrollTo: (offSet: number) => void,
  ) {
    this.paragraph = paragraph;
    this.trancriptConfig = trancriptConfig;
    this.showSpeakers = showSpeakers;
    this.onPlayFrom = onPlayFrom;
    this.onPause = onPause;
    this.onScrollTo = onScrollTo;

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

  public onSeek(currentTime: number) {
    let i = 1;
    for (; i < this.phraseElements.length; i += 1) {
      if (this.phraseElements[i].begin > currentTime) {
        break;
      }
    }
    this.onScrollTo(this.phraseElements[i - 1].offSetTop);
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

    const { speaker } = this.paragraph;
    const speakerName = speaker.unknown
      ? 'Mluvčí'
      : `${speaker.firstname ?? ''} ${speaker.surname}`;

    const keywordClassNames = extractKeywordsClassNames(
      SPEAKER_KW_PREFIX,
      speaker.keywordInstances,
    );

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
          h('p', secondsToTime(this.paragraph.begin)),
        ] : '',
      ),
      h(
        'div.transcript-section__text',
        this.showSpeakers || this.showSpeakers === undefined
          ? h(
            'div.transcript-speaker',
            h(
              `span.transcript-speaker__name ${SPEAKER_KW_PREFIX} ${SPEAKER_KW_PREFIX}-${speaker.id} ${keywordClassNames.join(' ')}`,
              speakerName,
            ),
            h(`div.speaker-color${colorCode(speaker.id)}.transcript-speaker__color`),
          )
          : '',
        h('p', this.phraseElements),
      ),
    );
  }
}
