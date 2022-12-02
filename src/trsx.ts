export interface PhraseMention {
  indices: number[];
}

export interface SpeakerMention {
  speakerId: number | number[];
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
  keywordInstances: KeywordInstance[],
}
export interface Speaker {
  firstname: string | null;
  surname: string;
  unknown: boolean;
  id: string;
}
export interface Paragraph {
  speaker: Speaker;
  begin: number;
  end: number;
  phrases: Phrase[];
  speakerKeywordInstances: KeywordInstance[],
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
    // eslint-disable-next-line no-param-reassign
    paragraph.speakerKeywordInstances = [];

    for (let i = 0; i < phrases.length; i += 1) {
      const phrase = phrases[i] as Phrase;
      if (phrase.keywordInstances.length > 0) {
        phrase.keywordInstances = [];
      }
    }
  },
);

export const extractKeywordsClassNames = (
  prefix: string,
  instances: KeywordInstance[],
): string[] => instances.flatMap((instance): string[] => {
  const { group } = instance.keyword;

  if (Array.isArray(group)) {
    return group.map((g) => `${prefix}-${g.id}`);
  }

  if (group === undefined) {
    return [];
  }

  return [`${prefix}-${group.id}`];
});

export const attachKeywords = (keywords: Keyword[], trsx: Trsx) => {
  const { paragraphs } = trsx;

  clearKeywords(paragraphs);

  keywords.forEach((keyword: Keyword) => {
    keyword.mentions.forEach((mention) => {
      if (isSpeakerMention(mention)) {
        const speakerIds: number[] = Array.isArray(mention.speakerId)
          ? mention.speakerId
          : [mention.speakerId];

        paragraphs.forEach((paragraph) => {
          const { speaker } = paragraph;
          if (speakerIds.includes(Number(speaker.id))) {
            const instance = {
              keyword,
              begin: paragraph.begin,
            };
            trsx.keywordInstances.push(instance);
            paragraph.speakerKeywordInstances.push(instance);
          }
        });
      } else {
        const instance = {
          keyword,
          begin: -1,
        };

        mention.indices.forEach((phraseIndex) => {
          const phrase = trsx.phrases[phraseIndex];
          if (instance.begin === -1) {
            instance.begin = phrase.begin;
          }
          phrase.keywordInstances.push(instance);
        });

        trsx.keywordInstances.push(instance);
      }
    });
  });
};
