import { h, RedomComponent } from 'redom';
import { colorCode } from '../SpeakersSelect';
import { Trsx } from '../../trsx';

export const formatTime = (secs: number | null): string | null => {
  if (secs === null) {
    return null;
  }

  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export class SpeakersSlider implements RedomComponent {
  public el: HTMLElement;
  private trsx: Trsx;
  private onPlaySpeaker: (begin: number) => void;

  public constructor(trsx: Trsx, handlePlaySpeaker: (begin: number) => void) {
    this.trsx = trsx;
    this.onPlaySpeaker = handlePlaySpeaker;
    this.el = this.render();
  }

  public updateDuration = (duration: string | null) => {
    const totalDurationElement = this.el.querySelector(
      '.player-time__duration',
    ) as HTMLInputElement;
    totalDurationElement.textContent = duration;
  };

  public updateSelectedSpeakers = (selectedSpeakersIds: string[]) => {
    const spans: NodeListOf<HTMLElement> = this.el.querySelectorAll('.speakers > span');
    spans.forEach((span) => {
      // eslint-disable-next-line dot-notation
      const spanId = span.dataset['speakerid'] as string;
      // eslint-disable-next-line no-param-reassign
      span.style.display = selectedSpeakersIds.includes(spanId)
        ? 'block'
        : 'none';
    });
  };

  public hideSlider = () => {
    const slider = this.el.querySelector('.speakers') as HTMLElement;
    slider.style.display = 'none';
  };

  public onClick = (e: PointerEvent) => {
    const { paragraphs } = this.trsx;
    const spanElement = e.target as HTMLElement;
    const spanIndex = Number(spanElement.getAttribute('data-index'));
    this.onPlaySpeaker(paragraphs[spanIndex].begin);
  };

  private render(): HTMLElement {
    const { paragraphs, recordingDuration } = this.trsx;
    const tooltips: HTMLElement[] = [];
    const speakerSpans: HTMLElement[] = [];
    paragraphs.forEach((paragraph, index) => {
      const { speaker, begin, end } = paragraph;
      const chunkPosition = (begin / recordingDuration) * 100;
      const chunkLength = (end - begin) / (recordingDuration / 100);
      const speakerName = `${speaker.firstname} ${speaker.surname}`;
      tooltips.push(
        h(
          'span.tooltip',
          {
            style: `left:${chunkPosition}%; 
          width: ${chunkLength}%`,
            'data-speakerId': speaker.id,
            'data-index': index,
          },
          h(
            'div.tooltip__text',
            h(
              'div.tooltip__time',
              h('div', `${formatTime(begin)} - ${formatTime(end)}`),
              h(
                `div.material-icons.speaker-icon.speaker-color${colorCode(speaker.id)}`,
                'record_voice_over',
              ),
            ),
            h('div.tooltip__speaker', `${speakerName}`),
          ),
        ),
      );

      speakerSpans.push(
        h(
          `span.speaker-color${colorCode(speaker.id)} tooltip`,
          {
            style: `left:${chunkPosition}%; 
            width: ${chunkLength}%`,
            'data-speakerId': speaker.id,
            'data-index': index,
          },
        ),
      );
    });

    return h(
      'div.seekbar',
      h(
        'div.seekbar__background.speakers',
        h('div.seekbar__progress-bar'),
        speakerSpans,
      ),
      h(
        'div.seekbar__background.speakers.hidden',
        tooltips,
        {
          onpointerdown: this.onClick,
        },
      ),
    );
  }
}
