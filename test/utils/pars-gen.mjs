/* eslint-disable no-console */

import { promises as fs } from 'fs';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.round(((time % 60) + Number.EPSILON) * 1000) / 1000;

  if (minutes === 0) {
    return `PT${seconds}S`;
  }

  return `PT${minutes}M${seconds}S`;
};

const generateXML = (paragraphs) => {
  let result = '';
  let time = 1.05;
  const charTime = 0.075;

  paragraphs.forEach((par) => {
    const begin = time;
    const end = par.phrases.reduce((sum, phrase) => sum + phrase.length * charTime, time);
    result += `<pa s="${par.speaker}" b="${formatTime(begin)}" e="${formatTime(end)}" scribeForceLabel="true">\n`;
    par.phrases.forEach((phrase) => {
      const phraseEnd = time + phrase.length * charTime;
      result += `  <p b="${formatTime(time)}" e="${formatTime(phraseEnd)}">${phrase}</p>\n`;
      time = phraseEnd;
    });

    result += '</pa>\n';
  });

  return result;
};

const file = process.argv[2];
const fileContent = await fs.readFile(file, 'utf8');
const paragraphs = JSON.parse(fileContent);

console.info(generateXML(paragraphs));
