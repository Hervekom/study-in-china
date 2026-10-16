import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Plus, Minus, Mail, MessageCircle, MapPin, Clock, Compass, ShieldCheck, Users } from 'lucide-react';
import { useLanguage, formatUSD } from '../../i18n/LanguageContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { whatsappUrl } from '../../config/siteContent';
import { pricing } from '../../data/siteConfig';
import { blogPostsData } from '../../data/blog';
import { en } from '../../i18n/en';
import { getUpcomingIntakes } from '../../utils/intakeUtils';
import { BlogPost, DegreeLevel, AppView } from '../../types';
import { SiteHeader, LanguageSwitch } from './SiteHeader';

interface Props {
  onApply: (program?: string, degree?: DegreeLevel) => void;
  onNavigate: (view: AppView) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenPolicy: (p: 'terms' | 'privacy' | 'refund') => void;
  onReadArticle: (a: BlogPost) => void;
}

const Section: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = '', children }) => (
  <section id={id} className={`scroll-mt-20 py-16 sm:py-24 ${className}`}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">{children}</div>
  </section>
);

const Heading: React.FC<{ title: string; subtitle?: string; tone?: 'light' | 'dark'; className?: string }> = ({ title, subtitle, tone = 'light', className = '' }) => (
  <div className={`max-w-2xl ${className}`}>
    <h2 className={`font-display text-3xl sm:text-[44px] leading-[1.1] font-semibold ${tone === 'dark' ? 'text-white' : 'text-ink'}`}>{title}</h2>
    {subtitle && <p className={`mt-4 text-base sm:text-lg leading-relaxed ${tone === 'dark' ? 'text-white/70' : 'text-ink/65'}`}>{subtitle}</p>}
  </div>
);

const monthName = (month: number, year: number, lang: 'en' | 'fr') =>
  new Date(year, month - 1, 1).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });

