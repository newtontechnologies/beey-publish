import {
  h, RedomComponent, mount, unmount,
} from 'redom';
import { Trsx } from '../../trsx';
import { SpeakersSlider, formatTime } from '../SpeakersSlider';
import { TimelineKeyWords } from '../TimelineKeyWords';
import { txt } from '../../I18n/i18n';

export type MediaPlayerEvent = 'play' | 'pause' | 'seeked' | 'timeupdate';
export type MediaListener = (this: HTMLMediaElement, ev: Event) => unknown;

export interface MediaConfig {
  url: string;
  showVideo?: boolean;
}

const PLAYER_SPEED = 'beey-publish-speed';

export class MediaPlayer implements RedomComponent {
  public el: HTMLElement;

  private speakersSlider: SpeakersSlider | null = null;
  private keyWords: TimelineKeyWords | null = null;
  private nativePlayerElement: HTMLVideoElement;
  private seekKnobElement: HTMLInputElement;
  private seekProgressElement: HTMLInputElement;
  private speedSlider: HTMLElement;
  private volumeSlider: HTMLElement;
  private url: string;
  private showVideo: boolean;
  private downloadMedia: boolean;
  private hasSubtitles: boolean;
  private draggingKnob: boolean;
  private showSpeakers: boolean;

  public constructor(
    mediaConfig: MediaConfig,
    showSpeakers: boolean,
    hasSubtitles: boolean,
    downloadMedia: boolean,
  ) {
    this.url = mediaConfig.url;
    this.showVideo = mediaConfig.showVideo ?? true;
    this.hasSubtitles = hasSubtitles;
    this.showSpeakers = showSpeakers;
    this.draggingKnob = false;
    this.url = mediaConfig.url;
    this.downloadMedia = downloadMedia;
    this.el = this.render();
    this.speedSlider = this.el.querySelector('.speed-slider') as HTMLElement;
    this.volumeSlider = this.el.querySelector('.volume-slider') as HTMLElement;
    this.nativePlayerElement = this.el.querySelector('.native-player') as HTMLVideoElement;
    this.seekKnobElement = this.el.querySelector('.seekbar__knob') as HTMLInputElement;
    this.seekProgressElement = this.el.querySelector('.seekbar__progress-bar') as HTMLInputElement;
    document.body.addEventListener('mousedown', () => {
      this.hideSpeedSlider();
      this.hideVolumeSlider();
    });
  }

  public addEventListener(event: MediaPlayerEvent, listener: MediaListener) {
    this.nativePlayerElement.addEventListener(event, listener);
  }

  public removeEventListener(event: MediaPlayerEvent, listener: MediaListener) {
    this.nativePlayerElement.removeEventListener(event, listener);
  }

  public get currentTime(): number {
    return this.nativePlayerElement.currentTime ?? 0;
  }

  public set currentTime(time: number) {
    this.nativePlayerElement.currentTime = time;
  }

  public get duration(): number {
    return this.nativePlayerElement.duration;
  }

  public get paused(): boolean {
    return this.nativePlayerElement.paused;
  }

  public get volume(): number {
    return this.nativePlayerElement.volume;
  }

  public set volume(volume: number) {
    this.nativePlayerElement.volume = volume;
  }

  public play(): void {
    this.nativePlayerElement.play();
  }

  public pause(): void {
    this.nativePlayerElement.pause();
  }

  private handleTogglePlay = () => {
    if (this.paused) {
      this.play();
    } else {
      this.pause();
    }
  };

  public updateTrsx = (trsx: Trsx) => {
    const sliders = this.el.querySelector('.sliders') as HTMLElement;
    this.speakersSlider = new SpeakersSlider(
      trsx,
      this.handlePlaySpeaker,
    );
    if (trsx.speakers.isMachineSpeakers || this.showSpeakers === false) {
      this.speakersSlider.hideSlider();
    }
    mount(sliders, this.speakersSlider);
  };

  public displayKeywords = (trsx: Trsx) => {
    const sliders = this.el.querySelector('.sliders') as HTMLElement;
    const seekbar = this.el.querySelector('.seekbar') as HTMLElement;
    const keyWords = this.el.querySelector('.key-words');
    if (keyWords !== null) {
      unmount(sliders, keyWords);
    }
    this.keyWords = new TimelineKeyWords(
      trsx,
      (time) => { this.currentTime = time; },
    );
    mount(sliders, this.keyWords, seekbar);
  };

