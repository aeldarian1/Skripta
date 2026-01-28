import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { University, Faculty, Profile } from '@/types/database';

// Metadata for SEO
export const metadata = {
  title: 'Forum | Skripta - Hrvatska Studentska Zajednica',
  description: 'Pridruži se diskusijama, postavi pitanja i razmijeni znanje s hrvatskim studentima. Najbolja studentska zajednica u Hrvatskoj.',
};

export default async function ForumPage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, check for saved faculty preference
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('university_id, faculty_id')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'university_id' | 'faculty_id'> | null };

    // If user has saved preferences, redirect to their faculty forum
    if (profile?.university_id && profile?.faculty_id) {
      // Get university and faculty slugs
      const { data: university } = await supabase
        .from('universities')
        .select('slug')
        .eq('id', profile.university_id)
        .single() as { data: Pick<University, 'slug'> | null };

      const { data: faculty } = await supabase
        .from('faculties')
        .select('slug')
        .eq('id', profile.faculty_id)
        .single() as { data: Pick<Faculty, 'slug'> | null };

      if (university && faculty) {
        redirect(`/forum/${university.slug}/${faculty.slug}`);
      }
    }
  }

  // Default: redirect to university selection page
  redirect('/forum/select-university');
}
