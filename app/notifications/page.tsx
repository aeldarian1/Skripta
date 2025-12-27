import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationPageClient } from './notification-page-client';

export const metadata = {
  title: 'Obavijesti | Studentski Forum',
  description: 'Tvoje obavijesti',
};

export default async function NotificationsPage() {
  const supabase: any = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all notifications
  const { data: notificationData } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  let notifications = [];

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
    }));
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <CardTitle className="text-xl sm:text-2xl">Sve obavijesti</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <NotificationPageClient initialNotifications={notifications || []} />
        </CardContent>
      </Card>
    </div>
  );
}
