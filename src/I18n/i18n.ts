import en from './locale/en-US.json';

export interface Translations {
  [Key: string]: string
}

let translations: Translations;

export const setLocale = (json: Translations) => {
  translations = json;
};

export const txt = (key: string): string => {
  const enLocale = en as Translations;
  if (translations === undefined) {
    return enLocale[key];
  }
  return translations[key];
};
