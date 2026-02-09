/**
 * Performance Cache Configuration
 * Enables server-side caching and ISR strategies for different data types
 */

export const CACHE_CONFIG = {
  /**
   * User Profiles - change rarely, safe to cache for longer
   * Update when user edits profile or updates avatar
   */
  PROFILE: {
    revalidate: 3600, // 1 hour
    dynamicParams: true,
  },

  /**
   * Categories - change very rarely, almost static
   * Update when admin adds/removes categories
   */
  CATEGORIES: {
    revalidate: 86400, // 24 hours
    dynamicParams: false,
  },

  /**
   * Hot Topics - frequently viewed, moderate revalidation
   * Update when topic is created or updated
   */
  TOPICS: {
    revalidate: 300, // 5 minutes
    dynamicParams: true,
  },

  /**
   * User Notifications - personal data, short cache
   * Update when new notification arrives (realtime)
   */
  NOTIFICATIONS: {
    revalidate: 60, // 1 minute
    dynamicParams: true,
  },

  /**
   * Search Results - expensive queries, moderate cache
   * Update when new topics/replies are created
   */
  SEARCH: {
    revalidate: 180, // 3 minutes
    dynamicParams: true,
  },

  /**
   * Achievements/Rankings - updated daily
   * Update when achievements are awarded or rankings change
   */
  RANKINGS: {
    revalidate: 3600, // 1 hour
    dynamicParams: false,
  },
};

/**
 * Response cache headers for Next.js API routes
 * Usage in API route:
 * res.headers.set('Cache-Control', getCacheHeader('PROFILE'));
 */
export function getCacheHeader(type: keyof typeof CACHE_CONFIG): string {
  const config = CACHE_CONFIG[type];
  return `public, s-maxage=${config.revalidate}, stale-while-revalidate=${config.revalidate * 2}`;
}

/**
 * Revalidate paths after mutations
 * Usage in server action:
 * revalidatePath('/forum/categories', 'page');
 */
export const REVALIDATE_PATHS = {
  PROFILE: (username: string) => `/forum/user/${username}`,
  TOPIC: (slug: string) => `/forum/topic/${slug}`,
  CATEGORY: (slug: string) => `/forum/category/${slug}`,
  SEARCH: '/forum/search',
  RANKINGS: '/forum/rankings',
  NOTIFICATIONS: '/notifications',
};

/**
 * Database query optimization strategies
 * Use these patterns in server actions and API routes
 */
export const QUERY_STRATEGIES = {
  /**
   * Fetch only needed fields to reduce payload size
   * Example: SELECT('id', 'username', 'avatar_url')
   */
  LIGHT_PROFILE: ['id', 'username', 'avatar_url'],
  FULL_PROFILE: ['*'],
  
  /**
   * Pagination defaults
   * Use these for infinite scroll lists
   */
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_TOPIC_PAGE_SIZE: 15,
  DEFAULT_NOTIFICATION_PAGE_SIZE: 20,

  /**
   * Sort strategies for better performance
   * Always sort by indexed columns (created_at, updated_at)
   */
  SORT_NEWEST: { order: 'created_at', ascending: false },
  SORT_OLDEST: { order: 'created_at', ascending: true },
  SORT_TRENDING: { order: 'view_count', ascending: false },
};
