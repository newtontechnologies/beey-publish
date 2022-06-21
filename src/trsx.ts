export interface PhraseMention {
  indices: number[];
}

export interface SpeakerMention {
  speakerId: number;
  query: string;
}

type Mention = PhraseMention | SpeakerMention;

export interface KeywordGroup {
  id: string;
  label: string;
}

export interface Keyword {
  text: string;
  mentions: Mention[];
  group?: KeywordGroup | KeywordGroup[],
}

export interface KeywordInstance {
  keyword: Keyword;
  begin: number;
}

export interface Phrase {
  index: number;
  begin: number;
  end: number;
  text: string;
  kwClasses: string[];
}
export interface Speaker {
  firstname: string | null;
  surname: string;
  unknown: boolean;
  id: string;
  kwClasses: string[];
}
export interface Paragraph {
  speaker: Speaker;
  begin: number;
  end: number;
  phrases: Phrase[];
}

export type SpeakerMap = { [id: string]: Speaker };

export type Speakers = {
  isMachineSpeakers: boolean,
  speakerMap: SpeakerMap
}

export interface Trsx {
  speakers: Speakers;
  phrases: Phrase[],
  paragraphs: Paragraph[];
  recordingDuration: number;
  keywordInstances: KeywordInstance[];
}

const isSpeakerMention = (mention: Mention): mention is SpeakerMention => 'speakerId' in mention;

const clearKeywords = (paragraphs: Paragraph[]): void => paragraphs.forEach(
  (paragraph) => {
    const { phrases } = paragraph;
    const { speaker } = paragraph;
    speaker.kwClasses = [];
    for (let i = 0; i < phrases.length; i += 1) {
      const phrase = phrases[i] as Phrase;
      if (phrase.kwClasses.length > 0) {
        phrase.kwClasses = [];
      }
    }
  },
);

export const extractClassNames = (keyword: Keyword): string[] => {
  if (Array.isArray(keyword.group)) {
    return keyword.group.map((group) => `kw-${group.id}`);
  }

  if (keyword.group === undefined) {
    return [];
  }

  return [`kw-${keyword.group.id}`];
};

export const attachKeywords = (keywords: Keyword[], trsx: Trsx) => {
  const { paragraphs } = trsx;

  clearKeywords(paragraphs);

  keywords.forEach((keyword: Keyword) => {
    const classNames = extractClassNames(keyword);

    keyword.mentions.forEach((mention) => {
      if (isSpeakerMention(mention)) {
        paragraphs.forEach((paragraph) => {
          const { speaker } = paragraph;
          if (Number(speaker.id) === mention.speakerId) {
            trsx.keywordInstances.push({
              keyword,
              begin: paragraph.begin,
            });
          }

          speaker.kwClasses.push(...classNames);
        });
      } else {
        let begin = -1;
        mention.indices.forEach((phraseIndex) => {
          const phrase = trsx.phrases[phraseIndex];
          if (begin === -1) {
            begin = phrase.begin;
          }
          phrase.kwClasses.push(...classNames);
        });

        trsx.keywordInstances.push({ keyword, begin });
      }
    });
  });
};
