import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SkriptaLogo } from '@/components/branding/skripta-logo';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { NavbarBookmarkButton } from './navbar-bookmark-button';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { ForumDropdown } from './forum-dropdown';
import { PWAInstallButton } from './pwa-install-button';
import { logout } from '@/app/auth/actions';
import { MessageSquare, User, LogOut, Search, Settings, Bookmark, Mail } from 'lucide-react';
import type { Notification } from '@/types/notifications';
import type { Profile, University, Faculty } from '@/types/database';

export async function Navbar() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let notifications: Notification[] = [];
  let unreadCount = 0;

  // Run queries in parallel for better performance
  const [profileResult, universitiesResult] = await Promise.all([
    user
      ? supabase.from('profiles').select('*').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from('universities')
      .select('id, name, slug, faculties(id, name, abbreviation, slug)')
      .order('name', { ascending: true }),
  ]);

  profile = profileResult.data as Profile | null;

  if (user) {
    // Fetch notifications with optimized query
    const { data: notificationData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notificationData && notificationData.length > 0) {
      // Get unique actor IDs
      const actorIds = [...new Set(notificationData.map((n: any) => n.actor_id).filter(Boolean))];

      // Fetch actors separately if there are any
      let actorsMap = new Map();
      if (actorIds.length > 0) {
        const { data: actorsData } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', actorIds);

        actorsMap = new Map((actorsData || []).map((a: any) => [a.id, a]));
      }

      // Combine notifications with actor data
      notifications = notificationData.map((n: any) => ({
        ...n,
        actor: n.actor_id ? actorsMap.get(n.actor_id) : null,
      })) as Notification[];

      unreadCount = notifications.filter((n) => !n.is_read).length;
    }
  }

  const universities = (universitiesResult.data || []).map((uni: any) => ({
    ...uni,
    faculties: (uni.faculties || []).sort((a: Faculty, b: Faculty) =>
      (a.abbreviation || a.name).localeCompare(b.abbreviation || b.name)
    )
  })) as (University & { faculties: Faculty[] })[];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/forum" className="flex items-center gap-2 font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity">
              <SkriptaLogo size={28} className="sm:w-8 sm:h-8" />
              <span className="hidden xs:inline bg-linear-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                Skripta
              </span>
              <span className="xs:hidden bg-linear-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                Skripta
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <ForumDropdown universities={universities} />
              <NavLink
                href="/forum/users"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Korisnici
              </NavLink>
              <NavLink
                href="/forum/leaderboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Ljestvica
              </NavLink>
              <NavLink
                href="/forum/search"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Pretraži
              </NavLink>
              {profile?.role === 'admin' && (
                <NavLink
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {user && profile ? (
              <>
                <NavbarBookmarkButton />
                <Link href="/messages" title="Poruke">
                  <Button variant="ghost" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </Link>
                <NotificationBell
                  initialNotifications={notifications}
                  initialUnreadCount={unreadCount}
                />
                {profile?.role === 'admin' && <PWAInstallButton />}
                <ThemeToggle />
                <Link
                  href={`/forum/user/${profile.username}`}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Avatar
                    src={profile.avatar_url}
                    alt={profile.username}
                    username={profile.username}
                    size="sm"
                  />
                  <span className="hidden lg:inline">{profile.username}</span>
                </Link>
                <form action={logout}>
                  <Button variant="ghost" size="sm" type="submit" title="Odjavi se" aria-label="Odjavi se">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Prijava
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="gradient" size="sm">Registracija</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {user && profile && profile.role === 'admin' && <PWAInstallButton />}
            <ThemeToggle />
            {user && profile && (
              <NotificationBell
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />
            )}
            <MobileNav user={user} profile={profile} universities={universities} />
          </div>
        </div>
      </div>
    </nav>
  );
}