  public attachSubtitles = async (subtitlesUrl: string) => {
    const captions = await (await fetch(subtitlesUrl)).text();
    const blob = new Blob([captions], {
      type: 'text/vtt',
    });
    const subtitlesVTT = h('track.subtitles', {
      label: 'Titulky',
      kind: 'captions',
      srcLang: 'cz',
      src: URL.createObjectURL(blob),
    });
    mount(this.nativePlayerElement, subtitlesVTT);
    const tracks = this.nativePlayerElement.textTracks[0];
    tracks.mode = 'hidden';
  };

  private toggleSubtitles = () => {
    const tracks = this.nativePlayerElement.textTracks[0];
    tracks.mode = tracks.mode === 'showing' ? 'hidden' : 'showing';
    const subtitlesButton = this.el.querySelector('.subtitlesButton') as HTMLElement;
    subtitlesButton.textContent = tracks.mode === 'showing' ? 'subtitles' : 'subtitles_off';
  };

  private updateButtons = () => {
    const playButton = this.el.querySelector('.player-button') as HTMLElement;
    const muteButton = this.el.querySelector('.mute-icon') as HTMLElement;
    playButton.textContent = this.nativePlayerElement.paused ? 'play_arrow' : 'pause';
    muteButton.textContent = this.nativePlayerElement.muted ? 'volume_off' : 'volume_up';
  };

  private updateTime = () => {
    const totalDurationElement = this.el.querySelector('.player-time__duration') as HTMLInputElement;
    const knobPosition = (this.currentTime / this.duration) * 100;
    this.seekKnobElement.style.left = `${knobPosition}%`;
    this.seekProgressElement.style.width = `${knobPosition}%`;
    const currentTimeElm = this.el.querySelector('.player-time__current-time') as HTMLElement;
    currentTimeElm.textContent = formatTime(this.currentTime);
    totalDurationElement.textContent = formatTime(this.duration);
  };

  public updateSelectedSpeakers = (speakerIds: string[]) => {
    this.speakersSlider?.updateSelectedSpeakers(speakerIds);
  };

  private handleLoadedMetadata = () => {
    const mediaPlayer = document.querySelector('.media-player') as HTMLElement;
    if (this.nativePlayerElement.videoHeight > 0) {
      mediaPlayer.classList.add('media-player__video');
    }
  };

  private handleToggleMute = (e: PointerEvent) => {
    e.preventDefault();
    this.nativePlayerElement.muted = !this.nativePlayerElement.muted;
  };

  private handleVolumeChange = (e: Event) => {
    const volumeSlider = e.target as HTMLInputElement;
    this.nativePlayerElement.volume = Number(volumeSlider.value) / 100;
  };

  private onVolumeChange = () => {
    this.updateButtons();
    const currentVolume = this.nativePlayerElement.volume;
    const volumeSlider = this.el.querySelector('input.volume-slider') as HTMLInputElement;
    volumeSlider.value = String(currentVolume * 100);
  };

  private handleSpeedChange = (e: Event) => {
    const speedSlider = e.target as HTMLInputElement;
    this.nativePlayerElement.playbackRate = Number(speedSlider.value) / 100;
    window.localStorage.setItem(PLAYER_SPEED, String(this.nativePlayerElement.playbackRate));
  };

  private handleMoveSlider = (e: PointerEvent) => {
    const seekBar = this.el.querySelector('.seekbar__background') as HTMLInputElement;
    const rect = seekBar.getBoundingClientRect();
    const relative = (e.clientX - rect.left) / rect.width;
    let knobPosition = 0;
    if (relative < 0) {
      knobPosition = 0;
    } else if (relative > 1) {
      knobPosition = 1;
    } else {
      knobPosition = relative;
    }
    this.nativePlayerElement.currentTime = knobPosition * this.duration;
  };

  private handlePlaySpeaker = (begin: number) => {
    this.nativePlayerElement.currentTime = begin;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (this.draggingKnob) {
      this.handleMoveSlider(e);
    }
    e.preventDefault();
  };

  private handlePointerDown = (e: PointerEvent & {target: Element}) => {
    e.target.setPointerCapture(e.pointerId);
    this.draggingKnob = true;
  };

  private handlePointerUp = (e: PointerEvent & {target: Element}) => {
    this.handleMoveSlider(e);
    e.target.releasePointerCapture(e.pointerId);
    this.draggingKnob = false;
  };

  private hideSpeedSlider = () => {
    this.speedSlider.classList.remove('speed-slider--show');
  };

  private showSpeedSlider = () => {
    this.speedSlider.classList.add('speed-slider--show');
  };

  private toggleSpeedSlider = (e: PointerEvent) => {
    e.preventDefault();
    this.speedSlider.classList.toggle('speed-slider--show');
  };

  private showVolumeSlider = () => {
    this.volumeSlider.classList.add('volume-slider--show');
  };

