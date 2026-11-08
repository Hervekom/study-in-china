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
const t = (x: string) => FR[x] ?? x;
const patternFr = (text: string): string | undefined => {
  let m = text.match(/^(Spring|Autumn) \((March|September)(?: (\d{4}))?\)$/);
  if (m) return `${SEASONS[m[1]]} (${MONTHS[m[2]]}${m[3] ? ` ${m[3]}` : ''})`;
  m = text.match(/^(March|September) (\d{4})$/);
  if (m) return `${MONTHS[m[1]]} ${m[2]}`;
  m = text.match(/^(Spring|Autumn) Intake$/);
  if (m) return m[1] === 'Spring' ? 'Rentrée de printemps' : 'Rentrée d’automne';

  // Account messages written by the admissions team's tools (stored in English)
  m = text.match(/^Application update: (.+)$/);
  if (m) return `Mise à jour du dossier : ${t(m[1])}`;
  m = text.match(/^Your application has moved to a new stage: (.+)\. See the progress tracker in your account for details\.$/);
  if (m) return `Votre dossier est passé à une nouvelle étape : ${t(m[1])}. Consultez le suivi dans votre compte pour les détails.`;
  m = text.match(/^Document (verified|received): (.+)$/);
  if (m) return `${m[1] === 'verified' ? 'Document vérifié' : 'Document reçu'} : ${t(m[2])}`;
  m = text.match(/^Action required: (.+)$/);
  if (m) return `Action requise : ${t(m[1])}`;
  m = text.match(/^Your document "(.+)" has been checked and verified by our admissions team\. No action is needed\.$/);
  if (m) return `Votre document « ${t(m[1])} » a été vérifié et validé par notre équipe d’admission. Aucune action n’est nécessaire.`;
  m = text.match(/^We need a new version of your document "(.+)"\.\n\n([\s\S]*)\n\nPlease upload it from the Documents tab of your account\.$/);
  if (m) return `Nous avons besoin d’une nouvelle version de votre document « ${t(m[1])} ».\n\n${m[2]}\n\nMerci de l’envoyer depuis l’onglet Documents de votre compte.`;
  m = text.match(/^Payment received: Stage (\d)$/);
  if (m) return `Paiement reçu : étape ${m[1]}`;
  m = text.match(/^We confirm receipt of your Stage (\d) (initial deposit|admission payment|final payment) \(\$([\d,]+) USD\)\. Your receipt is available in the Payments tab\. Thank you!$/);
  if (m) {
    const what = { 'initial deposit': 'acompte initial', 'admission payment': 'paiement d’admission', 'final payment': 'paiement final' }[m[2]];
    return `Nous confirmons la réception de votre ${what} de l’étape ${m[1]} (${m[3].replace(/,/g, ' ')} $ USD). Votre reçu est disponible dans l’onglet Paiements. Merci !`;
  }
  m = text.match(/^Acknowledgment of receipt: we have received your document "(.+?)"(?: \((.+)\))?\. Our team will review it and let you know if anything is needed\.$/);
  if (m) return `Accusé de réception : nous avons bien reçu votre document « ${t(m[1])} »${m[2] ? ` (${m[2]})` : ''}. Notre équipe va le vérifier et vous dira si quelque chose est nécessaire.`;
  m = text.match(/^Welcome (.*)! Your application (\S+) has been received\. All communication about your file happens here, in your account: your advisor will post the instructions for the \$(\d+) initial deposit in these Messages, and you will receive an email each time a new message arrives\.$/);
  if (m) return `Bienvenue ${m[1]} ! Votre candidature ${m[2]} a bien été reçue. Toute la communication sur votre dossier se fait ici, dans votre compte : votre conseiller publiera les instructions pour l’acompte initial de ${m[3]} $ dans ces Messages, et vous recevrez un e-mail à chaque nouveau message.`;
  m = text.match(/^Hello, I would like to pay the (.+) for my application (\S+)\. Could you send me the payment instructions\?$/);
  if (m) return `Bonjour, je souhaite régler ${m[1].replace('Stage 2 Admission Payment', 'le paiement d’admission (étape 2)').replace('Stage 3 Final Payment', 'le paiement final (étape 3)')} pour ma candidature ${m[2]}. Pouvez-vous m’envoyer les instructions de paiement ?`;
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
