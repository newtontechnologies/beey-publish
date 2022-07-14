import { h, RedomComponent, mount } from 'redom';
import { Trsx } from '../../trsx';
import { SpeakersSlider, formatTime } from '../SpeakersSlider';
import { KeyWords } from '../KeyWords';

export type MediaPlayerEvent = 'play' | 'pause' | 'seeked' | 'timeupdate';
export type MediaListener = (this: HTMLMediaElement, ev: Event) => unknown;

export interface MediaConfig {
  url: string;
  hasVideo: boolean;
}

const PLAYER_SPEED = 'beey-publish-speed';

export class MediaPlayer implements RedomComponent {
  public el: HTMLElement;

  private speakersSlider: SpeakersSlider | null = null;
  private keyWords: KeyWords | null = null;
  private nativePlayerElement: HTMLVideoElement;
  private seekKnobElement: HTMLInputElement;
  private seekProgressElement: HTMLInputElement;
  private speedSlider: HTMLElement;
  private mediaConfig: MediaConfig;
  private draggingKnob: boolean;

  public constructor(mediaConfig: MediaConfig) {
    this.mediaConfig = mediaConfig;
    this.draggingKnob = false;
    this.el = this.render();
    this.speedSlider = this.el.querySelector('.speed-slider') as HTMLElement;
    this.nativePlayerElement = this.el.querySelector('.native-player') as HTMLVideoElement;
    this.seekKnobElement = this.el.querySelector('.seekbar__knob') as HTMLInputElement;
    this.seekProgressElement = this.el.querySelector('.seekbar__progress-bar') as HTMLInputElement;
    document.body.addEventListener('mousedown', () => {
      this.hideSpeedSlider();
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
    if (trsx.speakers.isMachineSpeakers) {
      this.speakersSlider.hideSlider();
    }
    mount(sliders, this.speakersSlider);
  };

  public displayKeywords = (trsx: Trsx) => {
    const sliders = this.el.querySelector('.sliders') as HTMLElement;
    const seekbar = this.el.querySelector('.seekbar') as HTMLElement;
    this.keyWords = new KeyWords(
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
    const totalDurationElement = this.el.querySelector('.seekbar__duration') as HTMLInputElement;
    const knobPosition = (this.currentTime / this.duration) * 100;
    this.seekKnobElement.style.left = `${knobPosition}%`;
    this.seekProgressElement.style.width = `${knobPosition}%`;
    const currentTimeElm = this.el.querySelector('.seekbar__current-time') as HTMLElement;
    currentTimeElm.textContent = formatTime(this.currentTime);
    totalDurationElement.textContent = formatTime(this.duration);
  };

  public updateSelectedSpeakers = (speakerIds: string[]) => {
    this.speakersSlider?.updateSelectedSpeakers(speakerIds);
  };

  private handleLoadedMetadata = () => {
    this.speakersSlider?.updateDuration(formatTime(this.nativePlayerElement.duration));
    const mediaPlayer = document.querySelector('.media-player') as HTMLElement;
    if (this.nativePlayerElement.videoHeight > 0) {
      this.nativePlayerElement.style.display = 'flex';
      mediaPlayer.classList.add('media-player__video');
    }
  };

  private handleToggleMute = () => {
    this.nativePlayerElement.muted = !this.nativePlayerElement.muted;
  };

  private handleVolumeChange = (e: Event) => {
    const volumeSlider = e.target as HTMLInputElement;
    this.nativePlayerElement.volume = Number(volumeSlider.value) / 100;
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

  private render(): HTMLElement {
    const savedSpeed = window.localStorage.getItem(PLAYER_SPEED);
    return h(
      'div.media-player',
      h('video.native-player', {
        src: this.mediaConfig.url,
        onloadedmetadata: this.handleLoadedMetadata,
        ontimeupdate: this.updateTime,
        onplay: this.updateButtons,
        onpause: this.updateButtons,
        onvolumechange: this.updateButtons,
        playbackRate: savedSpeed === null
          ? 1
          : Number(savedSpeed),
      }),
      h(
        'div.media-player__controls',
        h('i.player-button.material-icons', {
          onclick: this.handleTogglePlay,
        }, 'play_arrow'),
        h(
          'div.volume',
          h('i.mute-icon.material-icons', {
            onclick: this.handleToggleMute,
          }, 'volume_up'),
          h('input.volume-slider', {
            type: 'range',
            max: 100,
            value: 50,
            oninput: this.handleVolumeChange,
          }),
        ),
        h(
          'div.sliders',
          h(
            'div.seekbar',
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
        h(
          'div.player-toolbar',
          h(
            'div.speed',
            h('i.speed-icon.material-icons', 'speed', {
              onmouseenter: this.showSpeedSlider,
              onpointerdown: this.toggleSpeedSlider,
            }),
            h(
              'div.speed-slider',
              {
                onmouseleave: this.hideSpeedSlider,
              },
              h('p.speed-slider__text', 'Rychlost přehrávání'),
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
          h('i.subtitlesButton.material-icons', 'subtitles_off', {
            onclick: this.toggleSubtitles,
          }),
        ),

      ),
      h(
        'svg',
        h('use', { 'xlink:href': '#kw-mark' }),
      ),
    );
  }
}
