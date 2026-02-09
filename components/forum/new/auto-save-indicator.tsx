'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Check, AlertCircle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  hasLocalBackup?: boolean;
  autoSaveEnabled?: boolean;
  onToggleAutoSave?: (enabled: boolean) => void;
}

export function AutoSaveIndicator({ status, lastSaved, hasLocalBackup, autoSaveEnabled = true, onToggleAutoSave }: AutoSaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateRelativeTime = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

      if (seconds < 5) {
        setRelativeTime('upravo sada');
      } else if (seconds < 60) {
        setRelativeTime(`prije ${seconds}s`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setRelativeTime(`prije ${minutes}min`);
      } else {
        setRelativeTime(lastSaved.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusDisplay = () => {
    // Show auto-save disabled status
    if (!autoSaveEnabled) {
      return {
        icon: <Cloud className="w-4 h-4" />,
        text: hasLocalBackup ? 'Auto-save: OFF (lokalni backup)' : 'Auto-save: OFF',
        color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
      };
    }

    switch (status) {
      case 'saving':
        return {
          icon: <Cloud className="w-4 h-4 animate-pulse" />,
          text: 'Spremam...',
          color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-700',
        };
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: lastSaved ? `Spremljeno ${relativeTime}` : 'Spremljeno',
          color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-700',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: hasLocalBackup ? 'Greška (ali imam backup)' : 'Greška pri spremanju',
          color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-700',
        };
      default:
        return {
          icon: <Cloud className="w-4 h-4" />,
          text: 'Spremam...',
          color: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-700',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${display.color} ${display.borderColor} transition-all`}>
        {display.icon}
        <span>{display.text}</span>
      </div>
      
      {/* Auto-save toggle button */}
      <button
        type="button"
        onClick={() => onToggleAutoSave?.(!autoSaveEnabled)}
        className={`px-3 py-1.5 rounded-full border text-sm transition-all font-medium ${
          autoSaveEnabled
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800/50'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={autoSaveEnabled ? 'Isključi auto-save' : 'Uključi auto-save'}
      >
        {autoSaveEnabled ? '✓ Auto' : '✗ Isključ'}
      </button>
    </div>
  );
}
