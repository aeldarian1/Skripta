import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CreateTopicPage } from '@/app/forum/new/create-topic-page';
import type { University, Faculty, Category } from '@/types/database';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    university: string;
    faculty: string;
  }>;
  searchParams: Promise<{ category?: string }>;
}

export const metadata = {
  title: 'Nova tema | Studentski Forum',
  description: 'Stvori novu temu na forumu',
};

export default async function NewTopicServerPage({ params, searchParams }: PageProps) {
  const { university: universitySlug, faculty: facultySlug } = await params;
  const { category: categorySlug } = await searchParams;
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get university
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', universitySlug)
    .single() as { data: University | null };

  if (!university) {
    notFound();
  }

  // Get faculty
  const { data: faculty } = await supabase
    .from('faculties')
    .select('*')
    .eq('university_id', university.id)
    .eq('slug', facultySlug)
    .single() as { data: Faculty | null };

  if (!faculty) {
    notFound();
  }

  // Load categories for this faculty only
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('faculty_id', faculty.id)
    .order('order_index', { ascending: true }) as { data: Category[] | null };

  // Load tags
  const { data: tags } = await supabase.from('tags').select('*').order('name');

  // Load existing draft
  const { data: draft } = await supabase
    .from('topic_drafts')
    .select('*')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Find the pre-selected category if provided
  const preSelectedCategory = categorySlug
    ? categories?.find(c => c.slug === categorySlug)
    : null;

  return (
    <CreateTopicPage
      categories={categories || []}
      tags={tags || []}
      initialDraft={draft}
      universitySlug={universitySlug}
      facultySlug={facultySlug}
      facultyId={faculty.id}
      preSelectedCategoryId={preSelectedCategory?.id}
    />
  );
}
