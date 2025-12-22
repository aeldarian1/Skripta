import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { MessageSquare, Pin, CheckCircle, ChevronLeft } from 'lucide-react';
import type { University, Faculty, Category } from '@/types/database';

// Revalidate every 60 seconds (1 minute) for better cache performance
export const revalidate = 60;

const TOPICS_PER_PAGE = 20;

interface PageProps {
  params: Promise<{
    university: string;
    faculty: string;
    slug: string;
  }>;
  searchParams: Promise<{ page?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { university: universitySlug, faculty: facultySlug, slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single() as { data: Pick<Category, 'name' | 'description'> | null };

  if (!category) {
    return {
      title: 'Kategorija nije pronađena',
    };
  }

  const categoryName = category.name;
  const categoryDescription = category.description;

  return {
    title: `${categoryName} | Skripta Forum`,
    description: categoryDescription || `Pregledajte teme u kategoriji ${categoryName}`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { university: universitySlug, faculty: facultySlug, slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const offset = (currentPage - 1) * TOPICS_PER_PAGE;
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

  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, color, faculty_id')
    .eq('slug', slug)
    .eq('faculty_id', faculty.id)
    .single() as { data: Pick<Category, 'id' | 'name' | 'slug' | 'description' | 'icon' | 'color' | 'faculty_id'> | null };

  if (!category) {
    notFound();
  }

  // Get topics with count in single query for better performance
  const { data: topics, count: totalCount } = await supabase
    .from('topics')
    .select(`
      id,
      title,
      slug,
      created_at,
      is_pinned,
      is_locked,
      has_solution,
      view_count,
      reply_count,
      last_reply_at,
      faculty_id,
      author:profiles!topics_author_id_fkey(username, avatar_url),
      category:categories(name, slug, color)
    `, { count: 'exact' })
    .eq('category_id', category.id)
    .eq('faculty_id', faculty.id)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + TOPICS_PER_PAGE - 1);

  const totalPages = Math.ceil((totalCount || 0) / TOPICS_PER_PAGE);

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/forum/select-university">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Sveučilišta
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/forum/select-university/${universitySlug}`}>
          <Button variant="ghost" size="sm">
            {university.name}
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/forum/${universitySlug}/${facultySlug}`}>
          <Button variant="ghost" size="sm">
            {faculty.abbreviation || faculty.name}
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-gray-900 dark:text-white">
          {category.name}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div
              className="text-3xl sm:text-4xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
              style={{ backgroundColor: category.color + '20' }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{category.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {category.description}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/forum/${universitySlug}/${facultySlug}/new?category=${slug}`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Nova tema</Button>
        </Link>
      </div>

      {/* Topic count */}
      <div className="text-sm text-gray-500">
        {totalCount} {totalCount === 1 ? 'tema' : 'tema'} ukupno
        {totalPages > 1 && ` - Stranica ${currentPage} od ${totalPages}`}
      </div>

      {topics && topics.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {topics.map((topic: any) => (
            <Card key={topic.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                      {topic.is_pinned && (
                        <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                      )}
                      {topic.is_locked && (
                        <span className="text-sm sm:text-base text-gray-400 dark:text-gray-500">🔒</span>
                      )}
                      {topic.has_solution && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                          <CheckCircle className="w-3 h-3" />
                          Rijeseno
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/forum/${universitySlug}/${facultySlug}/topic/${topic.slug}`}
                      className="text-base sm:text-xl font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors block line-clamp-2"
                    >
                      {topic.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        od {topic.author?.username}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        {topic.reply_count}
                      </span>
                      <span className="hidden sm:inline">
                        {new Date(topic.created_at).toLocaleDateString('hr-HR')}
                      </span>
                      {topic.last_reply_at && (
                        <span className="hidden md:inline text-gray-400 dark:text-gray-500">
                          zadnji: {new Date(topic.last_reply_at).toLocaleDateString('hr-HR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{topic.view_count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">pregleda</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              Nema jos tema u ovoj kategoriji. Budi prvi i stvori novu!
            </p>
            <Link href={`/forum/${universitySlug}/${facultySlug}/new?category=${slug}`}>
              <Button className="mt-4">Stvori prvu temu</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/forum/${universitySlug}/${facultySlug}/category/${slug}`}
      />
    </div>
  );
}
