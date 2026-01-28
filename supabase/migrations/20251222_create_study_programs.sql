-- Create study_programs table
-- Study programs are specific to each faculty

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

-- Add trigger for updated_at
create trigger update_study_programs_updated_at before update on study_programs
  for each row execute procedure update_updated_at_column();

-- Insert sample study programs for common Croatian faculties
-- Note: This is sample data - you should customize it for your actual faculties

-- Get faculty IDs (assuming they exist from universities.sql)
DO $$
DECLARE
  fer_id uuid;
  pmf_split_id uuid;
  fesb_id uuid;
BEGIN
  -- Get FER (Zagreb) ID
  SELECT id INTO fer_id FROM faculties WHERE slug = 'fer' LIMIT 1;

  -- Get PMF Split ID
  SELECT id INTO pmf_split_id FROM faculties WHERE slug = 'pmf-split' LIMIT 1;

  -- Get FESB ID
  SELECT id INTO fesb_id FROM faculties WHERE slug = 'fesb' LIMIT 1;

  -- Insert study programs for FER (if exists)
  IF fer_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Računarstvo', 'Computing', 'RČ', fer_id, 'preddiplomski', 3, 180, 1),
      ('Elektrotehnika', 'Electrical Engineering', 'EL', fer_id, 'preddiplomski', 3, 180, 2),
      ('Informacijska i programska tehnologija', 'Information and Software Engineering', 'IPT', fer_id, 'diplomski', 2, 120, 3),
      ('Elektronika i računalno inženjerstvo', 'Electronics and Computer Engineering', 'ERI', fer_id, 'diplomski', 2, 120, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- Insert study programs for PMF Split (if exists)
  IF pmf_split_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Matematika', 'Mathematics', 'MAT', pmf_split_id, 'preddiplomski', 3, 180, 1),
      ('Informatika', 'Computer Science', 'INF', pmf_split_id, 'preddiplomski', 3, 180, 2),
      ('Fizika', 'Physics', 'FIZ', pmf_split_id, 'preddiplomski', 3, 180, 3),
      ('Kemija', 'Chemistry', 'KEM', pmf_split_id, 'preddiplomski', 3, 180, 4),
      ('Biologija', 'Biology', 'BIO', pmf_split_id, 'preddiplomski', 3, 180, 5)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- Insert study programs for FESB (if exists)
  IF fesb_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      ('Brodogradnja', 'Naval Architecture', 'BRO', fesb_id, 'preddiplomski', 3, 180, 1),
      ('Strojarstvo', 'Mechanical Engineering', 'STR', fesb_id, 'preddiplomski', 3, 180, 2),
      ('Elektrotehnika', 'Electrical Engineering', 'EL', fesb_id, 'preddiplomski', 3, 180, 3),
      ('Računarstvo', 'Computing', 'RČ', fesb_id, 'preddiplomski', 3, 180, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;
END $$;
