/**
 * Verification script to check if the database schema is properly configured
 * for the faculty preference feature.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fshdebfiyokhhrgqvnpz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGRlYmZpeW9raGhyZ3F2bnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzYwODgsImV4cCI6MjA4MDM1MjA4OH0.XK2fHsKssIg6Q_1Iyx3Wowj4CbMsRGZsGtNC2VSMwGc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySchema() {
  console.log('🔍 Verifying Supabase schema for faculty preference feature...\n');

  try {
    // Check if universities table exists and has data
    console.log('1️⃣ Checking universities table...');
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name, slug')
      .limit(1);

    if (uniError) {
      console.log('   ❌ Error:', uniError.message);
      return false;
    }
    console.log('   ✅ Universities table exists');
    console.log(`   📊 Sample:`, universities?.[0] || 'No data yet');

    // Check if faculties table exists and has data
    console.log('\n2️⃣ Checking faculties table...');
    const { data: faculties, error: facError } = await supabase
      .from('faculties')
      .select('id, name, slug, university_id')
      .limit(1);

    if (facError) {
      console.log('   ❌ Error:', facError.message);
      return false;
    }
    console.log('   ✅ Faculties table exists');
    console.log(`   📊 Sample:`, faculties?.[0] || 'No data yet');

    // Check if profiles table has university_id and faculty_id columns
    console.log('\n3️⃣ Checking profiles table columns...');
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, university_id, faculty_id')
      .limit(1);

    if (profError) {
      console.log('   ❌ Error:', profError.message);
      return false;
    }
    console.log('   ✅ Profiles table has university_id and faculty_id columns');
    console.log(`   📊 Sample:`, profiles?.[0] || 'No data yet');

    // Check if categories have faculty_id
    console.log('\n4️⃣ Checking categories table faculty_id column...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, faculty_id')
      .limit(1);

    if (catError) {
      console.log('   ❌ Error:', catError.message);
      return false;
    }
    console.log('   ✅ Categories table has faculty_id column');
    console.log(`   📊 Sample:`, categories?.[0] || 'No data yet');

    console.log('\n✅ All schema checks passed!');
    console.log('\n📝 Summary:');
    console.log('   - Universities table: ✓');
    console.log('   - Faculties table: ✓');
    console.log('   - Profiles.university_id: ✓');
    console.log('   - Profiles.faculty_id: ✓');
    console.log('   - Categories.faculty_id: ✓');
    console.log('\n🎉 Database is properly configured for faculty preference feature!');

    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

verifySchema().then((success) => {
  process.exit(success ? 0 : 1);
});
