-- Universities and Faculties Migration
-- This migration adds the hierarchical structure: University -> Faculty -> Category

-- Create universities table
create table if not exists universities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  city text not null,
  description text,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create faculties table
create table if not exists faculties (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null,
  abbreviation text,
  description text,
  university_id uuid references universities(id) on delete cascade not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(university_id, slug)
);

-- Add faculty_id to categories table
alter table categories add column if not exists faculty_id uuid references faculties(id) on delete cascade;

-- Add faculty_id to topics table for easier querying
alter table topics add column if not exists faculty_id uuid references faculties(id) on delete cascade;

-- Create indexes for better performance
create index if not exists idx_faculties_university on faculties(university_id);
create index if not exists idx_categories_faculty on categories(faculty_id);
create index if not exists idx_topics_faculty on topics(faculty_id);

-- Enable Row Level Security
alter table universities enable row level security;
alter table faculties enable row level security;

-- Universities policies (public read)
create policy "Universities are viewable by everyone"
  on universities for select
  using (true);

create policy "Only admins can insert universities"
  on universities for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can update universities"
  on universities for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can delete universities"
  on universities for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Faculties policies (public read)
create policy "Faculties are viewable by everyone"
  on faculties for select
  using (true);

create policy "Only admins can insert faculties"
  on faculties for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can update faculties"
  on faculties for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Only admins can delete faculties"
  on faculties for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
create trigger update_universities_updated_at before update on universities
  for each row execute procedure update_updated_at_column();

create trigger update_faculties_updated_at before update on faculties
  for each row execute procedure update_updated_at_column();

-- Insert the 4 main universities
insert into universities (name, slug, city, description, order_index) values
  ('Sveučilište u Zagrebu', 'zagreb', 'Zagreb', 'Najveće i najstarije sveučilište u Hrvatskoj', 1),
  ('Sveučilište u Splitu', 'split', 'Split', 'Drugo najveće sveučilište u Hrvatskoj', 2),
  ('Sveučilište u Rijeci', 'rijeka', 'Rijeka', 'Sveučilište u Rijeci', 3),
  ('Sveučilište u Osijeku', 'osijek', 'Osijek', 'Sveučilište u Osijeku', 4);

-- Insert faculties for each university
-- Zagreb faculties (3 faculties)
insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Fakultet elektrotehnike i računarstva',
  'fer',
  'FER',
  id,
  1
from universities where slug = 'zagreb';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Prirodoslovno-matematički fakultet',
  'pmf',
  'PMF',
  id,
  2
from universities where slug = 'zagreb';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Ekonomski fakultet',
  'efzg',
  'EFZG',
  id,
  3
from universities where slug = 'zagreb';

-- Split faculties (3 faculties - including PMF as requested)
insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Prirodoslovno-matematički fakultet u Splitu',
  'pmfst',
  'PMF',
  id,
  1
from universities where slug = 'split';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Fakultet elektrotehnike, strojarstva i brodogradnje',
  'fesb',
  'FESB',
  id,
  2
from universities where slug = 'split';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Ekonomski fakultet',
  'efst',
  'EFST',
  id,
  3
from universities where slug = 'split';

-- Rijeka faculties (3 faculties)
insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Fakultet informatike i digitalnih tehnologija',
  'fidit',
  'FIDIT',
  id,
  1
from universities where slug = 'rijeka';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Tehnički fakultet',
  'riteh',
  'RITEH',
  id,
  2
from universities where slug = 'rijeka';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Ekonomski fakultet',
  'efri',
  'EFRI',
  id,
  3
from universities where slug = 'rijeka';

-- Osijek faculties (3 faculties)
insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Fakultet elektrotehnike, računarstva i informacijskih tehnologija',
  'ferit',
  'FERIT',
  id,
  1
from universities where slug = 'osijek';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Ekonomski fakultet',
  'efos',
  'EFOS',
  id,
  2
from universities where slug = 'osijek';

insert into faculties (name, slug, abbreviation, university_id, order_index)
select
  'Pravni fakultet',
  'pravos',
  'PRAVOS',
  id,
  3
from universities where slug = 'osijek';
