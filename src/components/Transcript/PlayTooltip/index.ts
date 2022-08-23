import { h, RedomComponent } from 'redom';

const AUTO_CLOSE_TIME = 2000; // 2s

export class PlayTooltip implements RedomComponent {
  public el: HTMLElement;
  public onPlay: (begin: number) => void;

  private startTime = 0;

  private closeTimer: number | undefined = undefined;

  public constructor() {
    this.el = this.render();
    this.onPlay = () => undefined;

    document.body.addEventListener('click', this.close);
  }

  public open(startTime: number, posX: number, posY: number) {
    this.startTime = startTime;
    this.el.style.left = `${posX}px`;
    this.el.style.top = `${posY - 60}px`;

    this.closeTimer = window.setTimeout(this.close, AUTO_CLOSE_TIME);
  }

  public close = () => {
    this.el.remove();
    window.clearTimeout(this.closeTimer);
  };

  private playFrom = (e: MouseEvent) => {
    e.stopPropagation();
    this.onPlay(this.startTime);
    this.close();
  };

  private render(): HTMLElement {
    return h(
      'div.play-tooltip',
      h(
        'button',
        ' ▶ Přehrát od slova',
        {
          onclick: this.playFrom,
        },
      ),
    );
  }
}
