const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmptyTopics() {
  console.log('Checking for empty or problematic topics...\n');

  // Check for topics with empty or whitespace-only titles
  const { data: emptyTitles, error: titleError } = await supabase
    .from('topics')
    .select('id, title, content, author_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (titleError) {
    console.error('Error fetching topics:', titleError);
    return;
  }

  console.log(`Found ${emptyTitles.length} recent topics\n`);

  const problematic = emptyTitles.filter(t => 
    !t.title || t.title.trim() === '' || 
    !t.content || t.content.trim() === ''
  );

  if (problematic.length > 0) {
    console.log(`⚠️  Found ${problematic.length} problematic topics:\n`);
    problematic.forEach(t => {
      console.log(`Topic ID: ${t.id}`);
      console.log(`Title: "${t.title}" (length: ${t.title?.length || 0})`);
      console.log(`Content: "${t.content?.substring(0, 50)}..." (length: ${t.content?.length || 0})`);
      console.log(`Created: ${t.created_at}`);
      console.log('---\n');
    });
  } else {
    console.log('✅ No problematic topics found');
  }

  // Check for topics with very short content
  const shortContent = emptyTitles.filter(t => 
    t.content && t.content.trim().length < 10
  );

  if (shortContent.length > 0) {
    console.log(`\n⚠️  Found ${shortContent.length} topics with very short content:\n`);
    shortContent.forEach(t => {
      console.log(`Topic ID: ${t.id}`);
      console.log(`Title: "${t.title}"`);
      console.log(`Content: "${t.content}"`);
      console.log('---\n');
    });
  }
}

checkEmptyTopics();
