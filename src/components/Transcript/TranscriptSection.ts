import { h, RedomComponent } from 'redom';
import type { TranscriptConfig } from '.';
import {
  extractKeywordsClassNames, Paragraph, SpeakerMention,
} from '../../trsx';
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

  private createSpeakerElements = () => {
    const { speaker } = this.paragraph;
    const firstname = speaker.unknown ? 'Mluvčí' : `${speaker.firstname ?? ''}` as string;
    const surname = speaker.unknown ? '' : speaker.surname as string;
    const role = speaker.unknown || speaker.role === undefined ? '' : speaker.role as string;
    const speakerElements = [
      { name: 'firstname', className: '', text: firstname },
      { name: 'surname', className: '', text: surname },
      { name: 'role', className: '', text: role },
    ];
    this.paragraph.speakerKeywordInstances.map((instance) => {
      const className = extractKeywordsClassNames(
        SPEAKER_KW_PREFIX,
        [instance],
      );
      const { mentions } = instance.keyword;
      const speakerMentions = mentions.filter((mention) => mention.speakerId
        !== undefined) as SpeakerMention[];

      return speakerElements.forEach((element, index) => {
        speakerMentions.forEach((mention) => {
          if (mention.accent?.includes(element.name)
          || mention.accent === element.name) {
            const newElementWithClass = { ...element, className: className.join(' ') };
            speakerElements[index] = newElementWithClass;
          }
        });
      });
    });
    return speakerElements;
  };

  private render(): HTMLElement {
    this.phraseElements = this.paragraph.phrases
      .filter((phrase) => phrase.text !== '')
      .map(
        (phrase) => new PhraseElement(phrase, this.trancriptConfig, this.onPlayFrom),
      );
    const speakerSpans = this.createSpeakerElements();
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
            speakerSpans.map(
              (span) => (
                h(
                  'span',
                  {
                    className: `transcript-speaker__name ${span.className}`,
                  },
                  span.text,
                  span.name === 'surname' ? h(
                    'span',
                    ',',
                  ) : '',
                )
              ),
              h(`div.speaker-color${colorCode(this.paragraph.speaker.id)}.transcript-speaker__color`),
            ),
          ) : '',
        h('p', this.phraseElements),
      ),
    );
  }
}
