import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Flame, Clock, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Category, Topic, Profile, University, Faculty } from '@/types/database';
import { Button } from '@/components/ui/button';
import { TopicListClient } from '@/components/forum/topic-list-client';

interface TopicWithCategoryAndAuthor extends Topic {
  category: Pick<Category, 'name' | 'slug' | 'color'> | null;
  author: Pick<Profile, 'username' | 'avatar_url'> | null;
}

interface LatestTopicData {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  category_id: string;
  author: Pick<Profile, 'username'> | null;
}

interface CategoryWithStats extends Category {
  topic_count: number;
  latest_topic: LatestTopicData | null;
}

// Cache this page for 5 minutes
export const revalidate = 300;

const TOPICS_PER_PAGE = 15;

interface PageProps {
  params: Promise<{
    university: string;
    faculty: string;
  }>;
  searchParams: Promise<{ page?: string; filter?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { university: universitySlug, faculty: facultySlug } = await params;

  return {
    title: `Forum | Skripta`,
    description: `Forum za studente`,
  };
}

export default async function FacultyForumPage({ params, searchParams }: PageProps) {
  const { university: universitySlug, faculty: facultySlug } = await params;
  const { page, filter } = await searchParams;
  const currentPage = parseInt(page || '1', 10);
  const currentFilter = filter || 'all';
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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Run all queries in parallel
  const [
    { data: categories },
    { data: trendingTopics },
    { data: recentTopics, count: totalTopics }
  ] = await Promise.all([
    // Get categories for this faculty
    supabase
      .from('categories')
      .select('id, name, slug, description, icon, color, order_index, faculty_id')
      .eq('faculty_id', faculty.id)
      .order('order_index', { ascending: true }),

    // Get trending topics for this faculty
    supabase
      .from('topics')
      .select(`
        id,
        title,
        slug,
        view_count,
        reply_count,
        created_at,
        author:profiles!topics_author_id_fkey(username, avatar_url),
        category:categories(name, slug, color)
      `)
      .eq('faculty_id', faculty.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('view_count', { ascending: false })
      .limit(5),

    // Get recent topics for this faculty
    supabase
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
        category_id,
        faculty_id,
        author:profiles!topics_author_id_fkey(username, avatar_url),
        category:categories(name, slug, color, icon)
      `, { count: 'exact' })
      .eq('faculty_id', faculty.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + TOPICS_PER_PAGE - 1)
  ]);

  // Get category stats
  const { data: categoryTopicCounts } = await supabase
    .from('topics')
    .select('category_id')
    .eq('faculty_id', faculty.id)
    .order('created_at', { ascending: false });

  // Build maps for efficient lookup
  const topicCountByCategory = new Map<string, number>();
  const latestTopicByCategory = new Map<string, any>();

  // Count topics per category
  categoryTopicCounts?.forEach((topic: { category_id: string }) => {
    topicCountByCategory.set(
      topic.category_id,
      (topicCountByCategory.get(topic.category_id) || 0) + 1
    );
  });

  // Find latest topic per category
  recentTopics?.forEach((topic: any) => {
    if (!latestTopicByCategory.has(topic.category_id)) {
      latestTopicByCategory.set(topic.category_id, {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        created_at: topic.created_at,
        category_id: topic.category_id,
        author: topic.author
      });
    }
  });

  // Combine category data with counts
  const categoryData: CategoryWithStats[] = (categories as Category[] || []).map((category) => ({
    ...category,
    topic_count: topicCountByCategory.get(category.id) || 0,
    latest_topic: latestTopicByCategory.get(category.id) || null,
  }));

  const solvedCount = recentTopics?.filter((t: any) => t.has_solution === true).length || 0;
  const unsolvedCount = recentTopics?.filter((t: any) => !t.has_solution).length || 0;

  return (
    <div className="space-y-6 sm:space-y-8">
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
        <span className="font-semibold text-gray-900 dark:text-white">
          {faculty.abbreviation || faculty.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {faculty.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Pridruži se diskusijama i postavi svoja pitanja
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="grid gap-3 sm:gap-4">
        {categoryData.length === 0 ? (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                Nema dostupnih kategorija za ovaj fakultet. Molimo kontaktirajte administratora.
              </p>
            </CardContent>
          </Card>
        ) : (
          categoryData.map((category) => (
            <Card key={category.id} className="hover-lift cursor-pointer border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div
                      className="text-3xl sm:text-4xl flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/forum/${universitySlug}/${facultySlug}/category/${category.slug}`}>
                        <h3 className="text-lg sm:text-xl font-bold hover:text-primary transition-colors truncate text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                      </Link>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                      {category.latest_topic && (
                        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 line-clamp-1">
                          Zadnja:{' '}
                          <Link
                            href={`/forum/${universitySlug}/${facultySlug}/topic/${category.latest_topic.slug}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {category.latest_topic.title}
                          </Link>
                          <span className="hidden sm:inline">
                            {' od '}{category.latest_topic.author?.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {category.topic_count}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">tema</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Trending Topics */}
      {trendingTopics && trendingTopics.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Popularno</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(trendingTopics as unknown as TopicWithCategoryAndAuthor[])?.slice(0, 3).map((topic, index) => (
              <Card key={topic.id} className="hover-lift cursor-pointer border-gray-200 dark:border-gray-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-orange-500/50">#{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/forum/${universitySlug}/${facultySlug}/topic/${topic.slug}`}
                        className="text-sm sm:text-base font-bold hover:text-primary transition-colors block line-clamp-2 text-gray-900 dark:text-white"
                      >
                        {topic.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{topic.view_count} pregleda</span>
                        <span>•</span>
                        <span>{topic.reply_count} odgovora</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Topics */}
      {recentTopics && recentTopics.length > 0 && (
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sve Teme</h2>
          </div>

          <TopicListClient
            topics={(recentTopics || []) as any}
            totalCount={recentTopics?.length || 0}
            solvedCount={solvedCount}
            unsolvedCount={unsolvedCount}
          />
        </div>
      )}
    </div>
  );
}
