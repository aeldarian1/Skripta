'use client';

import { useEffect } from 'react';
import { updateUserFacultyPreference } from '@/app/forum/actions';

interface SaveFacultyPreferenceProps {
  universityId: string;
  facultyId: string;
}

export function SaveFacultyPreference({ universityId, facultyId }: SaveFacultyPreferenceProps) {
  useEffect(() => {
    // Save preference in the background
    updateUserFacultyPreference(universityId, facultyId).catch((error) => {
      // Silently fail - this is just a convenience feature
      console.error('Failed to save faculty preference:', error);
    });
  }, [universityId, facultyId]);

  // This component doesn't render anything
  return null;
}
