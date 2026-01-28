'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useButtonAnimation, useIconAnimation } from '@/hooks/use-button-animation';
import { onBookmarkEvent } from '@/lib/bookmark-events';

export function NavbarBookmarkButton() {
  // Animation triggers and styles for button and icon
  const { triggerAnimation: triggerButtonAnimation, animationClasses: buttonAnimation, isAnimating: isButtonAnimating } = useButtonAnimation();
  const { triggerAnimation: triggerIconAnimation, animationClasses: iconAnimation } = useIconAnimation();
  // Tracks the last bookmark/unbookmark action for color animation
  const [lastAction, setLastAction] = useState<'bookmark' | 'unbookmark' | null>(null);

  // Listens for bookmark events and triggers animations
  useEffect(() => {
    const unsubscribe = onBookmarkEvent((detail) => {
      // Track whether this is a bookmark or unbookmark action
      setLastAction(detail.bookmarked ? 'bookmark' : 'unbookmark');

      // Trigger animation when bookmark event is received
      triggerButtonAnimation();
      triggerIconAnimation();
    });

    return unsubscribe;
  }, [triggerButtonAnimation, triggerIconAnimation]);

  // Determines animation color based on bookmark/unbookmark action
  const getAnimationColor = () => {
    if (!isButtonAnimating) return '';

    if (lastAction === 'bookmark') {
      return 'text-yellow-500 hover:text-yellow-600';
    } else if (lastAction === 'unbookmark') {
      return 'text-gray-400 hover:text-gray-500';
    }
    return '';
  };

  return (
    <Link href="/forum/bookmarks" title="Moje oznake">
      <Button
        variant="ghost"
        size="sm"
        className={`${buttonAnimation} ${getAnimationColor()}`}
      >
        <Bookmark className={`w-4 h-4 ${iconAnimation} ${isButtonAnimating && lastAction === 'bookmark' ? 'fill-current' : ''}`} />
      </Button>
    </Link>
  );
}