export const HomePage: React.FC<Props> = ({ onApply, onNavigate, onOpenAuth, onOpenPolicy, onReadArticle }) => {
  const { t, lang } = useLanguage();
  const { content } = useSiteContent();
  const wa = whatsappUrl(content.contact);
  const intakes = getUpcomingIntakes(new Date(), 2);
  const usd = (n: number) => formatUSD(n, lang);

  // Hero background: images from the admin carousel, crossfading
  const slides = content.hero.slides;
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => setSlide(i => (i + 1) % slides.length), Math.max(4, content.hero.autoplaySeconds || 6) * 1000);
    return () => clearInterval(id);
  }, [slides.length, content.hero.autoplaySeconds]);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const stageAmounts = [pricing.depositUSD, pricing.admissionPaymentUSD, pricing.finalPaymentUSD];
  const guides = blogPostsData.slice(0, 3);

  return (
    <div className="min-h-screen bg-porcelain text-ink font-sans antialiased">
      <SiteHeader onApply={() => onApply()} onNavigate={onNavigate} onOpenAuth={onOpenAuth} />

      <main>
        {/* ================= HERO ================= */}
        <section className="relative isolate overflow-hidden bg-ink">
          {slides.map((s, i) => (
            <img
              key={`${s.image}-${i}`}
              src={s.image}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/70 to-ink/90 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/75 lg:to-ink/30" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-16 sm:pt-40 sm:pb-24 lg:min-h-[88vh] grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div className="text-white">
              <p className="text-sm font-medium text-white/75">{t.hero.kicker}</p>
              <h1 className="mt-4 font-display font-semibold text-[40px] leading-[1.05] sm:text-6xl lg:text-[68px] tracking-[-0.01em] max-w-[14ch]">
                {t.hero.title}
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-white/80 max-w-xl">{t.hero.subtitle}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => onApply()} className="h-12 px-7 rounded-full bg-bordeaux hover:bg-bordeaux-hover text-white font-semibold transition-colors">
                  {t.hero.ctaPrimary}
                </button>
                <button
                  onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 px-7 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  {t.hero.ctaSecondary}
                </button>
              </div>
              <ul className="mt-8 grid gap-2.5 text-sm text-white/85">
                {t.hero.trust.map(item => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-jade grid place-items-center shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Intake card: the one distinctive element of the page */}
            <aside aria-label={t.hero.card.title} className="rounded-[28px] bg-porcelain text-ink p-6 sm:p-7 shadow-2xl shadow-ink/40">
              <h2 className="font-display text-2xl font-semibold">{t.hero.card.title}</h2>
              <ul className="mt-5 divide-y divide-ink/10">
                {intakes.map(i => (
                  <li key={i.fullLabel} className="py-3.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink/55">{i.season === 'Spring' ? t.hero.card.spring : t.hero.card.autumn}</p>
                      <p className="font-display text-xl font-semibold capitalize">{monthName(i.month, i.year, lang)}</p>
                    </div>
                    <span className="text-xs font-semibold text-jade bg-jade/10 rounded-full px-3 py-1 whitespace-nowrap">{t.hero.card.open}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-2xl bg-blush p-4">
                <p className="text-sm text-ink/70">
                  {t.hero.card.startWith} <span className="font-display text-2xl font-semibold text-bordeaux align-[-2px]">{usd(pricing.depositUSD)}</span> {t.hero.card.deposit}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  {t.hero.card.totalLabel}{lang === 'fr' ? ' : ' : ': '}{usd(pricing.totalUSD)}
                </p>
              </div>

              <ol className="mt-5 grid grid-cols-3 gap-2">
                {t.hero.card.steps.map((s, i) => (
                  <li key={s} className="text-center">
                    <span className={`mx-auto w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${i === 0 ? 'bg-bordeaux text-white' : 'bg-ink/5 text-ink/50'}`}>{i + 1}</span>
                    <span className="mt-1.5 block text-[11px] leading-tight text-ink/60">{s}</span>
                  </li>
                ))}
              </ol>

              <button onClick={() => onApply()} className="mt-6 w-full h-12 rounded-full bg-ink hover:bg-bordeaux text-white font-semibold transition-colors">
                {t.hero.card.cta}
              </button>
            </aside>
          </div>
        </section>

        {/* ================= FACTS ================= */}
        <section className="bg-blush border-b border-ink/5">
          <dl className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {t.facts.map(f => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-3xl sm:text-4xl font-semibold text-bordeaux">{f.value}</dd>
                <dd className="mt-1 text-sm text-ink/65 leading-snug max-w-[22ch]">{f.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ================= PROCESS ================= */}
        <Section id="process" className="bg-ink">
          <Heading title={t.process.title} subtitle={t.process.subtitle} tone="dark" />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 relative">
            <div aria-hidden="true" className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-white/15" />
            {t.process.steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="relative z-10 w-12 h-12 rounded-full bg-bordeaux text-white grid place-items-center font-display text-xl font-semibold ring-8 ring-ink">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.text}</p>
              </li>
            ))}
          </ol>
          <button onClick={() => onApply()} className="mt-12 h-12 px-7 rounded-full bg-white text-ink font-semibold hover:bg-blush transition-colors">
            {t.process.cta}
          </button>
        </Section>

        {/* ================= PROGRAMS ================= */}
        <Section id="programs">
          <Heading title={t.programs.title} subtitle={t.programs.subtitle} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.programs.degrees.map(d => (
              <article key={d.key} className="group flex flex-col rounded-3xl bg-white ring-1 ring-ink/[0.07] overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={d.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <div className="flex-1 flex flex-col p-5">
                  <p className="text-xs font-medium text-iris">{d.duration}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-ink/65 leading-relaxed flex-1">{d.text}</p>
                  <button
                    onClick={() => onApply('', d.key as DegreeLevel)}
                    className="mt-4 self-start text-sm font-semibold text-bordeaux inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    {t.programs.choose}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <h3 className="mt-16 font-display text-2xl font-semibold">{t.programs.fieldsTitle}</h3>
          <ul className="mt-5 grid sm:grid-cols-2 border-t border-ink/10">
            {t.programs.fields.map((f, i) => (
              <li key={f.name} className="border-b border-ink/10 sm:odd:pr-6 sm:even:pl-6">
                <button onClick={() => onApply(en.programs.fields[i].name)} className="w-full py-4 flex items-center justify-between gap-4 text-left group">
                  <span>
                    <span className="block font-semibold text-ink group-hover:text-bordeaux transition-colors">{f.name}</span>
                    <span className="block text-sm text-ink/55">{f.detail}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-ink/30 group-hover:text-bordeaux shrink-0 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        </Section>

        {/* ================= PRICING ================= */}
        <Section id="pricing" className="bg-blush">
          <Heading title={t.pricing.title} subtitle={t.pricing.subtitle} />
          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {t.pricing.stages.map((s, i) => (
              <div key={s.name} className="rounded-3xl bg-white p-6 ring-1 ring-ink/[0.06]">
                <span className="w-8 h-8 rounded-full bg-blush text-bordeaux grid place-items-center text-sm font-bold">{i + 1}</span>
                <p className="mt-4 text-sm font-medium text-ink/60">{s.name}</p>
                <p className="mt-1 font-display text-4xl font-semibold text-ink">{usd(stageAmounts[i])}</p>
                <p className="mt-3 text-sm text-ink/65 leading-relaxed">{s.when}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-bordeaux text-white p-6 flex flex-col">
              <p className="text-sm font-medium text-white/75">{t.pricing.total}</p>
              <p className="mt-1 font-display text-4xl font-semibold">{usd(pricing.totalUSD)}</p>
              <p className="mt-3 text-sm text-white/75 leading-relaxed flex-1">{t.hero.trust[0]}</p>
              <button onClick={() => onApply()} className="mt-5 h-11 rounded-full bg-white text-bordeaux font-semibold hover:bg-blush transition-colors">
                {t.pricing.cta}
              </button>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 text-sm text-ink/65">
            <p className="max-w-2xl leading-relaxed">{t.pricing.note}</p>
            <button onClick={() => onOpenPolicy('refund')} className="shrink-0 font-semibold text-bordeaux underline underline-offset-4 self-start">
              {t.pricing.refund}
            </button>
          </div>
        </Section>

        {/* ================= INCLUDED ================= */}
        <Section>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <Heading title={t.included.title} subtitle={t.included.subtitle} />
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4 content-start">
              {t.included.items.map(item => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink/85">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-jade/10 grid place-items-center shrink-0">
                    <Check className="w-3 h-3 text-jade" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ================= ABOUT ================= */}
        <Section id="about" className="bg-white">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <img
              src="/images/editorial_campus_quad_1790258428891.jpg"
              alt=""
              loading="lazy"
              className="w-full aspect-[4/3] lg:aspect-[5/6] object-cover rounded-[32px]"
            />
            <div>
              <h2 className="font-display text-3xl sm:text-[44px] leading-[1.1] font-semibold">{t.about.title}</h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-ink/70">{t.about.text1}</p>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-ink/70">{t.about.text2}</p>
              <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {t.about.values.map((v, i) => {
                  const Icon = [ShieldCheck, Compass, Users][i] || Check;
                  return (
                    <li key={v.title} className="py-4 flex gap-4">
                      <Icon className="w-5 h-5 text-bordeaux shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">{v.title}</p>
                        <p className="text-sm text-ink/60">{v.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Section>

        {/* ================= GUIDES ================= */}
        <Section id="guides">
          <Heading title={t.guides.title} subtitle={t.guides.subtitle} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {guides.map(g => (
              <article key={g.id} className="group flex flex-col">
                <button onClick={() => onReadArticle(g)} className="text-left">
                  <div className="aspect-[16/10] rounded-3xl overflow-hidden">
                    <img src={g.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <p className="mt-4 text-xs text-ink/55">
                    {g.readTimeMinutes} {t.guides.minutes}
                    {t.guides.englishOnly && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-ink/70">{t.guides.englishOnly}</span>}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:text-bordeaux transition-colors">
                    {t.guides.titles[g.id] || g.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-bordeaux">
                    {t.guides.read}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
              </article>
            ))}
          </div>
        </Section>

        {/* ================= FAQ ================= */}
        <Section id="faq" className="bg-white">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <div>
              <Heading title={t.faq.title} subtitle={t.faq.subtitle} />
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 items-center gap-2 px-5 rounded-full border border-ink/15 font-semibold text-sm hover:border-bordeaux hover:text-bordeaux transition-colors">
                <MessageCircle className="w-4 h-4" />
                {t.faq.ask}
              </a>
            </div>
            <div className="border-t border-ink/10">
              {t.faq.items.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className="border-b border-ink/10">
                    <h3>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        className="w-full py-5 flex items-center justify-between gap-4 text-left font-semibold text-[17px]"
                      >
                        {item.q}
                        <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 transition-colors ${open ? 'bg-bordeaux text-white' : 'bg-blush text-bordeaux'}`}>
                          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </span>
                      </button>
                    </h3>
                    {open && <p className="pb-5 pr-12 text-ink/70 leading-relaxed">{item.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="scroll-mt-20 bg-bordeaux text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">{t.contact.title}</h2>
              <p className="mt-4 text-lg text-white/80 max-w-lg">{t.contact.subtitle}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => onApply()} className="h-12 px-7 rounded-full bg-white text-bordeaux font-semibold hover:bg-blush transition-colors">
                  {t.contact.apply}
                </button>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="h-12 px-7 rounded-full border border-white/40 font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {t.contact.whatsapp}
                </a>
              </div>
            </div>
            <dl className="grid sm:grid-cols-2 gap-px rounded-3xl overflow-hidden bg-white/15">
              {[
                { icon: Mail, label: t.contact.email, value: content.contact.email, href: `mailto:${content.contact.email}` },
                { icon: MessageCircle, label: t.contact.phone, value: content.contact.whatsappNumber, href: wa },
                { icon: MapPin, label: t.contact.office, value: content.contact.officeAddress },
                { icon: Clock, label: t.contact.hours, value: content.contact.businessHours },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-bordeaux p-5">
                    <dt className="flex items-center gap-2 text-sm text-white/70">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </dt>
                    <dd className="mt-1.5 text-[15px] font-medium [overflow-wrap:anywhere]">
                      {item.href ? (
                        <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:underline underline-offset-4">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-ink text-white/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-bordeaux text-white grid place-items-center text-[11px] font-bold">SIC</span>
              <span className="font-display text-xl font-semibold text-white">{content.brandName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">{t.footer.tagline}</p>
            {Object.entries(content.social).some(([, u]) => u) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'x'] as const)
                  .filter(k => content.social[k])
                  .map(k => (
                    <a key={k} href={content.social[k]} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full border border-white/15 text-xs hover:text-white hover:border-white/40 capitalize">
                      {k === 'x' ? 'X' : k}
                    </a>
                  ))}
              </div>
            )}
            <LanguageSwitch tone="dark" className="mt-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{t.footer.explore}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ['#programs', t.nav.programs],
                ['#process', t.nav.process],
                ['#pricing', t.nav.pricing],
                ['#guides', t.nav.guides],
                ['#faq', t.nav.faq],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} onClick={e => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{t.footer.students}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><button onClick={() => onApply()} className="hover:text-white">{t.nav.apply}</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white">{t.footer.portal}</button></li>
              <li><button onClick={() => onOpenAuth('login')} className="hover:text-white">{t.nav.signIn}</button></li>
              <li><a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">{t.footer.legal}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><button onClick={() => onOpenPolicy('terms')} className="hover:text-white text-left">{t.footer.terms}</button></li>
              <li><button onClick={() => onOpenPolicy('privacy')} className="hover:text-white text-left">{t.footer.privacy}</button></li>
              <li><button onClick={() => onOpenPolicy('refund')} className="hover:text-white text-left">{t.footer.refund}</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-xs text-white/50">
            © {new Date().getFullYear()} {content.brandName}. {t.footer.rights}
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.contact.whatsapp}
        className="fixed z-30 bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-lg hover:scale-105 transition-transform"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
};
