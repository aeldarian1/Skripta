'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, AlertCircle, Sparkles, Eye, Edit3, Lightbulb, Zap, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadAttachment, saveAttachmentMetadata } from '@/lib/attachments';
import { generateSlug } from '@/lib/utils';
import { processMentions } from '@/app/forum/actions';
import { Breadcrumb } from '@/components/forum/breadcrumb';
import { toast } from 'sonner';
import Link from 'next/link';
import { useButtonAnimation } from '@/hooks/use-button-animation';

// Dynamic imports for heavy components - reduces initial bundle ~200KB
const EnhancedMarkdownEditor = dynamic(
  () => import('@/components/forum/new/enhanced-markdown-editor').then(mod => mod.EnhancedMarkdownEditor),
  { ssr: false }
);
const EnhancedFileUpload = dynamic(
  () => import('@/components/forum/new/enhanced-file-upload').then(mod => mod.EnhancedFileUpload),
  { ssr: false }
);
const MarkdownRenderer = dynamic(
  () => import('@/components/forum/markdown-renderer').then(mod => mod.MarkdownRenderer),
  { ssr: false }
);

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;
const STORAGE_KEY = 'topic_draft_temp';

export function CreateTopicPage({ categories, tags, initialDraft, universitySlug, facultySlug, facultyId, preSelectedCategoryId }: any) {
  const router = useRouter();
  const [title, setTitle] = useState(initialDraft?.title || '');
  const [content, setContent] = useState(initialDraft?.content || '');
  const [categoryId, setCategoryId] = useState(preSelectedCategoryId || initialDraft?.category_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialDraft?.tags || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const { triggerAnimation: triggerSubmitAnimation, animationClasses: submitAnimation } = useButtonAnimation();

  // Load localStorage backup on mount
  useEffect(() => {
    if (typeof window === 'undefined' || initialDraft) return;

    const backup = localStorage.getItem(STORAGE_KEY);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setTitle(parsed.title || '');
        setContent(parsed.content || '');
        setCategoryId(parsed.categoryId || '');
        setSelectedTags(parsed.selectedTags || []);
      } catch (err) {
        console.error('Error loading backup:', err);
      }
    }
  }, [initialDraft]);

  // Save to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!title && !content) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const backup = {
      title,
      content,
      categoryId,
      selectedTags,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(backup));
  }, [title, content, categoryId, selectedTags]);

  // Warn before leaving with unsaved changes (content is auto-saved to localStorage)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitting && (title || content)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, content, isSubmitting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (title.trim() && content.trim() && categoryId && !isSubmitting) {
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        } else {
          toast.error('Molimo ispunite sva obavezna polja');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, categoryId, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Naslov je obavezan');
      toast.error('Naslov je obavezan');
      return;
    }

    if (!content.trim()) {
      setError('Sadržaj je obavezan');
      toast.error('Sadržaj je obavezan');
      return;
    }

    if (!categoryId) {
      setError('Molimo odaberite kategoriju');
      toast.error('Molimo odaberite kategoriju');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Objavljujem temu...');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Morate biti prijavljeni');
      }

      // Check if user is timed out or banned
      const { data: profile } = await supabase
        .from('profiles')
        .select('timeout_until, timeout_reason, is_banned')
        .eq('id', user.id)
        .single() as { data: { timeout_until: string | null; timeout_reason: string | null; is_banned: boolean } | null; error: any };

      if (profile?.is_banned) {
        toast.error('Vaš račun je baniran i ne možete objavljivati', { id: loadingToast });
        setIsSubmitting(false);
        return;
      }

      if (profile?.timeout_until) {
        const timeoutDate = new Date(profile.timeout_until);
        if (timeoutDate > new Date()) {
          const remainingMinutes = Math.ceil((timeoutDate.getTime() - Date.now()) / (1000 * 60));
          toast.error(
            `U timeoutu ste još ${remainingMinutes} min. Razlog: ${profile.timeout_reason || 'Nije naveden'}`,
            { id: loadingToast }
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Spam detection - dynamically loaded only at submit time
      const { detectSpam, detectDuplicate, detectRapidPosting } = await import('@/lib/spam-detection');
      const titleSpamCheck = detectSpam(title.trim());
      if (titleSpamCheck.isSpam) {
        toast.error(`Naslov je označen kao spam: ${titleSpamCheck.reason}`, { id: loadingToast });
        setIsSubmitting(false);
        return;
      }

      const contentSpamCheck = detectSpam(content.trim());
      if (contentSpamCheck.isSpam) {
        toast.error(`Sadržaj je označen kao spam: ${contentSpamCheck.reason}`, { id: loadingToast });
        setIsSubmitting(false);
        return;
      }

      // Fetch recent topics by this user for duplicate/rate limit checks
      const { data: recentTopics } = await (supabase as any)
        .from('topics')
        .select('title, content, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentTopics && recentTopics.length > 0) {
        // Check for duplicate content
        const duplicateCheck = detectDuplicate({
          content: title.trim() + ' ' + content.trim(),
          userId: user.id,
          recentPosts: recentTopics.map((t: any) => ({
            content: t.title + ' ' + t.content,
            created_at: t.created_at,
          })),
          timeWindowMinutes: 10,
        });

        if (duplicateCheck.isSpam) {
          toast.error(`${duplicateCheck.reason}. Molimo pričekajte prije ponovnog objavljivanja.`, { id: loadingToast });
          setIsSubmitting(false);
          return;
        }

        // Check for rapid posting
        const rateCheck = detectRapidPosting({
          userId: user.id,
          recentPosts: recentTopics,
          maxPostsPerMinute: 2, // Stricter for topics
        });

        if (rateCheck.isSpam) {
          toast.error(`${rateCheck.reason}. Molimo usporite.`, { id: loadingToast });
          setIsSubmitting(false);
          return;
        }
      }

      // Content moderation - dynamically loaded only at submit time
      const { moderateContent } = await import('@/lib/content-moderation');
      const moderationResult = await moderateContent({
        content: content.trim(),
        title: title.trim(),
        userId: user.id,
        contentType: 'topic',
      });

      if (!moderationResult.approved) {
        toast.error(moderationResult.reason || 'Sadržaj sadrži neprimjeren jezik', { id: loadingToast });
        setIsSubmitting(false);
        return;
      }

      // Use moderated content (censored if needed)
      const finalTitle = moderationResult.title || title.trim();
      const finalContent = moderationResult.content || content.trim();

      // Create topic
      const { data: topic, error: topicError } = await (supabase as any)
        .from('topics')
        .insert({
          title: finalTitle,
          slug: generateSlug(finalTitle),
          content: finalContent,
          category_id: categoryId,
          faculty_id: facultyId || null,
          author_id: user.id,
          auto_flagged: moderationResult.severity ? true : false,
          moderation_status: moderationResult.severity && moderationResult.severity !== 'low' ? 'flagged' : 'approved',
        })
        .select()
        .single();

      if (topicError) {
        console.error('Topic creation error:', topicError);
        throw new Error(topicError.message || 'Greška pri kreiranju teme');
      }

      if (!topic) {
        throw new Error('Tema nije kreirana. Pokušajte ponovno.');
      }

      // Add tags
      if (selectedTags.length > 0 && topic) {
        const tagInserts = selectedTags.map((tagId) => ({
          topic_id: topic.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await (supabase as any).from('topic_tags').insert(tagInserts);
        if (tagError) console.error('Error adding tags:', tagError);
      }

      // Upload attachments
      if (selectedFiles.length > 0 && topic) {
        for (const file of selectedFiles) {
          try {
            const result = await uploadAttachment(file, user.id);
            if (result.url) {
              await saveAttachmentMetadata(
                result.url,
                file.name,
                file.size,
                file.type,
                user.id,
                topic.id,
                'topic'
              );
            }
          } catch (err) {
            console.error('Error uploading file:', err);
          }
        }
      }

      // Process mentions and create notifications
      await processMentions(content.trim(), user.id, topic.id);

      // Check and award achievements - dynamically loaded
      const { checkAndAwardAchievements } = await import('@/app/forum/achievements/actions');
      const newAchievements = await checkAndAwardAchievements(user.id);

      // Show achievement notifications
      if (newAchievements && newAchievements.length > 0) {
        const { ACHIEVEMENTS } = await import('@/lib/achievements-definitions');
        newAchievements.forEach(achievementId => {
          const achievement = ACHIEVEMENTS[achievementId];
          if (achievement) {
            toast.success(`🏆 Novo postignuće: ${achievement.name}!`, {
              description: achievement.description,
              duration: 5000,
            });
          }
        });
      }

      triggerSubmitAnimation();
      toast.success('Tema uspješno objavljena!', { id: loadingToast });

      // Clear draft from localStorage after successful publish
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to the correct path based on whether we have university/faculty context
      if (universitySlug && facultySlug) {
        router.push(`/forum/${universitySlug}/${facultySlug}/topic/${topic.slug}`);
      } else {
        router.push(`/forum/topic/${topic.slug}`);
      }
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setError(err.message || 'Došlo je do greške');
      toast.error(err.message || 'Došlo je do greške pri objavi teme', { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c: any) => c.id === categoryId);

  // Get template suggestion based on category
  const getTemplateSuggestion = () => {
    if (!selectedCategory) return null;

    const templates: Record<string, string> = {
      'Pitanja': `## Problem
Opiši što pokušavaš postići ili koji problem imaš...

## Što sam probao
Napiši što si već pokušao i što nije uspjelo...

## Očekivani rezultat
Opiši što očekuješ da se dogodi...

## Dodatne informacije
- Verzija sustava/biblioteke:
- Poruke o greškama (ako ih ima): `,

      'Diskusija': `## Tema rasprave
Uvodna rečenica koja objašnjava o čemu želiš razgovarati...

## Moje mišljenje
Predstavi svoje stajalište ili razmišljanja...

## Pitanja za zajednicu
1. Što misliš o...?
2. Je li ...?`,

      'Tutorijali': `## Uvod
Kratko opiši što će ljudi naučiti...

## Preduvjeti
Što je potrebno znati prije početka...

## Koraci
1. Prvi korak...
2. Drugi korak...

## Zaključak
Sažmi što smo naučili...`,

      'Resursi': `## Opis resursa
O čemu se radi i zašto je koristan...

## Link
[Naziv resursa](URL)

## Za koga je namijenjen
Tko bi imao koristi od ovog resursa...`,
    };

    return templates[selectedCategory.name] || null;
  };

  const applyTemplate = () => {
    const template = getTemplateSuggestion();
    if (template) {
      setContent(template);
      toast.success('Predložak primijenjen!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Forum', href: '/forum' },
          { label: 'Nova tema' },
        ]}
      />

      {/* Header */}
      <div className="mb-6 mt-6">
        <Link
          href="/forum"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Natrag na forum
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
              Nova tema
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Podijeli svoje znanje ili postavi pitanje zajednici
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tips Panel */}
        {showTips && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Savjeti za dobru temu
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>Budi konkretan:</strong> Jasno opiši problem ili temu o kojoj želiš razgovarati</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>Dodaj kontekst:</strong> Objasni što si već pokušao i što očekuješ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>Formatiraj sadržaj:</strong> Koristi naslove, liste i isticanje za bolju čitljivost</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span><strong>Prečaci tipkovnice:</strong> Ctrl+S za spremanje, Ctrl+Enter za objavu</span>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTips(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Zatvori savjete"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Title */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">
                Naslov teme <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="O čemu želiš razgovarati?"
                maxLength={MAX_TITLE_LENGTH}
                className="text-lg h-12"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <p>Budi jasan i konkretan</p>
                <p>
                  <span className={title.length > MAX_TITLE_LENGTH * 0.9 ? 'text-orange-500' : ''}>
                    {title.length}
                  </span>
                  /{MAX_TITLE_LENGTH}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category & Tags */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <Label htmlFor="category" className="text-base font-semibold">
                Kategorija <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-2 w-full h-11 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Odaberi kategoriju</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedCategory.description}</p>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-2 block">Oznake (opcionalno)</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: any) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                        );
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${
                          selectedTags.includes(tag.id)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">
                Sadržaj <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {selectedCategory && getTemplateSuggestion() && !content && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applyTemplate}
                    className="text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Koristi predložak
                  </Button>
                )}
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(false)}
                    className={`px-3 py-1 text-sm flex items-center gap-1 transition-colors ${
                      !isPreviewMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    Uredi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewMode(true)}
                    className={`px-3 py-1 text-sm flex items-center gap-1 transition-colors ${
                      isPreviewMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    Pregled
                  </button>
                </div>
              </div>
            </div>

            {isPreviewMode ? (
              <div className="min-h-75 max-h-125 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Nema sadržaja za prikaz. Pređi na način uređivanja da napišeš sadržaj.
                  </p>
                )}
              </div>
            ) : (
              <EnhancedMarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Opiši detaljno svoje pitanje ili temu..."
                maxLength={MAX_CONTENT_LENGTH}
                onSave={saveDraft}
              />
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <Label className="text-base font-semibold mb-3 block">Prilozi (opcionalno)</Label>
            <EnhancedFileUpload files={selectedFiles} onChange={setSelectedFiles} maxFiles={5} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t dark:border-gray-800 -mx-3 sm:-mx-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch sm:items-center">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}
              className={`flex-1 sm:flex-none h-11 sm:px-8 ${submitAnimation}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Objavljujem...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Objavi temu
                </>
              )}
            </Button>
          </div>

          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="sm:ml-auto h-11">
            Odustani
          </Button>
        </div>
      </form>
    </div>
  );
}
