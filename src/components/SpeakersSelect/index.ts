import { h, RedomComponent, setChildren } from 'redom';
import { Speakers } from '../../trsx';

export class SpeakersSelect implements RedomComponent {
  public el: HTMLElement;
  private onSelectedSpeakers: (speakerIds: string[]) => void;

  public constructor(onSelectedSpeakers: (speakerIds: string[]) => void) {
    this.el = this.render();
    this.onSelectedSpeakers = onSelectedSpeakers;
  }

  private handleSpeakersSelection = () => {
    const speakers = this.el.querySelectorAll('input');
    const checkAll = this.el.querySelector('.check-all') as HTMLInputElement;
    const selectedIds = [] as string[];
    speakers.forEach((speaker) => {
      if (speaker.checked) {
        selectedIds.push(speaker.value);
      }
      checkAll.checked = false;
    });
    this.onSelectedSpeakers(selectedIds);
  };

  private handleCheckAll = () => {
    const speakers = this.el.querySelectorAll('input');
    const checkAll = this.el.querySelector('.check-all') as HTMLInputElement;
    const selectedIds = [] as string[];
    speakers.forEach((speaker) => {
      // eslint-disable-next-line no-param-reassign
      speaker.checked = checkAll.checked;
      if (checkAll.checked) {
        selectedIds.push(speaker.value);
      }
    });
    this.onSelectedSpeakers(selectedIds);
  };

  public updateSpeakers = (speakers: Speakers) => {
    if (speakers.isMachineSpeakers) {
      this.el.style.display = 'none';
    }
    const options: HTMLElement[] = [];
    options.push(
      h(
        'div',
        h(
          'label',
          h('input.check-all', {
            type: 'checkbox',
            checked: true,
            onchange: this.handleCheckAll,
          }),
          'Vybrat všechny',
        ),
        Object.values(speakers.speakerMap).map((coloredSpeaker) => h(
          'label',
          h('input.speaker', {
            type: 'checkbox',
            checked: true,
            value: coloredSpeaker.id,
            onchange: this.handleSpeakersSelection,
          }),
          `${coloredSpeaker.firstname} ${coloredSpeaker.surname}`,
          h(`div.speaker-color${coloredSpeaker.id}.dropdown__color`, {
            style: 'width: 10px; height: 10px;',
          }),
        )),
      ),
    );
    const dropdown = this.el.querySelector(
      '.dropdown__items',
    ) as HTMLInputElement;
    setChildren(dropdown, options);
  };

  private handleDropdown = () => {
    this.el.classList.toggle('visible');
  };

  private render(): HTMLElement {
    return h(
      'div.dropdown',
      h('span.dropdown__anchor', 'Vyznačit mluvčí: ', {
        onclick: this.handleDropdown,
      }),
      h(
        'div.dropdown__items',
      ),
    );
  }
}
