'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Pin, X, CheckCheck, Bell, UserPlus, Mail } from 'lucide-react';
import Link from 'next/link';
import type { Notification } from '@/types/notifications';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/app/notifications/actions';
import { useRouter } from 'next/navigation';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationUpdate: (notifications: Notification[]) => void;
}

export function NotificationList({
  notifications,
  onClose,
  onNotificationUpdate,
}: NotificationListProps) {
  const router = useRouter();

  // Returns appropriate notification icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'reply_to_topic':
      case 'reply_to_reply':
        return <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'upvote':
        return <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'topic_pinned':
        return <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'new_message':
        return <Mail className="w-5 h-5 text-pink-600 dark:text-pink-400" />;
      case 'report':
        return <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  // Handles notification click by marking as read and navigating to the link if provided
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      onNotificationUpdate(
        notifications.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }

    if (notification.link) {
      router.push(notification.link);
      onClose();
    }
  };

  // Marks all notifications as read in the database and updates local state
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    onNotificationUpdate(notifications.map((n) => ({ ...n, is_read: true })));
  };

  // Deletes a specific notification from the database and updates local state
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    onNotificationUpdate(notifications.filter((n) => n.id !== notificationId));
  };

  // Formats a date string into a human-readable relative time format (e.g., 'Prije 5 min')
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Upravo sada';
    if (diffInSeconds < 3600) return `Prije ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Prije ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Prije ${Math.floor(diffInSeconds / 86400)} dana`;
    return date.toLocaleDateString('hr-HR');
  };

  return (
    <Card className="w-full md:w-105 max-w-full md:max-w-md h-screen md:h-auto max-h-screen md:max-h-150 overflow-hidden border-gray-200 dark:border-gray-700 md:animate-slide-down rounded-2xl md:rounded-xl">
      <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-linear-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-lg md:text-xl text-gray-900 dark:text-white">Obavijesti</h3>
        </div>
        <div className="flex items-center gap-1">
          {notifications.some((n) => !n.is_read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              title="Označi sve kao pročitano"
              className="h-8 px-3 md:h-8 md:px-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="ml-1.5 text-xs font-semibold hidden sm:inline">Sve</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
            aria-label="Zatvori obavijesti"
          >
            <X className="w-5 h-5 md:w-4 md:h-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-140px)] md:h-auto md:max-h-125 scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="p-12 md:p-16 text-center text-gray-500">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-linear-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded-full blur-2xl opacity-20"></div>
              <div className="relative bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full p-6 border border-blue-100 dark:border-blue-800/50">
                <Bell className="w-12 h-12 text-blue-400 dark:text-blue-500" />
              </div>
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Nemaš novih obavijesti</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Bit ćeš obaviješten kada netko odgovori na tvoje teme</p>
          </div>
        ) : (
          <div className="p-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative mx-3 my-2 p-4 cursor-pointer transition-all duration-250 rounded-xl border ${
                  !notification.is_read
                    ? 'bg-linear-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border-blue-200 dark:border-blue-800/30 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50'
                    : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/50 hover:shadow-sm'
                } hover:scale-[1.01] active:scale-95`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-l-[10px]"></div>
                )}

                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`shrink-0 mt-0.5 p-2.5 rounded-xl shadow-sm group-hover:shadow-lg transition-all duration-200 ${
                    notification.type === 'upvote'
                      ? 'bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40'
                      : notification.type === 'topic_pinned'
                      ? 'bg-linear-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40'
                      : notification.type === 'follow'
                      ? 'bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40'
                      : notification.type === 'new_message'
                      ? 'bg-linear-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40'
                      : notification.type === 'report'
                      ? 'bg-linear-to-br from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40'
                      : 'bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40'
                  }`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white line-clamp-2">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <span className="text-xs bg-linear-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              Novo
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all rounded-lg ml-2"
                        onClick={(e) => handleDelete(e, notification.id)}
                        aria-label="Obriši obavijest"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-linear-to-r from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-800/30">
          <Link href="/notifications" onClick={onClose}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-10 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-lg"
            >
              Vidi sve obavijesti
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
