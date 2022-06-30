import { h, RedomComponent, setChildren } from 'redom';
import { Speakers } from '../../trsx';

export class SpeakersSelect implements RedomComponent {
  public el: HTMLElement;
  private onSelectedSpeakers: (speakerIds: string[]) => void;

  public constructor(onSelectedSpeakers: (speakerIds: string[]) => void) {
    this.el = this.render();
    this.onSelectedSpeakers = onSelectedSpeakers;
    document.body.addEventListener('click', () => this.el.classList.remove('visible'));
  }

  private handleSpeakersSelection = () => {
    const speakers = this.el.querySelectorAll('input');
    const selectedIds = [] as string[];
    speakers.forEach((speaker) => (speaker.checked ? selectedIds.push(speaker.value) : null));
    this.onSelectedSpeakers(selectedIds);
  };

  public updateSpeakers = (speakers: Speakers) => {
    if (speakers.isMachineSpeakers) {
      this.el.style.display = 'none';
    }
    const options = Object.values(speakers.speakerMap).map((coloredSpeaker) => h(
      'label',
      h('input', {
        type: 'checkbox',
        checked: true,
        value: coloredSpeaker.id,
        onchange: this.handleSpeakersSelection,
      }),
      `${coloredSpeaker.firstname} ${coloredSpeaker.surname}`,
      h(`div.speaker-color${coloredSpeaker.id}.dropdown__color`, {
        style: 'width: 10px; height: 10px;',
      }),
    ));
    const dropdown = this.el.querySelector(
      '.dropdown__items',
    ) as HTMLInputElement;
    setChildren(dropdown, options);
  };

  private handleDropdown = (e: PointerEvent) => {
    e.preventDefault();
    this.el.classList.toggle('visible');
  };

  private render(): HTMLElement {
    return h(
      'div.dropdown',
      h('span.dropdown__anchor', 'Vyznačit mluvčí: ', {
        onclick: this.handleDropdown,
      }),
      h('div.dropdown__items'),
      {
        onclick: (e: PointerEvent) => e.stopPropagation(),
      },
    );
  }
}
