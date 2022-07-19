const alice = {
  id: '1',
  firstname: 'Alice',
  surname: 'Thompson',
  unknown: false,
  kwClasses: [],
};

const bob = {
  id: '2',
  firstname: 'Bob',
  surname: 'Hansen',
  unknown: false,
  kwClasses: [],
};

const phrases = [
  {
    index: 0, begin: 1.05, end: 1.725, text: 'Habitant ', kwClasses: [],
  },
  {
    index: 1, begin: 1.725, end: 2.325, text: 'tempor, ', kwClasses: [],
  },
  {
    index: 2, begin: 2.325, end: 2.85, text: 'Petrus ', kwClasses: [],
  },
  {
    index: 3, begin: 2.85, end: 3.525, text: 'Rogelius ', kwClasses: [],
  },
  {
    index: 4, begin: 3.525, end: 3.975, text: 'massa ', kwClasses: [],
  },
  {
    index: 5, begin: 3.975, end: 4.35, text: 'diam ', kwClasses: [],
  },
  {
    index: 6, begin: 4.35, end: 4.8, text: 'curae.', kwClasses: [],
  },
  {
    index: 7, begin: 4.8, end: 5.55, text: 'Phasellus ', kwClasses: [],
  },
  {
    index: 8, begin: 5.55, end: 6, text: 'massa ', kwClasses: [],
  },
  {
    index: 9, begin: 6, end: 6.525, text: 'Petrus ', kwClasses: [],
  },
  {
    index: 10, begin: 6.525, end: 7.125, text: 'dapibus?', kwClasses: [],
  },
  {
    index: 11, begin: 7.125, end: 7.725, text: 'Libero! ', kwClasses: [],
  },
  {
    index: 12, begin: 7.725, end: 8.175, text: 'Nulla ', kwClasses: [],
  },
  {
    index: 13, begin: 8.175, end: 8.85, text: 'Rogelius ', kwClasses: [],
  },
  {
    index: 14, begin: 8.85, end: 9.75, text: 'ullamcorper.', kwClasses: [],
  },
];

export const simpleTrsx = {
  speakers: {
    isMachineSpeakers: false,
    speakerMap: { 1: alice, 2: bob },
  },
  phrases,
  paragraphs: [
    {
      speaker: alice,
      begin: 1.05,
      end: 4.8,
      phrases: [phrases[0], phrases[1], phrases[2], phrases[3], phrases[4], phrases[5], phrases[6]],
    },
    {
      speaker: bob,
      begin: 4.8,
      end: 7.125,
      phrases: [phrases[7], phrases[8], phrases[9], phrases[10]],
    },
    {
      speaker: alice,
      begin: 7.125,
      end: 7.725,
      phrases: [phrases[11]],
    },
    {
      speaker: bob,
      begin: 7.725,
      end: 9.75,
      phrases: [phrases[12], phrases[13], phrases[14]],
    },
  ],
  recordingDuration: 9.75,
  keywordInstances: [],
};

const kwPhrases = [...phrases];
kwPhrases[2] = { ...phrases[2], kwClasses: ['kw-entity-person', 'kw-entity-name'] };
kwPhrases[3] = { ...phrases[3], kwClasses: ['kw-entity-person'] };
kwPhrases[9] = { ...phrases[9], kwClasses: ['kw-entity-person', 'kw-entity-name'] };
kwPhrases[13] = { ...phrases[13], kwClasses: ['kw-entity-person'] };

const rogeliusKeyword = {
  text: 'Petrus Rogelius',
  group: {
    id: 'entity-person',
    label: 'Person',
  },
  mentions: [
    { indices: [2, 3] },
    { indices: [9] },
    { indices: [13] },
  ],
};

const petrusKeyword = {
  text: 'Petrus',
  group: {
    id: 'entity-name',
    label: 'Name',
  },
  mentions: [
    { indices: [2] },
    { indices: [9] },
  ],
};

export const simpleTrsxWithKeywords = {
  ...simpleTrsx,
  phrases: kwPhrases,
  paragraphs: [
    {
      speaker: alice,
      begin: 1.05,
      end: 4.8,
      phrases: [
        kwPhrases[0], kwPhrases[1], kwPhrases[2], kwPhrases[3],
        kwPhrases[4], kwPhrases[5], kwPhrases[6],
      ],
    },
    {
      speaker: bob,
      begin: 4.8,
      end: 7.125,
      phrases: [kwPhrases[7], kwPhrases[8], kwPhrases[9], kwPhrases[10]],
    },
    {
      speaker: alice,
      begin: 7.125,
      end: 7.725,
      phrases: [kwPhrases[11]],
    },
    {
      speaker: bob,
      begin: 7.725,
      end: 9.75,
      phrases: [kwPhrases[12], kwPhrases[13], kwPhrases[14]],
    },
  ],
  keywordInstances: [
    {
      keyword: rogeliusKeyword,
      begin: 2.325,
    },
    {
      keyword: rogeliusKeyword,
      begin: 6,
    },
    {
      keyword: rogeliusKeyword,
      begin: 8.175,
    },
    {
      keyword: petrusKeyword,
      begin: 2.325,
    },
    {
      keyword: petrusKeyword,
      begin: 6,
    },
  ],
};
