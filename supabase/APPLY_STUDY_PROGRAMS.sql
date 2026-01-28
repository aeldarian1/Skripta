-- ============================================================
-- COMPLETE STUDY PROGRAMS MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Step 1: Create the study_programs table
-- ============================================================

create table if not exists study_programs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_en text,
  abbreviation text,
  faculty_id uuid references faculties(id) on delete cascade not null,
  degree_level text check (degree_level in ('preddiplomski', 'diplomski', 'poslijediplomski', 'integrirani')) default 'preddiplomski',
  duration_years integer default 3,
  ects_credits integer,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(faculty_id, name)
);

-- Add study_program_id to profiles table
alter table profiles add column if not exists study_program_id uuid references study_programs(id) on delete set null;

-- Create indexes for better performance
create index if not exists idx_study_programs_faculty on study_programs(faculty_id);
create index if not exists idx_profiles_study_program on profiles(study_program_id);

-- Enable Row Level Security
alter table study_programs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Study programs are viewable by everyone" on study_programs;
drop policy if exists "Only admins can insert study programs" on study_programs;
drop policy if exists "Only admins can update study programs" on study_programs;
drop policy if exists "Only admins can delete study programs" on study_programs;

-- Study programs policies (public read)
create policy "Study programs are viewable by everyone"
  on study_programs for select
  using (true);

create policy "Only admins can insert study programs"
  on study_programs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can update study programs"
  on study_programs for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can delete study programs"
  on study_programs for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Add trigger for updated_at (only if the function exists)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'update_updated_at_column') then
    drop trigger if exists update_study_programs_updated_at on study_programs;
    create trigger update_study_programs_updated_at before update on study_programs
      for each row execute procedure update_updated_at_column();
  end if;
end $$;

-- Step 2: Insert all study programs
-- ============================================================

DO $$
DECLARE
  -- Zagreb University
  fer_id uuid;
  pmf_zagreb_id uuid;
  efzg_id uuid;
  -- Split University
  pmfst_id uuid;
  fesb_id uuid;
  efst_id uuid;
  -- Rijeka University
  fidit_id uuid;
  riteh_id uuid;
  efri_id uuid;
  -- Osijek University
  ferit_id uuid;
  efos_id uuid;
  pravos_id uuid;
