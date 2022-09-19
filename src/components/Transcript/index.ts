import { h, RedomComponent, setChildren } from 'redom';
import { Trsx } from '../../trsx';
import { TranscriptSection } from './TranscriptSection';
import { MediaPlayer } from '../MediaPlayer';
import { SpeakersSelect } from '../SpeakersSelect';

export interface TranscriptConfig {
  showParagraphButtons?: boolean;
  enablePhraseSeek?: boolean;
  keepTrackWithMedia?: boolean;
}

export const defaultTranscriptConfig = {
  showParagraphButtons: true,
  enablePhraseSeek: true,
  keepTrackWithMedia: true,
};

export class Transcript implements RedomComponent {
  public el: HTMLElement;
  private transcriptConfig: TranscriptConfig;
  private showSpeakers: boolean;
  private player: MediaPlayer;
  private speakersSelect: SpeakersSelect;
  private sections: TranscriptSection[] = [];

  public constructor(
    player: MediaPlayer,
    config: TranscriptConfig,
    showSpeakers: boolean,
    onSelectedSpeakers: (speakerIds: string[]) => void,
  ) {
    this.player = player;
    this.transcriptConfig = {
      ...defaultTranscriptConfig,
      ...config,
    };
    this.showSpeakers = showSpeakers;
    this.speakersSelect = new SpeakersSelect(onSelectedSpeakers);

    this.player.addEventListener('seeked', this.handleTimeUpdate);
    this.player.addEventListener('seeked', this.handleSeek);
    this.player.addEventListener('timeupdate', this.handleTimeUpdate);
    this.el = this.render();
  }

  public updateTrsx = (trsx: Trsx) => {
    this.textView.innerHTML = '';
    this.sections = trsx.paragraphs.map(
      (paragraph, index) => new TranscriptSection(
        paragraph,
        trsx.paragraphs[index + 1],
        this.transcriptConfig,
        this.showSpeakers,
        this.handlePlayParagraph,
        this.handlePauseParagraph,
        this.scrollTo,
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

  private handleSeek = () => {
    const seekedSection = this.sections.find((section) => (
      section.begin <= this.player.currentTime && this.player.currentTime <= section.end
    ));
    if (seekedSection === undefined) {
      this.scrollTo('begin');
    } else {
      seekedSection.onSeek(this.player.currentTime);
    }
  };

  private scrollTo = (offSet: number | 'begin') => {
    const container = this.el.querySelector('.transcript-container') as HTMLElement;
    container.scrollTo(0, offSet === 'begin' ? 0 : offSet - container.offsetTop);
  };

  private render(): HTMLElement {
    return h(
      'div',
      this.showSpeakers || this.showSpeakers === undefined ? this.speakersSelect : '',
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
