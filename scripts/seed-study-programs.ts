import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your-service-role-key-here') {
  console.error('❌ Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('\n📝 To fix this:');
  console.log('1. Go to https://supabase.com/dashboard/project/fshdebfiyokhhrgqvnpz/settings/api');
  console.log('2. Copy the "service_role" key (not anon key)');
  console.log('3. Update SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.log('4. Re-run this script\n');
  process.exit(1);
}

type StudyProgramInsert = Database['public']['Tables']['study_programs']['Insert'];

async function seedStudyPrograms() {
  console.log('🚀 Starting study programs seed...\n');

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // First, verify the table exists
  const { data: existingPrograms, error: checkError } = await supabase
    .from('study_programs')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('❌ Error: study_programs table might not exist yet');
    console.error('Error:', checkError.message);
    console.log('\n📝 Please run the migration first:');
    console.log('   supabase/migrations/20251222_create_study_programs.sql');
    console.log('   in the Supabase Dashboard SQL Editor\n');
    return;
  }

  console.log('✅ study_programs table exists\n');

  // Get all faculties with their university info
  const { data: faculties, error: facultiesError } = await supabase
    .from('faculties')
    .select('id, slug, name, universities(slug)');

  if (facultiesError) {
    console.error('❌ Error fetching faculties:', facultiesError.message);
    return;
  }

  console.log(`📚 Found ${faculties?.length || 0} faculties\n`);

  if (!faculties || faculties.length === 0) {
    console.error('❌ No faculties found. Please ensure faculties data exists.');
    return;
  }

  // Create a map of faculty slug to faculty ID
  const facultyMap = new Map(faculties.map(f => [f.slug, f.id]));

  // Define all study programs grouped by faculty slug
  const programsByFaculty: Record<string, Omit<StudyProgramInsert, 'faculty_id'>[]> = {
    // FER - Zagreb (6 programs)
    'fer': [
      { name: 'Elektrotehnika i informacijska tehnologija', name_en: 'Electrical Engineering and Information Technology', abbreviation: 'EIT', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Računarstvo', name_en: 'Computing', abbreviation: 'RČ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Elektrotehnika i informacijska tehnologija - diplomski', name_en: 'EIT Graduate', abbreviation: 'EIT', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 3 },
      { name: 'Informacijska i komunikacijska tehnologija', name_en: 'Information and Communication Technology', abbreviation: 'IKT', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 4 },
      { name: 'Računarstvo - diplomski', name_en: 'Computing Graduate', abbreviation: 'RČ', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
      { name: 'Biomedicinsko inženjerstvo', name_en: 'Biomedical Engineering', abbreviation: 'BMI', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 6 },
    ],

    // PMF Zagreb (9 programs)
    'pmf-zagreb': [
      { name: 'Matematika', name_en: 'Mathematics', abbreviation: 'MAT', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Fizika', name_en: 'Physics', abbreviation: 'FIZ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Kemija', name_en: 'Chemistry', abbreviation: 'KEM', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Biologija', name_en: 'Biology', abbreviation: 'BIO', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Geologija', name_en: 'Geology', abbreviation: 'GEO', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 5 },
      { name: 'Geografija', name_en: 'Geography', abbreviation: 'GGR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 6 },
      { name: 'Geofizika', name_en: 'Geophysics', abbreviation: 'GFZ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 7 },
      { name: 'Matematika i fizika - nastavnički', name_en: 'Mathematics and Physics - Teaching', abbreviation: 'MF-N', degree_level: 'integrirani', duration_years: 5, ects_credits: 300, order_index: 8 },
      { name: 'Matematika i informatika - nastavnički', name_en: 'Mathematics and Informatics - Teaching', abbreviation: 'MI-N', degree_level: 'integrirani', duration_years: 5, ects_credits: 300, order_index: 9 },
    ],

    // EFZG (2 programs)
    'efzg': [
      { name: 'Poslovna ekonomija', name_en: 'Business Economics', abbreviation: 'PE', degree_level: 'integrirani', duration_years: 5, ects_credits: 300, order_index: 1 },
      { name: 'Ekonomija', name_en: 'Economics', abbreviation: 'EKO', degree_level: 'integrirani', duration_years: 5, ects_credits: 300, order_index: 2 },
    ],

    // PMF Split (6 programs)
    'pmf-split': [
      { name: 'Matematika', name_en: 'Mathematics', abbreviation: 'MAT', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Informatika', name_en: 'Computer Science', abbreviation: 'INF', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Fizika', name_en: 'Physics', abbreviation: 'FIZ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Kemija', name_en: 'Chemistry', abbreviation: 'KEM', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Biologija', name_en: 'Biology', abbreviation: 'BIO', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 5 },
      { name: 'Okolišno inženjerstvo', name_en: 'Environmental Engineering', abbreviation: 'OI', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 6 },
    ],

    // FESB (8 programs)
    'fesb': [
      { name: 'Elektrotehnika i informacijska tehnologija', name_en: 'Electrical Engineering and Information Technology', abbreviation: 'EIT', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Strojarstvo', name_en: 'Mechanical Engineering', abbreviation: 'STR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Industrijsko inženjerstvo', name_en: 'Industrial Engineering', abbreviation: 'II', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Brodogradnja - stručni', name_en: 'Naval Architecture - Professional', abbreviation: 'BRO', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Strojarstvo - stručni', name_en: 'Mechanical Engineering - Professional', abbreviation: 'STR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 5 },
      { name: 'Računarstvo - stručni', name_en: 'Computing - Professional', abbreviation: 'RČ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 6 },
      { name: 'Elektrotehnika - stručni', name_en: 'Electrical Engineering - Professional', abbreviation: 'EL', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 7 },
      { name: 'Komunikacijske i informacijske tehnologije', name_en: 'Communication and Information Technologies', abbreviation: 'KIT', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 8 },
    ],

    // EFST (4 programs)
    'efst': [
      { name: 'Poslovna ekonomija - sveučilišni', name_en: 'Business Economics - University', abbreviation: 'PE', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Poslovna ekonomija - stručni', name_en: 'Business Economics - Professional', abbreviation: 'PE', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Ekonomija - specijalistički', name_en: 'Economics - Specialist', abbreviation: 'EKO', degree_level: 'poslijediplomski', duration_years: 1, ects_credits: 60, order_index: 3 },
      { name: 'Poslovna ekonomija - specijalistički', name_en: 'Business Economics - Specialist', abbreviation: 'PE', degree_level: 'poslijediplomski', duration_years: 1, ects_credits: 60, order_index: 4 },
    ],

    // FIDIT (7 programs)
    'fidit': [
      { name: 'Informatika - Razvoj programske potpore', name_en: 'Informatics - Software Development', abbreviation: 'RPP', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Informatika - Multimedijski sustavi', name_en: 'Informatics - Multimedia Systems', abbreviation: 'MS', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Informatika - Informacijski sustavi', name_en: 'Informatics - Information Systems', abbreviation: 'IS', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Informatika - Komunikacijski sustavi', name_en: 'Informatics - Communication Systems', abbreviation: 'KS', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Informatika - Inteligentni i interaktivni sustavi', name_en: 'Informatics - Intelligent and Interactive Systems', abbreviation: 'IIS', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
      { name: 'Informatika - Poslovna informatika', name_en: 'Informatics - Business Informatics', abbreviation: 'PI', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 6 },
      { name: 'Informatika - nastavnički smjer', name_en: 'Informatics - Teaching', abbreviation: 'INF-N', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 7 },
    ],

    // RITEH (5 programs)
    'riteh': [
      { name: 'Strojarstvo', name_en: 'Mechanical Engineering', abbreviation: 'STR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Brodogradnja', name_en: 'Naval Architecture', abbreviation: 'BRO', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Elektrotehnika i računarsko inženjerstvo', name_en: 'Electrical Engineering and Computer Engineering', abbreviation: 'ERI', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Mehatronika i robotika', name_en: 'Mechatronics and Robotics', abbreviation: 'MR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Strojarstvo - diplomski', name_en: 'Mechanical Engineering - Graduate', abbreviation: 'STR', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
    ],

    // EFRI (11 programs)
    'efri': [
      { name: 'Poslovna ekonomija', name_en: 'Business Economics', abbreviation: 'PE', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Financije', name_en: 'Finance', abbreviation: 'FIN', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 2 },
      { name: 'Marketing', name_en: 'Marketing', abbreviation: 'MKT', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 3 },
      { name: 'Međunarodno poslovanje', name_en: 'International Business', abbreviation: 'MP', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 4 },
      { name: 'Menadžment', name_en: 'Management', abbreviation: 'MAN', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
      { name: 'Poduzetništvo', name_en: 'Entrepreneurship', abbreviation: 'POD', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 6 },
      { name: 'Financije i računovodstvo', name_en: 'Finance and Accounting', abbreviation: 'FiR', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 7 },
      { name: 'International Business - English', name_en: 'International Business', abbreviation: 'IB', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 8 },
      { name: 'Financije - online', name_en: 'Finance - Online', abbreviation: 'FIN', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 9 },
      { name: 'Menadžment - online', name_en: 'Management - Online', abbreviation: 'MAN', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 10 },
      { name: 'Poduzetništvo - online', name_en: 'Entrepreneurship - Online', abbreviation: 'POD', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 11 },
    ],

    // FERIT (5 programs)
    'ferit': [
      { name: 'Elektrotehnika - Informacijske i komunikacijske tehnologije', name_en: 'Electrical Engineering - ICT', abbreviation: 'IKT', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Računarstvo', name_en: 'Computing', abbreviation: 'RČ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Elektrotehnika - stručni', name_en: 'Electrical Engineering - Professional', abbreviation: 'EL', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Računarstvo - stručni', name_en: 'Computing - Professional', abbreviation: 'RČ', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 4 },
      { name: 'Automobilsko računarstvo i komunikacije', name_en: 'Automotive Computing and Communications', abbreviation: 'ARK', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
    ],

    // EFOS (7 programs)
    'efos': [
      { name: 'Ekonomija i poslovna ekonomija', name_en: 'Economics and Business Economics', abbreviation: 'EPE', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 1 },
      { name: 'Računovodstvo', name_en: 'Accounting', abbreviation: 'RAČ', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 2 },
      { name: 'Trgovina', name_en: 'Trade', abbreviation: 'TRG', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 3 },
      { name: 'Poduzetništvo i inovacije', name_en: 'Entrepreneurship and Innovation', abbreviation: 'P&I', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 4 },
      { name: 'Menadžment', name_en: 'Management', abbreviation: 'MAN', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 5 },
      { name: 'Financije i bankarstvo', name_en: 'Finance and Banking', abbreviation: 'F&B', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 6 },
      { name: 'Marketing', name_en: 'Marketing', abbreviation: 'MKT', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 7 },
    ],

    // PRAVOS (4 programs)
    'pravos': [
      { name: 'Pravo', name_en: 'Law', abbreviation: 'LAW', degree_level: 'integrirani', duration_years: 5, ects_credits: 300, order_index: 1 },
      { name: 'Socijalni rad', name_en: 'Social Work', abbreviation: 'SR', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 2 },
      { name: 'Upravni studij - stručni', name_en: 'Administrative Studies - Professional', abbreviation: 'US', degree_level: 'preddiplomski', duration_years: 3, ects_credits: 180, order_index: 3 },
      { name: 'Socijalni rad - diplomski', name_en: 'Social Work - Graduate', abbreviation: 'SR', degree_level: 'diplomski', duration_years: 2, ects_credits: 120, order_index: 4 },
    ],
  };

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Insert programs for each faculty
  for (const [facultySlug, programs] of Object.entries(programsByFaculty)) {
    const facultyId = facultyMap.get(facultySlug);

    if (!facultyId) {
      console.log(`⚠️  Skipping ${facultySlug} - faculty not found`);
      totalSkipped += programs.length;
      continue;
    }

    console.log(`📝 Inserting ${programs.length} programs for ${facultySlug}...`);

    for (const program of programs) {
      const { error } = await supabase
        .from('study_programs')
        .insert({
          ...program,
          faculty_id: facultyId,
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate key - program already exists
          totalSkipped++;
        } else {
          console.error(`   ❌ Error inserting "${program.name}":`, error.message);
          totalErrors++;
        }
      } else {
        totalInserted++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Seed Summary:');
  console.log(`✅ Inserted: ${totalInserted} programs`);
  console.log(`⏭️  Skipped (already exist): ${totalSkipped} programs`);
  console.log(`❌ Errors: ${totalErrors} programs`);
  console.log('='.repeat(60) + '\n');

  // Verify final count
  const { count } = await supabase
    .from('study_programs')
    .select('*', { count: 'exact', head: true });

  console.log(`🎉 Total study programs in database: ${count}\n`);
}

seedStudyPrograms()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
