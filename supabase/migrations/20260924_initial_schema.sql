-- ==============================================================================
-- ChinaStudy Connect — Supabase Database Architecture & Security Migration
-- Version: 1.0.0
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  profile_photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Universities Directory Table
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  chinese_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  description TEXT,
  tier TEXT DEFAULT 'Double First Class',
  national_ranking INTEGER,
  established INTEGER,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  degree_levels TEXT[] DEFAULT ARRAY['Bachelor', 'Master', 'PhD'],
  languages TEXT[] DEFAULT ARRAY['English', 'Chinese'],
  tuition_min NUMERIC(10, 2) DEFAULT 2500,
  tuition_max NUMERIC(10, 2) DEFAULT 8000,
  scholarship_available BOOLEAN DEFAULT true,
  scholarship_types TEXT[] DEFAULT ARRAY['CSC Full', 'Provincial', 'University Merit'],
  admission_requirements TEXT[] DEFAULT ARRAY['Valid Passport', 'Official Transcripts', 'English MOI or IELTS 6.0+'],
  application_deadline TEXT DEFAULT 'June 30, 2026',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Programs Directory Table
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  degree TEXT NOT NULL CHECK (degree IN ('Bachelor', 'Master', 'PhD', 'Non-Degree Language')),
  field TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('English', 'Chinese', 'Bilingual')),
  duration TEXT NOT NULL DEFAULT '4 Years',
  tuition NUMERIC(10, 2) NOT NULL DEFAULT 3200,
  intake_season TEXT DEFAULT 'Autumn (September)',
  description TEXT,
  requirements TEXT[] DEFAULT ARRAY['High school diploma or bachelor degree', 'Transcript of records'],
  scholarship_available BOOLEAN DEFAULT true,
  scholarship_coverage TEXT DEFAULT 'Full Tuition & Accommodation',
  application_deadline TEXT DEFAULT 'June 15, 2026',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(university_id, slug)
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_number TEXT NOT NULL UNIQUE,
  degree TEXT NOT NULL CHECK (degree IN ('Bachelor', 'Master', 'PhD', 'Non-Degree Language')),
  field TEXT NOT NULL,
  preferred_language TEXT DEFAULT 'English',
  scholarship_interest TEXT DEFAULT 'Full CSC Preferred',
  preferred_city TEXT DEFAULT 'Beijing',
  target_university_name TEXT,
  target_program_name TEXT,
  intake_season TEXT DEFAULT 'Autumn (September 2026)',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'incomplete',
    'submitted',
    'under_review',
    'university_application',
    'admission',
    'jw_processing',
    'jw_received',
    'final_payment_pending',
    'visa_preparation',
    'completed'
  )),
  progress INTEGER NOT NULL DEFAULT 10,
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 7),
  education_highest_level TEXT,
  education_school_name TEXT,
  education_field TEXT,
  education_grad_year TEXT,
  education_gpa TEXT,
  education_english_level TEXT,
  education_chinese_level TEXT,
  additional_notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Application Universities (Multiple choices / multi-program association)
CREATE TABLE IF NOT EXISTS public.application_universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'selected' CHECK (status IN (
    'recommended',
    'selected',
    'submitted',
    'under_review',
    'admission',
    'rejected'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Application Documents Table
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'passport',
    'transcript',
    'certificate',
    'photo',
    'english_test',
    'cv',
    'recommendation_1',
    'recommendation_2',
    'study_plan',
    'police_record',
    'physical_exam',
    'other'
  )),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size TEXT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN (
    'not_uploaded',
    'uploaded',
    'under_review',
    'approved',
    'correction_required'
  )),
  admin_note TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Formal Admission Records Table
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'confirmed')),
  admission_letter_path TEXT,
  student_registration_no TEXT,
  admission_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. JW202 / JW201 Visa Form Records Table
CREATE TABLE IF NOT EXISTS public.jw_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'JW202' CHECK (document_type IN ('JW202', 'JW201')),
  form_number TEXT,
  visa_type TEXT DEFAULT 'X1' CHECK (visa_type IN ('X1', 'X2')),
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'received')),
  authorized_duration TEXT DEFAULT 'Standard Degree Length',
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Payments Ledger Table (Strict 2-Stage Payment Architecture: $225 + $1575 = $1800 Total)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('initial_deposit', 'final_payment')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'Credit Card (Stripe)',
  transaction_reference TEXT,
  receipt_number TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Counselor / Student Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('application', 'document', 'payment', 'admission', 'jw', 'message', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Application Status History (Transparent Audit Log for Students & Admissions Board)
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Content Tables: Blog Posts, FAQs, Testimonials
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'ChinaStudy Connect Editorial Board',
  read_time INTEGER DEFAULT 5,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_app_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_app_docs_application_id ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_student_id ON public.application_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_programs_university_id ON public.programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_degree ON public.programs(degree);
CREATE INDEX IF NOT EXISTS idx_programs_field ON public.programs(field);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON public.messages(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON public.payments(application_id);

-- ==============================================================================
-- STORAGE CONFIGURATION: student-documents (Private Bucket)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jw_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth user has role 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles RLS
CREATE POLICY "Public read user profiles basic" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- 2. Universities & Programs: Public Read, Admin Write
CREATE POLICY "Public can view universities" ON public.universities
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage universities" ON public.universities
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view programs" ON public.programs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage programs" ON public.programs
  FOR ALL USING (public.is_admin());

-- 3. Applications RLS
CREATE POLICY "Students can view own applications" ON public.applications
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Students can create own applications" ON public.applications
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Students can update own draft applications" ON public.applications
  FOR UPDATE USING (
    (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND status IN ('draft', 'incomplete'))
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage all applications" ON public.applications
  FOR ALL USING (public.is_admin());

-- 4. Application Documents RLS
CREATE POLICY "Students can view own documents" ON public.application_documents
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Students can upload own documents" ON public.application_documents
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Students can update own documents when allowed" ON public.application_documents
  FOR UPDATE USING (
    (student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND status IN ('uploaded', 'correction_required'))
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage all documents" ON public.application_documents
  FOR ALL USING (public.is_admin());

-- 5. Storage RLS (student-documents bucket)
CREATE POLICY "Students can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'student-documents' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "Students can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'student-documents' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- 6. Payments RLS
CREATE POLICY "Students can view own payments" ON public.payments
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- 7. Messages & Notifications RLS
CREATE POLICY "Users can view messages sent to or from them" ON public.messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 8. Public Content RLS: Blog, FAQ, Testimonials
CREATE POLICY "Public read published blogs" ON public.blog_posts
  FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read published faqs" ON public.faqs
  FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "Admins manage faqs" ON public.faqs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read published testimonials" ON public.testimonials
  FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_admin());

-- ==============================================================================
-- AUTO-PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'student' -- Always default to 'student'; never allow user to self-assign 'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
