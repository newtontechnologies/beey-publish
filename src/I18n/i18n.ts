import cs from './locale/cs-CZ.json';

export interface Translations {
  [Key: string]: string
}

let translations: Translations;

export const setLocale = (json: Translations) => {
  translations = json;
};

export const txt = (key: string): string => {
  if (translations === undefined) {
    return cs[key];
  }
  return translations[key];
};
