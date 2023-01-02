export interface PhraseMention {
  indices: number[];
}

type SpeakerPartKey = 'firstname' | 'surname' | 'role';

export interface SpeakerMention {
  speakerId: number | string;
  accent?: SpeakerPartKey[] | SpeakerPartKey;
  query: string;
}

export type SpeakerParts = {
  [Key in SpeakerPartKey as string]: {
    className: string,
    text: string,
  }
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

export interface BaseKeywordOccurence {
  group?: KeywordGroup | KeywordGroup[],
  begin: number;
}

export interface PhraseKeywordOccurence extends BaseKeywordOccurence{
  text: string;
}

export interface SpeakerKeywordOccurence extends PhraseKeywordOccurence {
  accent?: SpeakerPartKey[] | SpeakerPartKey;
}

export interface Phrase {
  index: number;
  begin: number;
  end: number;
  text: string;
  keywordOccurences: PhraseKeywordOccurence[],
}
export interface Speaker {
  firstname: string | null;
  surname: string;
  role?: string | null;
  unknown: boolean;
  id: string;
}
export interface Paragraph {
  speaker: Speaker | null;
  begin: number;
  end: number;
  phrases: Phrase[];
  speakerKeywordOccurences: SpeakerKeywordOccurence[],
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
  keywordOccurences: PhraseKeywordOccurence[];
}

const isSpeakerMention = (mention: Mention): mention is SpeakerMention => 'speakerId' in mention;

const clearKeywords = (paragraphs: Paragraph[]): void => paragraphs.forEach(
  (paragraph) => {
    const { phrases } = paragraph;
    // eslint-disable-next-line no-param-reassign
    paragraph.speakerKeywordOccurences = [];

    for (let i = 0; i < phrases.length; i += 1) {
      const phrase = phrases[i] as Phrase;
      if (phrase.keywordOccurences.length > 0) {
        phrase.keywordOccurences = [];
      }
    }
  },
);

export const extractKeywordsClassNames = (
  prefix: string,
  occurences: BaseKeywordOccurence[],
): string[] => occurences.flatMap(({ group }): string[] => {
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
        paragraphs.forEach((paragraph) => {
          const { speaker } = paragraph;
          if (Number(mention.speakerId) === Number(speaker?.id)) {
            const occurence: SpeakerKeywordOccurence = {
              group: keyword.group,
              begin: paragraph.begin,
              accent: mention.accent,
              text: keyword.text,
            };
            trsx.keywordOccurences.push(occurence);
            paragraph.speakerKeywordOccurences.push(occurence);
          }
        });
      } else {
        const occurence: PhraseKeywordOccurence = {
          group: keyword.group,
          begin: -1,
          text: keyword.text,
        };

        mention.indices.forEach((phraseIndex) => {
          const phrase = trsx.phrases[phraseIndex];
          if (occurence.begin === -1) {
            occurence.begin = phrase.begin;
          }
          phrase.keywordOccurences.push(occurence);
        });

        trsx.keywordOccurences.push(occurence);
      }
    });
  });
};
