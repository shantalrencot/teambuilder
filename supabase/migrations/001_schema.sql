-- ============================================================
-- Team Builder - TEAM Consulting, Harare, Zimbabwe
-- Migration: 001_schema.sql
-- Run this FIRST in the Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('youth','low_grade','mid_grade','high_grade','sme','management','executive','admin','super_admin');
CREATE TYPE enrollment_status AS ENUM ('pending','active','completed','expired');
CREATE TYPE access_type AS ENUM ('free','paid','subscription');

CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text        NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  display_name  text,
  email         text        NOT NULL UNIQUE,
  organisation  text,
  country       text        DEFAULT 'ZW',
  avatar_url    text,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "staff read all" ON public.profiles FOR SELECT USING (public.is_staff(auth.uid()));

CREATE TABLE public.user_roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        user_role   NOT NULL,
  granted_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "staff read all" ON public.user_roles FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "super_admin write" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.courses (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text         UNIQUE NOT NULL,
  title            text         NOT NULL,
  description      text,
  segment          user_role    NOT NULL,
  category         text         NOT NULL,
  price_usd        numeric(6,2) DEFAULT 5.00,
  access_type      access_type  DEFAULT 'paid',
  duration_minutes integer,
  video_url        text,
  thumbnail_url    text,
  is_published     boolean      DEFAULT false,
  cpd_credits      numeric(4,1) DEFAULT 1.0,
  sort_order       integer      DEFAULT 0,
  created_at       timestamptz  DEFAULT now(),
  updated_at       timestamptz  DEFAULT now()
);

CREATE INDEX idx_courses_segment ON public.courses(segment);
CREATE INDEX idx_courses_published ON public.courses(is_published);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "admin write all" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.enrollments (
  id                 uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid              NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id          uuid              NOT NULL REFERENCES public.courses(id),
  status             enrollment_status DEFAULT 'pending',
  enrolled_at        timestamptz       DEFAULT now(),
  expires_at         timestamptz,
  completed_at       timestamptz,
  amount_paid_usd    numeric(6,2)      DEFAULT 0,
  stripe_payment_id  text,
  progress_pct       integer           DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner insert" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "staff read all" ON public.enrollments FOR SELECT USING (public.is_staff(auth.uid()));

CREATE TABLE public.leaderboard_points (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  segment    user_role   NOT NULL,
  points     integer     DEFAULT 0,
  reason     text,
  earned_at  timestamptz DEFAULT now()
);

ALTER TABLE public.leaderboard_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own" ON public.leaderboard_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "staff read all" ON public.leaderboard_points FOR SELECT USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'super_admin'));
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'super_admin' THEN 0 WHEN 'admin' THEN 1 WHEN 'executive' THEN 2 WHEN 'management' THEN 3 WHEN 'sme' THEN 4 WHEN 'high_grade' THEN 5 WHEN 'mid_grade' THEN 6 WHEN 'low_grade' THEN 7 WHEN 'youth' THEN 8 ELSE 9 END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
