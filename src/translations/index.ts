import { fr } from './fr';
import { en } from './en';

export interface Translation {
  [k: string]: Translation | string;
}

export const translations = {
  en,
  fr,
};

export const tr = (translate: (s: string) => string, s: string) =>
  translate(s).replaceAll('\n', '<br>');
