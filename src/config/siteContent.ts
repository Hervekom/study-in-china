/**
 * Editable website content (managed from Admin Portal → Site Content).
 * Defaults below are used until an admin saves changes; saved values are stored in
 * Supabase (table public.site_content, row id 'main') and override these defaults.
 */

export interface HeroSlide {
  image: string;
  label: string;
  caption: string;
}

export interface SiteContent {
  brandName: string;
  announcement: {
    enabled: boolean;
    text: string;
    linkLabel: string;
    linkUrl: string;
  };
  hero: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    slides: HeroSlide[];
    autoplaySeconds: number;
  };
  about: {
    headline: string;
    intro: string;
    whoWeAre: string;
    whoWeAre2: string;
    mission: string;
    mission2: string;
  };
  footer: {
    description: string;
  };
  contact: {
    email: string;
    whatsappNumber: string;
    whatsappMessage: string;
    officeAddress: string;
    businessHours: string;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
    youtube: string;
    x: string;
  };
}

export const SITE_IMAGES = [
  '/images/hero_china_students_1790254510954.jpg',
  '/images/editorial_campus_quad_1790258428891.jpg',
  '/images/campus_academics_lab_1790254527844.jpg',
  '/images/student_culture_campus_1790254540697.jpg',
  '/images/editorial_seminar_students_1790258417736.jpg',
  '/images/editorial_library_interior_1790258403346.jpg',
  '/images/china_arrival_cityscape_1790254554482.jpg',
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brandName: 'Study In China',
  announcement: {
    enabled: false,
    text: 'Applications for the March 2027 intake are open.',
    linkLabel: 'Apply now',
    linkUrl: '/apply',
  },
  hero: {
    kicker: 'International Education Advisory',
    titleLine1: 'Your Journey',
    titleLine2: 'to Study in China',
    titleHighlight: 'Starts Here.',
    subtitle:
      'Direct admission pathways to accredited English-taught degree tracks across China. Complete support from field matching to JW202 visa clearance, with guaranteed pricing transparency.',
    primaryCta: 'Start Your Application',
    slides: [
      {
        image: SITE_IMAGES[0],
        label: 'Academic Excellence',
        caption: "English-Taught Bachelor's, Master's, PhD & Language Programs",
      },
    ],
    autoplaySeconds: 6,
  },
  about: {
    headline: 'Empowering International Students in China',
    intro:
      'We are dedicated education consultants committed to making higher education in China accessible, straightforward, and secure through honest guidance and fixed, transparent fees.',
    whoWeAre:
      'Study In China was established by experienced international alumni and higher education advisors based in China. Having experienced the complexities of foreign admission portals, JW202 government documentation, and embassy interviews ourselves, we created a streamlined pathway for international applicants worldwide.',
    whoWeAre2:
      'We bridge the communication gap between overseas applicants and institutional admissions boards, ensuring dossiers are accurate, compliant, and submitted ahead of competitive deadlines.',
    mission:
      'Our mission is to eliminate predatory education agency practices by instituting complete pricing transparency and academic integrity. We believe qualified students from any country deserve access to accredited degree curricula without hidden retainers or confusing fee tiers.',
    mission2:
      'Every applicant receives equal dedication, comprehensive credential evaluations, and hands-on guidance from initial program discovery until day one on campus.',
  },
  footer: {
    description:
      'Premier international education consultancy facilitating admissions, scholarship dossier preparation, JW202 government documentation, and student visa coaching for higher education in China.',
  },
  contact: {
    email: 'admissions@studyinchina.com',
    whatsappNumber: '+86 186 2100 8954',
    whatsappMessage: 'Hello Study In China, I am interested in studying in China',
    officeAddress: 'Zhongguancun International Education Hub, Haidian District, Beijing, China',
    businessHours: 'Monday – Saturday: 09:00 – 19:00 (GMT+8 / Beijing Time)',
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    youtube: '',
    x: '',
  },
};

/** Deep-merge saved content over defaults so new fields always have a value. */
export const mergeSiteContent = (saved: any): SiteContent => {
  const d = DEFAULT_SITE_CONTENT;
  if (!saved || typeof saved !== 'object') return d;
  const pick = <T extends object>(def: T, val: any): T => ({ ...def, ...(val && typeof val === 'object' ? val : {}) });
  const hero = pick(d.hero, saved.hero);
  const slides = Array.isArray(saved.hero?.slides)
    ? saved.hero.slides.filter((s: any) => s && typeof s.image === 'string' && s.image).map((s: any) => ({ label: '', caption: '', ...s }))
    : d.hero.slides;
  return {
    brandName: typeof saved.brandName === 'string' && saved.brandName.trim() ? saved.brandName : d.brandName,
    announcement: pick(d.announcement, saved.announcement),
    hero: { ...hero, slides: slides.length ? slides : d.hero.slides },
    about: pick(d.about, saved.about),
    footer: pick(d.footer, saved.footer),
    contact: pick(d.contact, saved.contact),
    social: pick(d.social, saved.social),
  };
};

export const whatsappDigits = (n: string) => n.replace(/[^\d]/g, '');

export const whatsappUrl = (c: SiteContent['contact']) =>
  `https://wa.me/${whatsappDigits(c.whatsappNumber)}${c.whatsappMessage ? `?text=${encodeURIComponent(c.whatsappMessage)}` : ''}`;
