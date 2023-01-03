import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import { extractKeywordsClassNames, Paragraph, SpeakerParts } from '../../trsx';
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

  private createSpeakerParts = (): SpeakerParts | null => {
    const { speaker } = this.paragraph;
    if (speaker === null) {
      return null;
    }
    const firstname = speaker.unknown ? 'Mluvčí' : `${speaker.firstname ?? ''}`;
    const surname = speaker.unknown ? '' : `${speaker.surname ?? ''}`;
    const role = speaker.unknown || speaker.role === undefined ? '' : `${speaker.role ?? ''}`;
    const speakerParts: SpeakerParts = {
      firstname: {
        className: '',
        text: firstname,
      },
      surname: {
        className: '',
        text: surname,
      },
      role: {
        className: '',
        text: role,
      },
    };
    this.paragraph.speakerKeywordOccurences.forEach((occurence) => {
      const classNames = extractKeywordsClassNames(
        SPEAKER_KW_PREFIX,
        [occurence],
      );

      const accents = typeof occurence.accent === 'string'
        ? [occurence.accent]
        : occurence.accent ?? Object.keys(speakerParts);

      accents.forEach((acc) => {
        speakerParts[acc].className = classNames.join(' ');
      });
    });
    return speakerParts;
  };

  private render(): HTMLElement {
    this.phraseElements = this.paragraph.phrases
      .filter((phrase) => phrase.text !== '')
      .map(
        (phrase) => new PhraseElement(phrase, this.trancriptConfig, this.onPlayFrom),
      );
    const speakerParts = this.createSpeakerParts();

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
        (this.showSpeakers ?? true) && speakerParts !== null
          ? h(
            'div.transcript-speaker',
            Object.keys(speakerParts).map(
              (key) => (
                h(
                  'span',
                  {
                    className: `transcript-speaker__part ${speakerParts[key].className}`,
                  },
                  speakerParts[key].text,
                  key === 'surname' ? h(
                    'span',
                    ',',
                  ) : '',
                )
              ),
              h(`div.speaker-color${this.paragraph.speaker === null ? '' : colorCode(this.paragraph.speaker.id)}.transcript-speaker__color`),
            ),
          ) : '',
        h('p', this.phraseElements),
      ),
    );
  }
}
