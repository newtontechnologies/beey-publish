import cs from './locale/cs-CZ.json';

export interface Translations {
  [Key: string]: string
}

let translations: Translations;

export const setLocale = (json: Translations) => {
  translations = json;
};

export const txt = (key: string): string => {
  const csLocale = cs as Translations;
  if (translations === undefined) {
    return csLocale[key];
  }
  return translations[key];
};
