'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  topicId: string;
  currentUserId?: string;
  currentUsername?: string;
}

interface TypingUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  updated_at: string;
}

export function TypingIndicator({ topicId, currentUserId, currentUsername }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const supabase = createClient();

  useEffect(() => {
    if (!currentUserId) return;

    // Batch profile fetch for initial typing users
    const fetchInitialTypingUsers = async () => {
      const { data: indicators } = await supabase
        .from('typing_indicators')
        .select('user_id, updated_at')
        .eq('topic_id', topicId)
        .neq('user_id', currentUserId);

      if (indicators && indicators.length > 0) {
        const userIds = indicators.map((i) => i.user_id);
        
        // Batch fetch all profiles in one query
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);

        if (profiles) {
          const typedProfiles = profiles as Array<{ id: string; username: string; avatar_url: string | null }>;
          const users: TypingUser[] = indicators.map((indicator) => {
            const profile = typedProfiles.find((p) => p.id === indicator.user_id);
            return {
              user_id: indicator.user_id,
              username: profile?.username || '',
              avatar_url: profile?.avatar_url || null,
              updated_at: indicator.updated_at,
            };
          });
          setTypingUsers(users);
        }
      }
    };

    fetchInitialTypingUsers();

    // Subscribe to typing indicators for this topic
    const channel = supabase
      .channel(`typing:${topicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `topic_id=eq.${topicId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const typingUserId = (payload.new as any).user_id;

            // Don't show current user's typing indicator
            if (typingUserId === currentUserId) return;

            // Batch fetch: collect all user IDs first, then fetch profiles in one query
            setTypingUsers((prev) => {
              const filtered = prev.filter((u) => u.user_id !== typingUserId);
              // Temporarily add user with placeholder data
              return [
                ...filtered,
                {
                  user_id: typingUserId,
                  username: '', // Will be updated shortly
                  avatar_url: null,
                  updated_at: (payload.new as any).updated_at,
                },
              ];
            });

            // Fetch profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', typingUserId)
              .single();

            if (profile) {
              setTypingUsers((prev) => {
                const typedProfile = profile as { username: string; avatar_url: string | null };
                return prev.map((u) =>
                  u.user_id === typingUserId
                    ? {
                        ...u,
                        username: typedProfile.username,
                        avatar_url: typedProfile.avatar_url,
                      }
                    : u
                );
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const typingUserId = (payload.old as any).user_id;
            setTypingUsers((prev) => prev.filter((u) => u.user_id !== typingUserId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
        }
      });

    // Clean up old typing indicators every 5 seconds (optimized)
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      setTypingUsers((prev) =>
        prev.filter((user) => {
          const updatedAt = new Date(user.updated_at);
          const diff = now.getTime() - updatedAt.getTime();
          return diff < 6000; // Remove if older than 6 seconds (buffer for timeout)
        })
      );
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, [topicId, currentUserId, supabase]);

  // Filter out users without usernames (still loading)
  const validTypingUsers = typingUsers.filter((u) => u.username);

  if (validTypingUsers.length === 0 && connectionStatus === 'connected') return null;

  const displayText =
    validTypingUsers.length === 1
      ? `${validTypingUsers[0].username} piše...`
      : validTypingUsers.length === 2
      ? `${validTypingUsers[0].username} i ${validTypingUsers[1].username} pišu...`
      : validTypingUsers.length > 0
      ? `${validTypingUsers.length} korisnika piše...`
      : connectionStatus === 'disconnected'
      ? 'Povezivanje...'
      : '';

  if (!displayText) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      {validTypingUsers.length > 0 && (
        <div className="flex -space-x-2">
          {validTypingUsers.slice(0, 3).map((user) => (
            <Avatar
              key={user.user_id}
              src={user.avatar_url}
              alt={user.username}
              username={user.username}
              size="sm"
              className="ring-2 ring-white dark:ring-gray-800"
            />
          ))}
        </div>
      )}
      <Loader2 
        className={`w-4 h-4 animate-spin ${
          connectionStatus === 'disconnected' ? 'text-orange-500' : 'text-purple-500'
        }`} 
      />
      <span className="font-medium">{displayText}</span>
      {connectionStatus === 'disconnected' && (
        <span className="text-xs text-orange-500">(reconnecting...)</span>
      )}
    </div>
  );
}

/**
 * Hook to broadcast typing status
 */
export function useTypingIndicator(topicId: string, currentUserId?: string) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const broadcastTyping = useCallback(async () => {
    if (!currentUserId || !topicId) return;

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce: wait 300ms before broadcasting to reduce DB writes
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const supabase = createClient(); // Fresh client for each call

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Upsert typing indicator
        await (supabase as any).from('typing_indicators').upsert(
          {
            topic_id: topicId,
            user_id: currentUserId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'topic_id,user_id',
          }
        );

        // Auto-remove after 5 seconds of inactivity (extended timeout)
        typingTimeoutRef.current = setTimeout(async () => {
          try {
            const supabase = createClient();
            await supabase
              .from('typing_indicators')
              .delete()
              .eq('topic_id', topicId)
              .eq('user_id', currentUserId);
          } catch (err) {
            // Silently fail on cleanup - user session may have ended
          }
        }, 5000);
      } catch (err) {
        console.error('Error broadcasting typing:', err);
        // Don't break the form if typing indicator fails
      }
    }, 300);
  }, [topicId, currentUserId]);

  const stopTyping = useCallback(async () => {
    if (!currentUserId || !topicId) return;

    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const supabase = createClient();
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', currentUserId);
    } catch (err) {
      console.error('Error stopping typing:', err);
      // Don't break the form if typing indicator fails
    }
  }, [topicId, currentUserId]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return { broadcastTyping, stopTyping };
}
