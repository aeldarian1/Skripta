const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

// Hardcode for quick verification
const supabase = createClient(
  'https://fshdebfiyokhhrgqvnpz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGRlYmZpeW9raGhyZ3F2bnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzYwODgsImV4cCI6MjA4MDM1MjA4OH0.XK2fHsKssIg6Q_1Iyx3Wowj4CbMsRGZsGtNC2VSMwGc'
);

async function checkCategories() {
  console.log('Checking categories in database...\n');

  // Get all categories
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, order_index, created_at')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }

  console.log(`Total categories found: ${categories.length}\n`);

  // Group by slug to find duplicates
  const slugMap = new Map();
  categories.forEach(cat => {
    if (!slugMap.has(cat.slug)) {
      slugMap.set(cat.slug, []);
    }
    slugMap.get(cat.slug).push(cat);
  });

  // Check for duplicates
  let hasDuplicates = false;
  slugMap.forEach((cats, slug) => {
    if (cats.length > 1) {
      hasDuplicates = true;
      console.log(`❌ DUPLICATE found for slug "${slug}":`);
      cats.forEach(cat => {
        console.log(`   - ID: ${cat.id}, Name: ${cat.name}, Created: ${cat.created_at}`);
      });
      console.log();
    }
  });

  if (!hasDuplicates) {
    console.log('✅ No duplicates found!\n');
  }

  // List all categories
  console.log('All categories:');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (${cat.slug}) - Order: ${cat.order_index}`);
  });
}

checkCategories();