BEGIN

  -- Get Faculty IDs
  SELECT id INTO fer_id FROM faculties WHERE slug = 'fer' LIMIT 1;
  SELECT id INTO pmf_zagreb_id FROM faculties WHERE slug = 'pmf' LIMIT 1;
  SELECT id INTO efzg_id FROM faculties WHERE slug = 'efzg' LIMIT 1;
  SELECT id INTO pmfst_id FROM faculties WHERE slug = 'pmfst' LIMIT 1;
  SELECT id INTO fesb_id FROM faculties WHERE slug = 'fesb' LIMIT 1;
  SELECT id INTO efst_id FROM faculties WHERE slug = 'efst' LIMIT 1;
  SELECT id INTO fidit_id FROM faculties WHERE slug = 'fidit' LIMIT 1;
  SELECT id INTO riteh_id FROM faculties WHERE slug = 'riteh' LIMIT 1;
  SELECT id INTO efri_id FROM faculties WHERE slug = 'efri' LIMIT 1;
  SELECT id INTO ferit_id FROM faculties WHERE slug = 'ferit' LIMIT 1;
  SELECT id INTO efos_id FROM faculties WHERE slug = 'efos' LIMIT 1;
  SELECT id INTO pravos_id FROM faculties WHERE slug = 'pravos' LIMIT 1;

  -- FER Zagreb
  IF fer_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fer_id, 'preddiplomski', 3, 180, 1),
      ('Računarstvo', 'Computing', 'RČ', fer_id, 'preddiplomski', 3, 180, 2),
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fer_id, 'diplomski', 2, 120, 3),
      ('Informacijska i komunikacijska tehnologija', 'Information and Communication Technology', 'IKT', fer_id, 'diplomski', 2, 120, 4),
      ('Računarstvo', 'Computing', 'RČ', fer_id, 'diplomski', 2, 120, 5),
      ('Biomedicinsko inženjerstvo', 'Biomedical Engineering', 'BMI', fer_id, 'diplomski', 2, 120, 6)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- PMF Zagreb
  IF pmf_zagreb_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Matematika', 'Mathematics', 'MAT', pmf_zagreb_id, 'preddiplomski', 3, 180, 1),
      ('Fizika', 'Physics', 'FIZ', pmf_zagreb_id, 'preddiplomski', 3, 180, 2),
      ('Kemija', 'Chemistry', 'KEM', pmf_zagreb_id, 'preddiplomski', 3, 180, 3),
      ('Biologija', 'Biology', 'BIO', pmf_zagreb_id, 'preddiplomski', 3, 180, 4),
      ('Geologija', 'Geology', 'GEO', pmf_zagreb_id, 'preddiplomski', 3, 180, 5),
      ('Geografija', 'Geography', 'GEO', pmf_zagreb_id, 'preddiplomski', 3, 180, 6),
      ('Geofizika', 'Geophysics', 'GEOF', pmf_zagreb_id, 'preddiplomski', 3, 180, 7),
      ('Matematika i fizika - nastavnički', 'Mathematics and Physics - Teaching', 'MAT-FIZ', pmf_zagreb_id, 'integrirani', 5, 300, 8),
      ('Matematika i informatika - nastavnički', 'Mathematics and Computer Science - Teaching', 'MAT-INF', pmf_zagreb_id, 'integrirani', 5, 300, 9)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- EFZG
  IF efzg_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Poslovna ekonomija', 'Business Economics', 'PE', efzg_id, 'integrirani', 5, 300, 1),
      ('Ekonomija', 'Economics', 'EKO', efzg_id, 'integrirani', 5, 300, 2)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- PMF Split
  IF pmfst_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Matematika', 'Mathematics', 'MAT', pmfst_id, 'preddiplomski', 3, 180, 1),
      ('Informatika', 'Computer Science', 'INF', pmfst_id, 'preddiplomski', 3, 180, 2),
      ('Fizika', 'Physics', 'FIZ', pmfst_id, 'preddiplomski', 3, 180, 3),
      ('Kemija', 'Chemistry', 'KEM', pmfst_id, 'preddiplomski', 3, 180, 4),
      ('Biologija', 'Biology', 'BIO', pmfst_id, 'preddiplomski', 3, 180, 5),
      ('Okolišno inženjerstvo', 'Environmental Engineering', 'OI', pmfst_id, 'preddiplomski', 3, 180, 6)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- FESB
  IF fesb_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fesb_id, 'preddiplomski', 3, 180, 1),
      ('Strojarstvo', 'Mechanical Engineering', 'STR', fesb_id, 'preddiplomski', 3, 180, 2),
      ('Industrijsko inženjerstvo', 'Industrial Engineering', 'II', fesb_id, 'preddiplomski', 3, 180, 3),
      ('Brodogradnja - stručni', 'Naval Architecture - Professional', 'BRO', fesb_id, 'preddiplomski', 3, 180, 4),
      ('Strojarstvo - stručni', 'Mechanical Engineering - Professional', 'STR', fesb_id, 'preddiplomski', 3, 180, 5),
      ('Računarstvo - stručni', 'Computer Science - Professional', 'RČ', fesb_id, 'preddiplomski', 3, 180, 6),
      ('Elektrotehnika - stručni', 'Electrical Engineering - Professional', 'EL', fesb_id, 'preddiplomski', 3, 180, 7),
      ('Komunikacijske i informacijske tehnologije', 'Communication and Information Technology', 'KIT', fesb_id, 'diplomski', 2, 120, 8)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- EFST
  IF efst_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Poslovna ekonomija', 'Business Economics', 'PE', efst_id, 'preddiplomski', 3, 180, 1),
      ('Poslovna ekonomija - stručni', 'Business Economics - Professional', 'PE', efst_id, 'preddiplomski', 3, 180, 2),
      ('Ekonomija - specijalistički', 'Economics - Specialist', 'EKO', efst_id, 'poslijediplomski', 2, 120, 3),
      ('Poslovna ekonomija - specijalistički', 'Business Economics - Specialist', 'PE', efst_id, 'poslijediplomski', 2, 120, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- FIDIT Rijeka
  IF fidit_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Informatika - Razvoj programske potpore', 'Computer Science - Software Development', 'INF-RPP', fidit_id, 'preddiplomski', 3, 180, 1),
      ('Informatika - Multimedijski sustavi', 'Computer Science - Multimedia Systems', 'INF-MS', fidit_id, 'preddiplomski', 3, 180, 2),
      ('Informatika - Informacijski sustavi', 'Computer Science - Information Systems', 'INF-IS', fidit_id, 'preddiplomski', 3, 180, 3),
      ('Informatika - Komunikacijski sustavi', 'Computer Science - Communication Systems', 'INF-KS', fidit_id, 'preddiplomski', 3, 180, 4),
      ('Informatika - Inteligentni i interaktivni sustavi', 'Computer Science - Intelligent and Interactive Systems', 'INF-IIS', fidit_id, 'diplomski', 2, 120, 5),
      ('Informatika - Poslovna informatika', 'Computer Science - Business Informatics', 'INF-PI', fidit_id, 'diplomski', 2, 120, 6),
      ('Informatika - nastavnički', 'Computer Science - Teaching', 'INF-N', fidit_id, 'diplomski', 2, 120, 7)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- RITEH
  IF riteh_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Strojarstvo', 'Mechanical Engineering', 'STR', riteh_id, 'preddiplomski', 3, 180, 1),
      ('Brodogradnja', 'Naval Architecture', 'BRO', riteh_id, 'preddiplomski', 3, 180, 2),
      ('Elektrotehnika i računarsko inženjerstvo', 'Electrical and Computer Engineering', 'ERI', riteh_id, 'preddiplomski', 3, 180, 3),
      ('Mehatronika i robotika', 'Mechatronics and Robotics', 'MR', riteh_id, 'preddiplomski', 3, 180, 4),
      ('Strojarstvo', 'Mechanical Engineering', 'STR', riteh_id, 'diplomski', 2, 120, 5)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- EFRI
  IF efri_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Poslovna ekonomija', 'Business Economics', 'PE', efri_id, 'preddiplomski', 3, 180, 1),
      ('Financije', 'Finance', 'FIN', efri_id, 'diplomski', 2, 120, 2),
      ('Marketing', 'Marketing', 'MKT', efri_id, 'diplomski', 2, 120, 3),
      ('Međunarodno poslovanje', 'International Business', 'MP', efri_id, 'diplomski', 2, 120, 4),
      ('Menadžment', 'Management', 'MAN', efri_id, 'diplomski', 2, 120, 5),
      ('Poduzetništvo', 'Entrepreneurship', 'POD', efri_id, 'diplomski', 2, 120, 6),
      ('Financije i računovodstvo', 'Finance and Accounting', 'FiR', efri_id, 'diplomski', 2, 120, 7),
      ('International Business', 'International Business', 'IB', efri_id, 'diplomski', 2, 120, 8),
      ('Financije - online', 'Finance - Online', 'FIN-O', efri_id, 'diplomski', 2, 120, 9),
      ('Menadžment - online', 'Management - Online', 'MAN-O', efri_id, 'diplomski', 2, 120, 10),
      ('Poduzetništvo - online', 'Entrepreneurship - Online', 'POD-O', efri_id, 'diplomski', 2, 120, 11)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- FERIT
  IF ferit_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Elektrotehnika - Informacijske i komunikacijske tehnologije', 'Electrical Engineering - ICT', 'EL-IKT', ferit_id, 'preddiplomski', 3, 180, 1),
      ('Računarstvo', 'Computer Science', 'RČ', ferit_id, 'preddiplomski', 3, 180, 2),
      ('Elektrotehnika - stručni', 'Electrical Engineering - Professional', 'EL', ferit_id, 'preddiplomski', 3, 180, 3),
      ('Računarstvo - stručni', 'Computer Science - Professional', 'RČ', ferit_id, 'preddiplomski', 3, 180, 4),
      ('Automobilsko računarstvo i komunikacije', 'Automotive Computing and Communications', 'ARK', ferit_id, 'diplomski', 2, 120, 5)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- EFOS
  IF efos_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Ekonomija i poslovna ekonomija', 'Economics and Business Economics', 'EPE', efos_id, 'preddiplomski', 3, 180, 1),
      ('Računovodstvo', 'Accounting', 'RAČ', efos_id, 'diplomski', 2, 120, 2),
      ('Trgovina', 'Commerce', 'TRG', efos_id, 'diplomski', 2, 120, 3),
      ('Poduzetništvo i inovacije', 'Entrepreneurship and Innovation', 'P&I', efos_id, 'diplomski', 2, 120, 4),
      ('Menadžment', 'Management', 'MAN', efos_id, 'diplomski', 2, 120, 5),
      ('Financije i bankarstvo', 'Finance and Banking', 'F&B', efos_id, 'diplomski', 2, 120, 6),
      ('Marketing', 'Marketing', 'MKT', efos_id, 'diplomski', 2, 120, 7)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- PRAVOS
  IF pravos_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Pravo', 'Law', 'PRAVO', pravos_id, 'integrirani', 5, 300, 1),
      ('Socijalni rad', 'Social Work', 'SR', pravos_id, 'preddiplomski', 3, 180, 2),
      ('Upravni studij - stručni', 'Administrative Studies - Professional', 'US', pravos_id, 'preddiplomski', 3, 180, 3),
      ('Socijalni rad', 'Social Work', 'SR', pravos_id, 'diplomski', 2, 120, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

END $$;

-- Step 3: Show summary
-- ============================================================

SELECT
  u.name as university,
  f.name as faculty,
  COUNT(*) as program_count
FROM study_programs sp
JOIN faculties f ON sp.faculty_id = f.id
JOIN universities u ON f.university_id = u.id
GROUP BY u.name, f.name, u.order_index, f.order_index
ORDER BY u.order_index, f.order_index;

-- Success!
SELECT 'Study programs migration completed successfully!' as status;
