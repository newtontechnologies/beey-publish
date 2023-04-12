import { h, mount } from 'redom';
import { Keyword, Trsx, attachKeywords } from './trsx';
import { MediaPlayer, MediaConfig } from './components/MediaPlayer';
import { TrsxFile, TrsxSource } from './trsx-file';
import { Transcript, TranscriptConfig } from './components/Transcript';
import { setLocale, Translations } from './I18n/i18n';
import en from './I18n/en-US.json';

export interface BeeyPublishConfig {
  media: MediaConfig;
  transcript?: TranscriptConfig;
  subtitlesUrl?: string;
  locale?: Translations;
  showSpeakers?: boolean;
}

export interface StyleConfig {
  primaryColor: string;
  primaryColorDarken: string;
  lightGray: string;
  lightGrayLighten: string;
  bgGray: string;
  darkGray: string;
}

export interface PublishSplitSlot {
  playerParent: HTMLElement,
  transcriptParent: HTMLElement,
}

export type PublishSlot = HTMLElement | PublishSplitSlot;
class BeeyPublish {
  private slot: PublishSlot;
  private player: MediaPlayer;
  private transcript: Transcript;
  private config: BeeyPublishConfig;
  private trsx: Trsx | null = null;
  private locale: Translations | undefined;

  public constructor(slot: PublishSlot, config: BeeyPublishConfig) {
    this.slot = slot;
    this.config = config;
    setLocale(this.config.locale !== undefined ? this.config.locale : en);
    this.player = new MediaPlayer(
      this.config.media,
      this.config.showSpeakers ?? true,
      this.config.subtitlesUrl !== undefined,
    );
    this.transcript = new Transcript(
      this.player,
      this.config.transcript ?? {},
      this.config.showSpeakers ?? true,
      this.handleSelectedSpeakers,
    );

    if (this.slot instanceof HTMLElement) {
      mount(this.slot, h(
        'div',
        this.player,
        this.transcript,
      ));
    } else {
      mount(this.slot.playerParent, this.player);
      mount(this.slot.transcriptParent, this.transcript);
    }
  }

  public get mediaPlayer(): MediaPlayer {
    return this.player;
  }

  public async loadTrsx(trsxSource: TrsxSource): Promise<void> {
    this.trsx = await new TrsxFile(trsxSource).parse();
    this.transcript.updateTrsx(this.trsx);
    this.player.updateTrsx(this.trsx);
    if (this.config.subtitlesUrl !== undefined) {
      this.player.attachSubtitles(this.config.subtitlesUrl);
    }
  }

  public attachKeywords(keywords: Keyword[]) {
    if (this.trsx === null) {
      return;
    }
    this.trsx.keywordOccurences = [];
    attachKeywords(keywords, this.trsx);
    this.transcript.updateTrsx(this.trsx);
    this.player.displayKeywords(this.trsx);
  }

  // eslint-disable-next-line class-methods-use-this
  public setStyle(styleConfig: StyleConfig) {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', styleConfig.primaryColor);
    root.style.setProperty('--primary-color-darken', styleConfig.primaryColorDarken);
    root.style.setProperty('--light-gray', styleConfig.lightGray);
    root.style.setProperty('--light-gray-lighten', styleConfig.lightGrayLighten);
    root.style.setProperty('--bg-gray', styleConfig.bgGray);
    root.style.setProperty('--dark-gray', styleConfig.darkGray);
  }

  private handleSelectedSpeakers = (speakerIds: string[]) => {
    this.player.updateSelectedSpeakers(speakerIds);
  };
}

export default BeeyPublish;
