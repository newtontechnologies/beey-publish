import { h, mount } from 'redom';
import { Keyword, Trsx, attachKeywords } from './trsx';
import { MediaPlayer, MediaConfig } from './components/MediaPlayer';
import { TrsxFile, TrsxSource } from './trsx-file';
import { Transcript, TranscriptConfig } from './components/Transcript';

export interface BeeyPublishConfig {
  media: MediaConfig
  transcript?: TranscriptConfig;
  subtitlesUrl?: string;
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

  public constructor(slot: PublishSlot, config: BeeyPublishConfig) {
    this.slot = slot;
    this.config = config;
    this.player = new MediaPlayer(this.config.media, this.config.subtitlesUrl !== undefined);
    this.transcript = new Transcript(
      this.player,
      this.config.transcript ?? {},
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
    attachKeywords(keywords, this.trsx);
    this.transcript.updateTrsx(this.trsx);
    this.player.displayKeywords(this.trsx);
  }

  private handleSelectedSpeakers = (speakerIds: string[]) => {
    this.player.updateSelectedSpeakers(speakerIds);
  };
}

export default BeeyPublish;