  private hideVolumeSlider = () => {
    this.volumeSlider.classList.remove('volume-slider--show');
  };

  private toggleMoreButtons = (e: PointerEvent) => {
    e.preventDefault();
    const hiddenToolbar = this.el.querySelector('.player-toolbar__other-controls') as HTMLElement;
    hiddenToolbar.classList.toggle('player-toolbar__other-controls--show');
  };

  private hideMoreButtons = () => {
    const hiddenToolbar = this.el.querySelector('.player-toolbar__other-controls') as HTMLElement;
    hiddenToolbar.classList.remove('player-toolbar__other-controls--show');
  };

  private downloadFile = () => {
    const a = document.createElement('a');
    a.href = this.url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  private render(): HTMLElement {
    const savedSpeed = window.localStorage.getItem(PLAYER_SPEED);
    return h(
      'div.media-player',
      h(`video.native-player ${this.showVideo ? '' : '.no-display'}`, {
        src: this.url,
        onloadedmetadata: this.handleLoadedMetadata,
        ontimeupdate: this.updateTime,
        onplay: this.updateButtons,
        onpause: this.updateButtons,
        onvolumechange: this.onVolumeChange,
        playbackRate: savedSpeed === null
          ? 1
          : Number(savedSpeed),
      }),
      h(
        'div.media-player__controls',
        {
          onmouseleave: () => {
            this.hideMoreButtons();
            this.hideSpeedSlider();
            this.hideVolumeSlider();
          },
        },
        h(
          'div.player-toolbar',
          h(
            'div.player-toolbar__main',
            h('i.player-button.material-icons', {
              onclick: this.handleTogglePlay,
            }, 'play_arrow'),
            h(
              'div.player-time',
              h('span.player-time__current-time', '0:00'),
              h('span.player-time__divider', '/'),
              h('span.player-time__duration', '0:00'),
            ),
          ),
          h(
            'div.player-toolbar__more',
            h(
              'i.more-icon.icon.material-icons',
              'more_vert',
              {
                onclick: this.toggleMoreButtons,
              },
            ),
            h(
              'div.player-toolbar__other-controls',
              h(
                'div.volume',
                h('i.mute-icon.icon.material-icons', {
                  onclick: this.handleToggleMute,
                  onmouseenter: () => {
                    this.showVolumeSlider();
                    this.hideSpeedSlider();
                  },
                }, 'volume_up'),
                h('input.volume-slider', {
                  type: 'range',
                  max: 100,
                  value: 50,
                  oninput: this.handleVolumeChange,
                  onmouseleave: this.hideVolumeSlider,
                }),
              ),
              h(
                'div.speed',
                h('i.speed-icon.icon.material-icons', 'speed', {
                  onmouseenter: () => {
                    this.showSpeedSlider();
                    this.hideVolumeSlider();
                  },
                  onpointerdown: this.toggleSpeedSlider,
                }),
                h(
                  'div.speed-slider',
                  {
                    onmouseleave: this.hideSpeedSlider,
                  },
                  h('p.speed-slider__text', txt('speed')),
                  h('input.speed-slider__track', {
                    type: 'range',
                    min: 50,
                    max: 200,
                    value: savedSpeed === null
                      ? 100
                      : Number(savedSpeed) * 100,
                    step: 25,
                    oninput: this.handleSpeedChange,
                  }),
                  h(
                    'div.speed-slider__numbers',
                    h('span', '0.5x'),
                    h('span', '0.75x'),
                    h('span', '1x'),
                    h('span', '1.25x'),
                    h('span', '1.5x'),
                    h('span', '1.75x'),
                    h('span', '2x'),
                  ),
                ),
              ),
              h(`i.subtitlesButton.material-icons.icon ${(this.hasSubtitles && this.showVideo) ? 'visible' : 'hidden'}`, 'subtitles_off', {
                onclick: this.toggleSubtitles,
                onmouseenter: this.hideSpeedSlider,
              }),
              h(`i.file_download.material-icons.icon ${(this.downloadMedia) ? 'visible' : 'hidden'}`, 'file_download', {
                onclick: this.downloadFile,
              }),
            ),
          ),
        ),
        h(
          'div.sliders',
          h(
            'div.seekbar.playback',
            h(
              'div.seekbar__background',
              h('div.seekbar__progress-bar'),
              h('div.seekbar__knob'),
              {
                onpointerdown: this.handlePointerDown,
                onpointermove: this.handlePointerMove,
                onpointerup: this.handlePointerUp,
              },
            ),
          ),
        ),
      ),
      h(
        'svg',
        h('use', { 'xlink:href': '#kw-mark' }),
      ),
    );
  }
}
