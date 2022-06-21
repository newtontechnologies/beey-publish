import {
  Phrase, Paragraph, Trsx, SpeakerMap, Speaker, Speakers,
} from './trsx';

export interface UrlTrsxSource {
  url: string,
}

export interface ContentTrsxSource {
  content: string,
}

export type TrsxSource = UrlTrsxSource | ContentTrsxSource;

const parseTimeStamp = (str: string | null): number => {
  if (str === null) {
    return NaN;
  }

  const matches = str.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (matches == null) {
    return NaN;
  }

  return (
    parseFloat(matches[1] ?? '0') * 60 * 60
    + parseFloat(matches[2] ?? '0') * 60
    + parseFloat(matches[3] ?? '0')
  );
};

const isSpeakerUknown = (speakerElement: Element): boolean => {
  const attempt1 = speakerElement.querySelector('a[name="unknown"]');
  if (attempt1 !== null) {
    return true;
  }

  const surname = speakerElement.getAttribute('surname') as string;
  return /^nonspeech|S[0-9]{4,}$/.test(surname);
};

const extractPhrases = (paragraphElement: Element, offset: number): Phrase[] => {
  const phrases = Array.from(paragraphElement.querySelectorAll('p'));
  return (
    phrases
      .map((phraseElement, index): Phrase => ({
        index: offset + index,
        begin: parseTimeStamp(phraseElement.getAttribute('b')),
        end: parseTimeStamp(phraseElement.getAttribute('e')),
        text: (phraseElement.textContent ?? '').replace(/\[\S*::\S*\]/g, ''),
        kwClasses: [],
      }))
  );
};

const extractSpeakers = (xmlDoc: XMLDocument): Speakers => {
  const speakerMap: SpeakerMap = {};
  const trsxSpeakers = xmlDoc.querySelectorAll('sp s');
  trsxSpeakers.forEach((speakerElement) => {
    const id = speakerElement.getAttribute('id') as string;

    speakerMap[id] = {
      id,
      firstname: speakerElement.getAttribute('firstname') as string,
      surname: speakerElement.getAttribute('surname') as string,
      unknown: isSpeakerUknown(speakerElement),
      kwClasses: [],
    };
  });
  const isMachineSpeakers = Object.values(speakerMap).some((speaker) => speaker.firstname === '' && speaker.surname.startsWith('S0'));
  return { isMachineSpeakers, speakerMap };
};

const extractParagraphs = (
  xmlDoc: XMLDocument,
  speakers: SpeakerMap,
): Paragraph[] => {
  const elements = Array.from(xmlDoc.getElementsByTagName('pa'));
  const paragraphs: Paragraph[] = [];
  let lastParagraph: Paragraph | null = null;
  let phrasesOffset = 0;

  elements.forEach((element) => {
    const phrases = extractPhrases(element, phrasesOffset);
    if (phrases.length === 0) {
      return;
    }
    phrasesOffset += phrases.length;

    const speakerId = element.getAttribute('s') as string;
    const end = parseTimeStamp(element.getAttribute('e'));

    if (lastParagraph !== null && lastParagraph.speaker.id === speakerId) {
      lastParagraph.phrases.push(...phrases);
      lastParagraph.end = end;
      return;
    }

    lastParagraph = {
      speaker: speakers[speakerId] as Speaker,
      begin: parseTimeStamp(element.getAttribute('b')),
      end,
      phrases,
    };
    paragraphs.push(lastParagraph);
  });

  return paragraphs;
};

export class TrsxFile {
  private trsxSource: TrsxSource;

  public constructor(trsxSource: TrsxSource) {
    this.trsxSource = trsxSource;
  }

  public async parse(): Promise<Trsx> {
    const trsxString = 'url' in this.trsxSource
      ? await (await fetch(this.trsxSource.url)).text()
      : this.trsxSource.content;

    const xmlDoc = new DOMParser().parseFromString(trsxString, 'text/xml');
    const speakers = extractSpeakers(xmlDoc);
    const paragraphs = extractParagraphs(xmlDoc, speakers.speakerMap);
    const recordingDuration = paragraphs[paragraphs.length - 1]?.end ?? 0;
    const phrases = paragraphs.flatMap((paragraph) => paragraph.phrases);

    return {
      speakers, phrases, paragraphs, recordingDuration, keywordInstances: [],
    };
  }
}
