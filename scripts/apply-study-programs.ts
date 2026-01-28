import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function applyMigration() {
  console.log('🚀 Starting study programs migration...\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Read the SQL file
  const sqlPath = path.join(process.cwd(), 'supabase', 'APPLY_STUDY_PROGRAMS.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  // Split into individual statements (excluding comments and empty lines)
  const statements = sqlContent
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip comments
    if (statement.startsWith('--') || statement.length === 0) {
      continue;
    }

    try {
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';',
      });

      if (error) {
        console.error(`❌ Error:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50) + '\n');

  // Verify the migration
  console.log('🔍 Verifying study programs table...\n');

  const { data: programs, error: verifyError } = await supabase
    .from('study_programs')
    .select('*', { count: 'exact', head: true });

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError.message);
  } else {
    console.log(`✅ Study programs table exists`);

    // Get count of programs by faculty
    const { data: summary } = await supabase
      .from('study_programs')
      .select('faculty_id, faculties(name)', { count: 'exact' });

    if (summary) {
      console.log(`\n📚 Total study programs: ${summary.length}`);
    }
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
