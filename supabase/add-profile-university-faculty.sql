-- Add university_id and faculty_id to profiles table
alter table profiles add column if not exists university_id uuid references universities(id) on delete set null;
alter table profiles add column if not exists faculty_id uuid references faculties(id) on delete set null;

-- Create indexes for better query performance
create index if not exists idx_profiles_university on profiles(university_id);
create index if not exists idx_profiles_faculty on profiles(faculty_id);

-- Update existing profiles to have null university/faculty IDs (they will select from dropdown)
-- Keep the old 'university' text field for backward compatibility if needed
