import { h, RedomComponent, setChildren } from 'redom';
import { Trsx } from '../../trsx';
import { TranscriptSection } from './TranscriptSection';
import { MediaPlayer } from '../MediaPlayer';
import { SpeakersSelect } from '../SpeakersSelect';

export interface TranscriptConfig {
  showParagraphButtons: boolean;
  enablePhraseSeek: boolean;
  keepTrackWithMedia: boolean;
  showSpeakers: boolean;
}

export const defaultTranscriptConfig = {
  showParagraphButtons: true,
  enablePhraseSeek: true,
  keepTrackWithMedia: true,
  showSpeakers: true,
};

export class Transcript implements RedomComponent {
  public el: HTMLElement;
  private config: TranscriptConfig;
  private player: MediaPlayer;
  private speakersSelect: SpeakersSelect;
  private sections: TranscriptSection[] = [];

  public constructor(
    player: MediaPlayer,
    config: Partial<TranscriptConfig>,
    onSelectedSpeakers: (speakerIds: string[]) => void,
  ) {
    this.player = player;
    this.config = {
      ...defaultTranscriptConfig,
      ...config,
    };

    this.speakersSelect = new SpeakersSelect(onSelectedSpeakers);

    this.player.addEventListener('seeked', this.handleTimeUpdate);
    this.player.addEventListener('timeupdate', this.handleTimeUpdate);
    this.el = this.render();
  }

  public updateTrsx = (trsx: Trsx) => {
    this.textView.innerHTML = '';
    this.sections = trsx.paragraphs.map(
      (paragraph, index) => new TranscriptSection(
        paragraph,
        trsx.paragraphs[index + 1],
        this.config,
        this.handlePlayParagraph,
        this.handlePauseParagraph,
      ),
    );

    setChildren(this.textView, this.sections);
    this.speakersSelect.updateSpeakers(trsx.speakers);
  };

  private get textView(): HTMLElement {
    return this.el.querySelector('.text-view') as HTMLElement;
  }

  private handleToggleTranscript = () => {
    this.textView.classList.toggle('nodisplay');
  };

  private handlePlayParagraph = (fromTime: number): void => {
    this.player.currentTime = fromTime;
    this.player.play();
  };

  private handlePauseParagraph = (): void => {
    this.player.pause();
  };

  private handleTimeUpdate = () => {
    this.sections.forEach((section) => section.updatePlayback(
      this.player.currentTime,
      this.player.paused,
    ));
  };

  private render(): HTMLElement {
    return h(
      'div',
      this.speakersSelect,
      h(
        'div.transcript-container',
        h(
          'div.transcript-container__header',
          h(
            'div.enable-transcript',
            'Přepis',
            h('span', '(automaticky generovaný)'),
            h(
              'label.switch',
              h(
                'input',
                {
                  type: 'checkbox',
                  checked: true,
                  onchange: this.handleToggleTranscript,
                },

              ),
              h(
                'span.switch__slider',
              ),
            ),
          ),
          h(
            'div.beey-ad',
            h('p', 'Automatický přepis zajišťuje'),
            h(
              'a',
              { href: 'https://www.beey.io/cs/', target: '_blank' },
              h(
                'img.beey-ad__logo',
                { src: 'https://www.beey.io/wp-content/uploads/2022/04/beey-logo.svg' },
              ),
            ),
          ),
        ),
        h('div.text-view'),
      ),
    );
  }
}
