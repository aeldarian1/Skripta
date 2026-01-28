-- Complete Study Programs for All Croatian Universities
-- Based on official faculty websites - Academic Year 2025/2026
-- Sources: Official faculty websites researched December 2025

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

  -- ==========================================
  -- GET FACULTY IDs
  -- ==========================================

  -- Zagreb faculties
  SELECT id INTO fer_id FROM faculties WHERE slug = 'fer' LIMIT 1;
  SELECT id INTO pmf_zagreb_id FROM faculties WHERE slug = 'pmf' LIMIT 1;
  SELECT id INTO efzg_id FROM faculties WHERE slug = 'efzg' LIMIT 1;

  -- Split faculties
  SELECT id INTO pmfst_id FROM faculties WHERE slug = 'pmfst' LIMIT 1;
  SELECT id INTO fesb_id FROM faculties WHERE slug = 'fesb' LIMIT 1;
  SELECT id INTO efst_id FROM faculties WHERE slug = 'efst' LIMIT 1;

  -- Rijeka faculties
  SELECT id INTO fidit_id FROM faculties WHERE slug = 'fidit' LIMIT 1;
  SELECT id INTO riteh_id FROM faculties WHERE slug = 'riteh' LIMIT 1;
  SELECT id INTO efri_id FROM faculties WHERE slug = 'efri' LIMIT 1;

  -- Osijek faculties
  SELECT id INTO ferit_id FROM faculties WHERE slug = 'ferit' LIMIT 1;
  SELECT id INTO efos_id FROM faculties WHERE slug = 'efos' LIMIT 1;
  SELECT id INTO pravos_id FROM faculties WHERE slug = 'pravos' LIMIT 1;

  -- ==========================================
  -- ZAGREB - FER (Faculty of Electrical Engineering and Computing)
  -- ==========================================

  IF fer_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate (Preddiplomski)
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fer_id, 'preddiplomski', 3, 180, 1),
      ('Računarstvo', 'Computing', 'RČ', fer_id, 'preddiplomski', 3, 180, 2),
      -- Graduate (Diplomski)
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fer_id, 'diplomski', 2, 120, 3),
      ('Informacijska i komunikacijska tehnologija', 'Information and Communication Technology', 'IKT', fer_id, 'diplomski', 2, 120, 4),
      ('Računarstvo', 'Computing', 'RČ', fer_id, 'diplomski', 2, 120, 5),
      ('Biomedicinsko inženjerstvo', 'Biomedical Engineering', 'BMI', fer_id, 'diplomski', 2, 120, 6)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- ZAGREB - PMF (Faculty of Science)
  -- ==========================================

  IF pmf_zagreb_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Matematika', 'Mathematics', 'MAT', pmf_zagreb_id, 'preddiplomski', 3, 180, 1),
      ('Fizika', 'Physics', 'FIZ', pmf_zagreb_id, 'preddiplomski', 3, 180, 2),
      ('Kemija', 'Chemistry', 'KEM', pmf_zagreb_id, 'preddiplomski', 3, 180, 3),
      ('Biologija', 'Biology', 'BIO', pmf_zagreb_id, 'preddiplomski', 3, 180, 4),
      ('Geologija', 'Geology', 'GEO', pmf_zagreb_id, 'preddiplomski', 3, 180, 5),
      ('Geografija', 'Geography', 'GEO', pmf_zagreb_id, 'preddiplomski', 3, 180, 6),
      ('Geofizika', 'Geophysics', 'GEOF', pmf_zagreb_id, 'preddiplomski', 3, 180, 7),
      -- Integrated 5-year programs
      ('Matematika i fizika - nastavnički', 'Mathematics and Physics - Teaching', 'MAT-FIZ', pmf_zagreb_id, 'integrirani', 5, 300, 8),
      ('Matematika i informatika - nastavnički', 'Mathematics and Computer Science - Teaching', 'MAT-INF', pmf_zagreb_id, 'integrirani', 5, 300, 9)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- ZAGREB - EFZG (Faculty of Economics)
  -- ==========================================

  IF efzg_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Integrated 5-year program
      ('Poslovna ekonomija', 'Business Economics', 'PE', efzg_id, 'integrirani', 5, 300, 1),
      ('Ekonomija', 'Economics', 'EKO', efzg_id, 'integrirani', 5, 300, 2)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- SPLIT - PMF (Faculty of Science)
  -- ==========================================

  IF pmfst_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Matematika', 'Mathematics', 'MAT', pmfst_id, 'preddiplomski', 3, 180, 1),
      ('Informatika', 'Computer Science', 'INF', pmfst_id, 'preddiplomski', 3, 180, 2),
      ('Fizika', 'Physics', 'FIZ', pmfst_id, 'preddiplomski', 3, 180, 3),
      ('Kemija', 'Chemistry', 'KEM', pmfst_id, 'preddiplomski', 3, 180, 4),
      ('Biologija', 'Biology', 'BIO', pmfst_id, 'preddiplomski', 3, 180, 5),
      ('Okolišno inženjerstvo', 'Environmental Engineering', 'OI', pmfst_id, 'preddiplomski', 3, 180, 6)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- SPLIT - FESB (Faculty of Electrical Engineering, Mechanical Engineering and Naval Architecture)
  -- ==========================================

  IF fesb_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate University Programs
      ('Elektrotehnika i informacijska tehnologija', 'Electrical Engineering and Information Technology', 'EIT', fesb_id, 'preddiplomski', 3, 180, 1),
      ('Strojarstvo', 'Mechanical Engineering', 'STR', fesb_id, 'preddiplomski', 3, 180, 2),
      ('Industrijsko inženjerstvo', 'Industrial Engineering', 'II', fesb_id, 'preddiplomski', 3, 180, 3),
      -- Professional Programs
      ('Brodogradnja - stručni', 'Naval Architecture - Professional', 'BRO', fesb_id, 'preddiplomski', 3, 180, 4),
      ('Strojarstvo - stručni', 'Mechanical Engineering - Professional', 'STR', fesb_id, 'preddiplomski', 3, 180, 5),
      ('Računarstvo - stručni', 'Computer Science - Professional', 'RČ', fesb_id, 'preddiplomski', 3, 180, 6),
      ('Elektrotehnika - stručni', 'Electrical Engineering - Professional', 'EL', fesb_id, 'preddiplomski', 3, 180, 7),
      -- Graduate
      ('Komunikacijske i informacijske tehnologije', 'Communication and Information Technology', 'KIT', fesb_id, 'diplomski', 2, 120, 8)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- SPLIT - EFST (Faculty of Economics)
  -- ==========================================

  IF efst_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Poslovna ekonomija', 'Business Economics', 'PE', efst_id, 'preddiplomski', 3, 180, 1),
      ('Poslovna ekonomija - stručni', 'Business Economics - Professional', 'PE', efst_id, 'preddiplomski', 3, 180, 2),
      -- Specialist
      ('Ekonomija - specijalistički', 'Economics - Specialist', 'EKO', efst_id, 'poslijediplomski', 2, 120, 3),
      ('Poslovna ekonomija - specijalistički', 'Business Economics - Specialist', 'PE', efst_id, 'poslijediplomski', 2, 120, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- RIJEKA - FIDIT (Faculty of Informatics and Digital Technologies)
  -- ==========================================

  IF fidit_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate with tracks
      ('Informatika - Razvoj programske potpore', 'Computer Science - Software Development', 'INF-RPP', fidit_id, 'preddiplomski', 3, 180, 1),
      ('Informatika - Multimedijski sustavi', 'Computer Science - Multimedia Systems', 'INF-MS', fidit_id, 'preddiplomski', 3, 180, 2),
      ('Informatika - Informacijski sustavi', 'Computer Science - Information Systems', 'INF-IS', fidit_id, 'preddiplomski', 3, 180, 3),
      ('Informatika - Komunikacijski sustavi', 'Computer Science - Communication Systems', 'INF-KS', fidit_id, 'preddiplomski', 3, 180, 4),
      -- Graduate
      ('Informatika - Inteligentni i interaktivni sustavi', 'Computer Science - Intelligent and Interactive Systems', 'INF-IIS', fidit_id, 'diplomski', 2, 120, 5),
      ('Informatika - Poslovna informatika', 'Computer Science - Business Informatics', 'INF-PI', fidit_id, 'diplomski', 2, 120, 6),
      ('Informatika - nastavnički', 'Computer Science - Teaching', 'INF-N', fidit_id, 'diplomski', 2, 120, 7)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- RIJEKA - RITEH (Technical Faculty)
  -- ==========================================

  IF riteh_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Strojarstvo', 'Mechanical Engineering', 'STR', riteh_id, 'preddiplomski', 3, 180, 1),
      ('Brodogradnja', 'Naval Architecture', 'BRO', riteh_id, 'preddiplomski', 3, 180, 2),
      ('Elektrotehnika i računarsko inženjerstvo', 'Electrical and Computer Engineering', 'ERI', riteh_id, 'preddiplomski', 3, 180, 3),
      ('Mehatronika i robotika', 'Mechatronics and Robotics', 'MR', riteh_id, 'preddiplomski', 3, 180, 4),
      -- Graduate
      ('Strojarstvo', 'Mechanical Engineering', 'STR', riteh_id, 'diplomski', 2, 120, 5)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- RIJEKA - EFRI (Faculty of Economics)
  -- ==========================================

  IF efri_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Poslovna ekonomija', 'Business Economics', 'PE', efri_id, 'preddiplomski', 3, 180, 1),
      -- Graduate - Regular
      ('Financije', 'Finance', 'FIN', efri_id, 'diplomski', 2, 120, 2),
      ('Marketing', 'Marketing', 'MKT', efri_id, 'diplomski', 2, 120, 3),
      ('Međunarodno poslovanje', 'International Business', 'MP', efri_id, 'diplomski', 2, 120, 4),
      ('Menadžment', 'Management', 'MAN', efri_id, 'diplomski', 2, 120, 5),
      ('Poduzetništvo', 'Entrepreneurship', 'POD', efri_id, 'diplomski', 2, 120, 6),
      ('Financije i računovodstvo', 'Finance and Accounting', 'FiR', efri_id, 'diplomski', 2, 120, 7),
      ('International Business', 'International Business', 'IB', efri_id, 'diplomski', 2, 120, 8),
      -- Online Graduate Programs
      ('Financije - online', 'Finance - Online', 'FIN-O', efri_id, 'diplomski', 2, 120, 9),
      ('Menadžment - online', 'Management - Online', 'MAN-O', efri_id, 'diplomski', 2, 120, 10),
      ('Poduzetništvo - online', 'Entrepreneurship - Online', 'POD-O', efri_id, 'diplomski', 2, 120, 11)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- OSIJEK - FERIT (Faculty of Electrical Engineering, Computer Science and Information Technology)
  -- ==========================================

  IF ferit_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- University Undergraduate
      ('Elektrotehnika - Informacijske i komunikacijske tehnologije', 'Electrical Engineering - ICT', 'EL-IKT', ferit_id, 'preddiplomski', 3, 180, 1),
      ('Računarstvo', 'Computer Science', 'RČ', ferit_id, 'preddiplomski', 3, 180, 2),
      -- Professional Undergraduate
      ('Elektrotehnika - stručni', 'Electrical Engineering - Professional', 'EL', ferit_id, 'preddiplomski', 3, 180, 3),
      ('Računarstvo - stručni', 'Computer Science - Professional', 'RČ', ferit_id, 'preddiplomski', 3, 180, 4),
      -- Graduate
      ('Automobilsko računarstvo i komunikacije', 'Automotive Computing and Communications', 'ARK', ferit_id, 'diplomski', 2, 120, 5)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- OSIJEK - EFOS (Faculty of Economics)
  -- ==========================================

  IF efos_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Undergraduate
      ('Ekonomija i poslovna ekonomija', 'Economics and Business Economics', 'EPE', efos_id, 'preddiplomski', 3, 180, 1),
      -- Graduate
      ('Računovodstvo', 'Accounting', 'RAČ', efos_id, 'diplomski', 2, 120, 2),
      ('Trgovina', 'Commerce', 'TRG', efos_id, 'diplomski', 2, 120, 3),
      ('Poduzetništvo i inovacije', 'Entrepreneurship and Innovation', 'P&I', efos_id, 'diplomski', 2, 120, 4),
      ('Menadžment', 'Management', 'MAN', efos_id, 'diplomski', 2, 120, 5),
      ('Financije i bankarstvo', 'Finance and Banking', 'F&B', efos_id, 'diplomski', 2, 120, 6),
      ('Marketing', 'Marketing', 'MKT', efos_id, 'diplomski', 2, 120, 7)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

  -- ==========================================
  -- OSIJEK - PRAVOS (Faculty of Law)
  -- ==========================================

  IF pravos_id IS NOT NULL THEN
    INSERT INTO study_programs (name, name_en, abbreviation, faculty_id, degree_level, duration_years, ects_credits, order_index) VALUES
      -- Integrated
      ('Pravo', 'Law', 'PRAVO', pravos_id, 'integrirani', 5, 300, 1),
      -- Undergraduate
      ('Socijalni rad', 'Social Work', 'SR', pravos_id, 'preddiplomski', 3, 180, 2),
      ('Upravni studij - stručni', 'Administrative Studies - Professional', 'US', pravos_id, 'preddiplomski', 3, 180, 3),
      -- Graduate
      ('Socijalni rad', 'Social Work', 'SR', pravos_id, 'diplomski', 2, 120, 4)
    ON CONFLICT (faculty_id, name) DO NOTHING;
  END IF;

END $$;

-- Summary of inserted programs
SELECT
  u.name as university,
  f.name as faculty,
  COUNT(*) as program_count
FROM study_programs sp
JOIN faculties f ON sp.faculty_id = f.id
JOIN universities u ON f.university_id = u.id
GROUP BY u.name, f.name
ORDER BY u.order_index, f.order_index;
