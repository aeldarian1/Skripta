import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ArrowRight, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Faculty, University } from '@/types/database';
import { Button } from '@/components/ui/button';

// Cache this page for 1 hour
export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    university: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { university: universitySlug } = await params;

  return {
    title: `Odaberi Fakultet | Skripta`,
    description: `Odaberi fakultet na kojem studiraš`,
  };
}

export default async function SelectFacultyPage({ params }: PageProps) {
  const { university: universitySlug } = await params;
  const supabase = await createServerSupabaseClient();

  // Get university
  const { data: university } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', universitySlug)
    .single() as { data: University | null };

  if (!university) {
    notFound();
  }

  // Get faculties for this university
  const { data: faculties } = await supabase
    .from('faculties')
    .select('*')
    .eq('university_id', university.id)
    .order('order_index', { ascending: true }) as { data: Faculty[] | null };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Back Button */}
        <div>
          <Link href="/forum/select-university">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Natrag na sveučilišta
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-skripta flex items-center justify-center">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {university.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Odaberi fakultet na kojem studiraš
          </p>
        </div>

        {/* Faculty Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(faculties || []).map((faculty) => (
            <Link
              key={faculty.id}
              href={`/forum/${universitySlug}/${faculty.slug}`}
            >
              <Card className="hover-lift cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all group h-full">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {faculty.abbreviation}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {faculty.name}
                      </h3>
                      {faculty.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                          {faculty.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Text */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Možeš lako prebacivati između fakulteta i sveučilišta</p>
        </div>
      </div>
    </div>
  );
}
