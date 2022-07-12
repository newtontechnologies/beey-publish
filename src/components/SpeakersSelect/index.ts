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

  private reportSelectedSpeakers = () => {
    const selectedIds = [] as string[];
    const speakers = this.el.querySelectorAll('.speaker') as NodeListOf<HTMLInputElement>;
    speakers.forEach((speaker) => {
      if (speaker.checked) {
        selectedIds.push(speaker.value);
      }
    });
    this.onSelectedSpeakers(selectedIds);
  };

  private handleSpeakersSelection = () => {
    const speakers = Array.from(this.el.querySelectorAll('.speaker') as NodeListOf<HTMLInputElement>);
    const checkAll = this.el.querySelector('.check-all__checkbox') as HTMLInputElement;
    checkAll.checked = speakers.every((speaker) => speaker.checked === true);
    this.reportSelectedSpeakers();
  };

  private handleSelectAll = (e: Event) => {
    const speakers = this.el.querySelectorAll('.speaker') as NodeListOf<HTMLInputElement>;
    for (let i = 0; i < speakers.length; i += 1) {
      speakers[i].checked = (e.target as HTMLInputElement).checked;
    }
    this.reportSelectedSpeakers();
  };

  public colorCode = (id : string) => {
    let code = '';
    if (Number(id) <= 16) {
      code = id;
    } else {
      code = String(Number(id) - 16);
    }
    return code;
  };

  public updateSpeakers = (speakers: Speakers) => {
    if (speakers.isMachineSpeakers) {
      this.el.style.display = 'none';
    }
    const options = [
      h(
        'div',
        h(
          'label.check-all__label',
          h('input.check-all__checkbox', {
            type: 'checkbox',
            checked: true,
            onchange: this.handleSelectAll,
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
          h(`div.speaker-color${this.colorCode(coloredSpeaker.id)}.dropdown__color`, {
            style: 'width: 10px; height: 10px;',
          }),
        )),
      )];

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
