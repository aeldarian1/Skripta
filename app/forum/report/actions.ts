'use server';

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ReportSchema = z.object({
  topicId: z.string().uuid().optional(),
  replyId: z.string().uuid().optional(),
  reportType: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
  description: z.string().max(1000).optional(),
}).refine(data => data.topicId || data.replyId, {
  message: 'Morate odabrati temu ili odgovor za prijavu',
});

export async function submitReport(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Morate biti prijavljeni' };
  }

  try {
    const data = ReportSchema.parse({
      topicId: formData.get('topicId') || undefined,
      replyId: formData.get('replyId') || undefined,
      reportType: formData.get('reportType'),
      description: formData.get('description') || undefined,
    });

    // Check if user already reported this content
    const existingQuery = (supabase as any)
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('status', 'pending');

    if (data.topicId) {
      existingQuery.eq('topic_id', data.topicId);
    } else {
      existingQuery.eq('reply_id', data.replyId);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      return { success: false, error: 'Vec ste prijavili ovaj sadrzaj' };
    }

    // Create report
    const { data: newReport, error } = await (supabase as any)
      .from('reports')
      .insert({
        reporter_id: user.id,
        topic_id: data.topicId || null,
        reply_id: data.replyId || null,
        report_type: data.reportType,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Report error:', error);
      return { success: false, error: `Greska pri slanju prijave: ${error.message}` };
    }

    // Notify all admins about the new report
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      // Get content info for notification message
      let contentType = '';
      let contentTitle = '';
      let contentLink = '';

      if (data.topicId) {
        const { data: topic } = await (supabase as any)
          .from('topics')
          .select('title, slug')
          .eq('id', data.topicId)
          .single();

        contentType = 'tema';
        contentTitle = topic?.title || '';
        contentLink = topic ? `/forum/topic/${topic.slug}` : '';
      } else if (data.replyId) {
        const { data: reply } = await (supabase as any)
          .from('replies')
          .select('content, topic_id, topics(slug, title)')
          .eq('id', data.replyId)
          .single();

        contentType = 'odgovor';
        contentTitle = reply?.topics?.title || '';
        contentLink = reply?.topics?.slug ? `/forum/topic/${reply.topics.slug}` : '';
      }

      // Map report types to Croatian labels
      const reportTypeLabels: Record<string, string> = {
        'spam': 'Spam',
        'harassment': 'Uznemiravanje',
        'inappropriate': 'Neprikladan sadržaj',
        'misinformation': 'Dezinformacija',
        'other': 'Ostalo',
      };

      const reportLabel = reportTypeLabels[data.reportType] || data.reportType;

      // Create notifications for all admins
      const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'report',
        title: 'Nova prijava sadržaja',
        message: `${reportLabel} - ${contentType}${contentTitle ? ': ' + contentTitle.substring(0, 50) : ''}`,
        link: `/admin/reports`,
        actor_id: user.id,
        topic_id: data.topicId || null,
        reply_id: data.replyId || null,
        created_at: new Date().toISOString(),
      }));

      // Use service role client to bypass RLS when creating admin notifications
      const serviceRoleClient = createServiceRoleClient();
      const { error: notificationError } = await (serviceRoleClient as any)
        .from('notifications')
        .insert(notifications);

      if (!notificationError) {
        // Revalidate to update notification bell
        revalidatePath('/', 'layout');
      }
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Doslo je do greske' };
  }
}

export async function getReports(status?: string) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { reports: [], error: 'Neautorizirano' };
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile as any).role !== 'admin') {
    return { reports: [], error: 'Neautorizirano' };
  }

  let query = (supabase as any)
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(username, avatar_url),
      topic:topics(id, title, slug),
      reply:replies(id, content, topic_id)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: reports, error } = await query;

  if (error) {
    return { reports: [], error: 'Greska pri dohvacanju prijava' };
  }

  return { reports: reports || [] };
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  adminNotes?: string,
  deleteContent?: boolean
) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Neautorizirano' };
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile as any).role !== 'admin') {
    return { success: false, error: 'Neautorizirano' };
  }

  // If resolving and deleteContent is true, delete the reported content
  if (status === 'resolved' && deleteContent) {
    // Get the report to find out what content to delete
    const { data: report } = await (supabase as any)
      .from('reports')
      .select('topic_id, reply_id')
      .eq('id', reportId)
      .single();

    if (report) {
      if (report.topic_id) {
        // Delete the topic
        await (supabase as any)
          .from('topics')
          .delete()
          .eq('id', report.topic_id);
      } else if (report.reply_id) {
        // Delete the reply
        await (supabase as any)
          .from('replies')
          .delete()
          .eq('id', report.reply_id);
      }
    }
  }

  const { error } = await (supabase as any)
    .from('reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq('id', reportId);

  if (error) {
    return { success: false, error: 'Greska pri azuriranju prijave' };
  }

  return { success: true };
}
