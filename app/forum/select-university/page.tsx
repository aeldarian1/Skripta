import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ArrowRight } from 'lucide-react';
import type { University } from '@/types/database';

// Cache this page for 1 hour
export const revalidate = 3600;

export const metadata = {
  title: 'Odaberi Sveučilište | Skripta',
  description: 'Odaberi svoje sveučilište i pristupi forumu.',
};

export default async function SelectUniversityPage() {
  const supabase = await createServerSupabaseClient();

  const { data: universities } = await supabase
    .from('universities')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-skripta flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Odaberi Sveučilište
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Odaberi sveučilište koje studiraš i pristupi svom fakultetu
          </p>
        </div>

        {/* University Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {(universities as University[] || []).map((university) => (
            <Link
              key={university.id}
              href={`/forum/select-university/${university.slug}`}
            >
              <Card className="hover-lift cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {university.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {university.city}
                      </p>
                      {university.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          {university.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Text */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Slobodno možeš prebacivati između sveučilišta i fakulteta</p>
        </div>
      </div>
    </div>
  );
}
