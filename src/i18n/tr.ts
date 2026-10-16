import frUi from './fr-ui.json';
import { useLanguage, Lang } from './LanguageContext';

const FR = frUi as Record<string, string>;
let current: Lang = 'en';

export const setTrLanguage = (lang: Lang) => {
  current = lang;
};

const MONTHS: Record<string, string> = { March: 'mars', September: 'septembre' };
const SEASONS: Record<string, string> = { Spring: 'Printemps', Autumn: 'Automne' };

/** Labels built from data (intakes) that cannot live in the static dictionary. */
const patternFr = (text: string): string | undefined => {
  let m = text.match(/^(Spring|Autumn) \((March|September)(?: (\d{4}))?\)$/);
  if (m) return `${SEASONS[m[1]]} (${MONTHS[m[2]]}${m[3] ? ` ${m[3]}` : ''})`;
  m = text.match(/^(March|September) (\d{4})$/);
  if (m) return `${MONTHS[m[1]]} ${m[2]}`;
  m = text.match(/^(Spring|Autumn) Intake$/);
  if (m) return m[1] === 'Spring' ? 'Rentrée de printemps' : 'Rentrée d’automne';
  return undefined;
};

export const tr = (text: string) => {
  if (current !== 'fr' || !text) return text;
  return FR[text] ?? patternFr(text) ?? text;
};

/** Subscribe a component to language changes and return tr. */
export const useTr = () => {
  const { lang } = useLanguage();
  current = lang;
  return tr;
};
