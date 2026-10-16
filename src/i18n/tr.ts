import frUi from './fr-ui.json';
import { useLanguage, Lang } from './LanguageContext';

/**
 * Translation of interface texts written in English inside components
 * (application form, student dashboard, sign-in…). The English text is the key;
 * French versions live in fr-ui.json. Missing keys fall back to English.
 */
const FR = frUi as Record<string, string>;
let current: Lang = 'en';

export const setTrLanguage = (lang: Lang) => {
  current = lang;
};

export const tr = (text: string): string => {
  if (current !== 'fr') return text;
  const v = FR[text];
  return v === undefined ? text : v;
};

/** Subscribe a component to language changes so tr() re-renders. */
export const useTr = () => {
  const { lang } = useLanguage();
  current = lang;
  return tr;
};
