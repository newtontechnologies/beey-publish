import { h, svg, RedomComponent } from 'redom';
import { Trsx } from '../../trsx';
import { formatTime } from '../SpeakersSlider';

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
      return h(
        'div.key-words__mark.tooltip',
        {
          style: `left:${wordPosition}%`,
          onclick: () => this.onSeek(instance.begin),
        },
        svg(
          'svg',
          {
            width: '3.5px',
            height: '15px',
          },
          svg('use', { xlink: { href: '#kw-mark' } }),
        ),
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
      svg(
        'svg',
        {
          width: '0',
          height: '0',
          xmlns: 'http://www.w3.org/2000/svg',
        },
        svg(
          'symbol#kw-mark',
          {
            width: '3.5px',
            height: '15px',
            viewbox: '0 0 3.5 15',
          },
          svg('path.wedge', { d: 'M0,0 H3.5 L1.75,15 Z' }),
        ),
      ),
      keyWordsArray,
    );
  }
}
