'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ReactionEmoji } from './constants';

/**
 * Add a reaction to a reply or topic
 */
export async function addReaction(params: {
  emoji: ReactionEmoji;
  replyId?: string;
  topicId?: string;
}) {
  const { emoji, replyId, topicId } = params;

  if (!replyId && !topicId) {
    return { error: 'Must provide either replyId or topicId' };
  }

  if (replyId && topicId) {
    return { error: 'Cannot react to both reply and topic' };
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in to react' };
  }

  // Check if user already reacted with ANY emoji to this post/reply
  let existingQuery = (supabase as any)
    .from('reactions')
    .select('id, emoji')
    .eq('user_id', user.id);

  if (replyId) {
    existingQuery = existingQuery.eq('reply_id', replyId);
  } else if (topicId) {
    existingQuery = existingQuery.eq('topic_id', topicId);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  // If user already reacted with the same emoji, don't do anything
  if (existing && existing.emoji === emoji) {
    return { error: 'Already reacted with this emoji' };
  }

  // If user reacted with a different emoji, remove the old reaction first
  if (existing && existing.emoji !== emoji) {
    await (supabase as any)
      .from('reactions')
      .delete()
      .eq('id', existing.id);
  }

  // Add the new reaction
  const { error } = await (supabase as any).from('reactions').insert({
    user_id: user.id,
    emoji,
    reply_id: replyId || null,
    topic_id: topicId || null,
  });

  if (error) {
    console.error('Error adding reaction:', error);
    return { error: 'Failed to add reaction' };
  }

  // Revalidate the topic page
  if (topicId) {
    revalidatePath(`/forum/topic/*`);
  } else if (replyId) {
    revalidatePath(`/forum/topic/*`);
  }

  return { success: true };
}

/**
 * Remove a reaction from a reply or topic
 */
export async function removeReaction(params: {
  emoji: ReactionEmoji;
  replyId?: string;
  topicId?: string;
}) {
  const { emoji, replyId, topicId } = params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in' };
  }

  let query = (supabase as any)
    .from('reactions')
    .delete()
    .eq('user_id', user.id)
    .eq('emoji', emoji);

  if (replyId) {
    query = query.eq('reply_id', replyId);
  } else if (topicId) {
    query = query.eq('topic_id', topicId);
  } else {
    return { error: 'Must provide either replyId or topicId' };
  }

  const { error } = await query;

  if (error) {
    console.error('Error removing reaction:', error);
    return { error: 'Failed to remove reaction' };
  }

  revalidatePath(`/forum/topic/*`);
  return { success: true };
}

/**
 * Get all reactions for a reply
 */
export async function getReplyReactions(replyId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: reactions, error } = await (supabase as any)
    .from('reactions')
    .select('id, emoji, user_id, created_at')
    .eq('reply_id', replyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching reactions:', error);
    return { reactions: [] };
  }

  return { reactions: reactions || [] };
}

/**
 * Get all reactions for a topic
 */
export async function getTopicReactions(topicId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: reactions, error } = await (supabase as any)
    .from('reactions')
    .select('id, emoji, user_id, created_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true});

  if (error) {
    console.error('Error fetching reactions:', error);
    return { reactions: [] };
  }

  return { reactions: reactions || [] };
}

/**
 * Toggle a reaction (add if not present, remove if present)
 * If user has a different reaction, it will be replaced with the new one
 */
export async function toggleReaction(params: {
  emoji: ReactionEmoji;
  replyId?: string;
  topicId?: string;
}) {
  const { emoji, replyId, topicId } = params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in to react' };
  }

  // Check if user has ANY reaction (not just the same emoji)
  let query = (supabase as any)
    .from('reactions')
    .select('id, emoji')
    .eq('user_id', user.id);

  if (replyId) {
    query = query.eq('reply_id', replyId);
  } else if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing && existing.emoji === emoji) {
    // Remove reaction if clicking same emoji (toggle off)
    return removeReaction({ emoji, replyId, topicId });
  } else {
    // Add reaction (will replace old one if exists due to addReaction logic)
    return addReaction({ emoji, replyId, topicId });
  }
}
