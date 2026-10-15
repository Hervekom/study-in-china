import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    country: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required';
    if (!formData.country.trim()) errs.country = 'Country is required';
    if (!formData.message.trim()) errs.message = 'Please provide a message or inquiry';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', whatsapp: '', country: '', message: '' });
    }, 600);
  };

  return (
    <section id="contact" className="py-20 bg-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D1838] mb-2">
                <span>Admissions Advisory Office</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18151B]">
                Speak Directly with an Admissions Advisor
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#575260] leading-relaxed">
                Whether you want to verify your diploma eligibility, clarify scholarship deadlines, or confirm application details, our advisors are here to help.
              </p>
            </div>

            {/* Contact details list */}
            <div className="space-y-4 pt-2">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 hover:bg-[#FAF2F5] transition-colors border border-neutral-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[#6D1838] shrink-0 group-hover:border-[#6D1838]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#575260] font-medium">Admissions Email</p>
                  <p className="text-sm font-bold text-[#18151B]">{siteConfig.contact.email}</p>
                </div>
              </a>

              <a
                href={siteConfig.contact.whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 hover:bg-emerald-50 transition-colors border border-neutral-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shrink-0 group-hover:border-emerald-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#575260] font-medium">Direct WhatsApp Line</p>
                  <p className="text-sm font-bold text-[#18151B]">{siteConfig.contact.whatsappFormatted}</p>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[#6C3B9E] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#575260] font-medium">Liaison Office Location</p>
                  <p className="text-sm font-medium text-[#18151B]">{siteConfig.contact.officeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[#18151B] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#575260] font-medium">Admissions Desk Hours</p>
                  <p className="text-sm font-medium text-[#18151B]">{siteConfig.contact.businessHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F9] border border-neutral-200/80 shadow-xs">
              <h3 className="text-xl font-bold text-[#18151B] mb-1">
                Send an Admissions Inquiry
              </h3>
              <p className="text-xs sm:text-sm text-[#575260] mb-6">
                Fill out your details below and an admissions counselor will reach out via WhatsApp and email within 12 hours.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-[#18151B]">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#575260] max-w-md mx-auto">
                    Thank you for reaching out. One of our senior admissions counselors will contact you via WhatsApp and email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2 text-xs font-semibold bg-[#6D1838] text-white rounded-xl hover:bg-[#58122c] transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your legal name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                        errors.name ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                      }`}
                    />
                    {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                          errors.email ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                        }`}
                      />
                      {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                        WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        placeholder="+1 555 123 4567"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                          errors.whatsapp ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                        }`}
                      />
                      {errors.whatsapp && <p className="text-xs text-rose-500 mt-1">{errors.whatsapp}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Your Country of Residence / Citizenship *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morocco, Kazakhstan, Nigeria, United Kingdom"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                        errors.country ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                      }`}
                    />
                    {errors.country && <p className="text-xs text-rose-500 mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#575260] mb-1.5">
                      Your Message or Questions *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please mention your intended degree (Bachelor, Master, PhD, Language), target field, and any questions regarding admissions or scholarships..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D1838]/20 ${
                        errors.message ? 'border-rose-500' : 'border-neutral-200 focus:border-[#6D1838]'
                      }`}
                    />
                    {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 text-xs sm:text-sm font-bold text-white bg-[#6D1838] hover:bg-[#58122c] active:bg-[#4A1028] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
