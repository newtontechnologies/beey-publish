import { h, RedomComponent } from 'redom';
import { extractKeywordsClassNames, Trsx } from '../../trsx';
import { formatTime } from '../SpeakersSlider';

const TIMELINE_KW_PREFIX = 'tkw';

export class TimelineKeyWords implements RedomComponent {
  public el: HTMLElement;
  private trsx: Trsx;
  private onSeek: (time: number) => void;

  public constructor(trsx: Trsx, onSeek: (time: number) => void) {
    this.trsx = trsx;
    this.onSeek = onSeek;
    this.el = this.render();
  }

  private render(): HTMLElement {
    const { recordingDuration } = this.trsx;
    const keyWordsArray = this.trsx.keywordInstances.map((instance) => {
      const wordPosition = (instance.begin / recordingDuration) * 100;
      const kwClassNames = extractKeywordsClassNames(TIMELINE_KW_PREFIX, [instance]);

      return h(
        'div.key-words__mark.tooltip',
        {
          style: `left:${wordPosition}%`,
          onclick: () => this.onSeek(instance.begin),
        },
        h('div', { className: `wedge ${TIMELINE_KW_PREFIX} ${kwClassNames}` }),
        h(
          'div.tooltip__text',
          h(
            'div.tooltip__time',
            h('div', `${formatTime(instance.begin)}`),
          ),
          h('div.tooltip__word', `${instance.keyword.text}`),
        ),
      );
    });

    return h(
      'div.key-words',
      keyWordsArray,
    );
  }
}
