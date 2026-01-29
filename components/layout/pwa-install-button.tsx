'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Store the prompt globally so it persists across re-renders
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set ready after mount to avoid hydration issues
    setIsReady(true);

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event globally and in state
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('[PWA] beforeinstallprompt captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      // Check for iOS standalone
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };
    
    checkInstalled();

    // Listen for app installed event
    const installedHandler = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    };
    window.addEventListener('appinstalled', installedHandler);

    // Check if we already have a stored prompt
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    console.log('[PWA] Install button clicked, deferredPrompt:', !!deferredPrompt, !!globalDeferredPrompt);
    
    // Already installed
    if (isInstalled) {
      toast.info('Aplikacija je već instalirana!', {
        description: 'Skripta je već dodana na vaš uređaj.',
      });
      return;
    }

    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true) {
      toast.info('Aplikacija je već instalirana!', {
        description: 'Trenutno koristite instaliranu verziju aplikacije.',
      });
      setIsInstalled(true);
      return;
    }

    // Try global prompt first, then state
    const promptToUse = deferredPrompt || globalDeferredPrompt;

    // If we have the deferred prompt, use it
    if (promptToUse) {
      try {
        console.log('[PWA] Triggering install prompt');
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        console.log('[PWA] User choice:', outcome);
        
        if (outcome === 'accepted') {
          toast.success('Aplikacija se instalira!', {
            description: 'Skripta će uskoro biti dostupna na vašem uređaju.',
          });
          setIsInstalled(true);
        } else {
          toast.info('Instalacija otkazana', {
            description: 'Možete instalirati aplikaciju bilo kada pritiskom na ovu ikonu.',
          });
        }
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
      } catch (error) {
        console.error('[PWA] Install error:', error);
        toast.error('Greška pri instalaciji', {
          description: 'Pokušajte ponovo ili koristite opciju "Dodaj na početni zaslon" u izborniku preglednika.',
        });
      }
      return;
    }

    // No deferred prompt available - detect platform and show specific instructions
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    const isBrave = (navigator as any).brave !== undefined;
    const isSamsung = /SamsungBrowser/.test(ua);

    console.log('[PWA] No prompt available. Platform:', { isIOS, isAndroid, isSafari, isChrome, isFirefox, isBrave, isSamsung });

    if (isIOS) {
      if (isSafari) {
        toast.info('Instalacija na iOS', {
          description: '1. Dodirnite ikonu "Dijeli" (□↑) na dnu zaslona\n2. Odaberite "Dodaj na početni zaslon"',
          duration: 10000,
        });
      } else {
        toast.warning('Potreban je Safari', {
          description: 'Na iOS-u, PWA se može instalirati samo iz Safari preglednika. Otvorite ovu stranicu u Safariju.',
          duration: 10000,
        });
      }
    } else if (isAndroid) {
      if (isFirefox) {
        toast.info('Instalacija u Firefoxu', {
          description: 'Na Firefox pregledniku aplikaciju dodajte putem izbornika (⋮) → "Add app to homescreen"',
          duration: 10000,
        });
      } else if (isBrave) {
        toast.info('Instalacija u Braveu', {
          description: '1. Dodirnite ikonu izbornika (⋮) u gornjem desnom kutu\n2. Odaberite "Instaliraj aplikaciju" ili "Dodaj na početni zaslon"',
          duration: 10000,
        });
      } else if (isSamsung) {
        toast.info('Instalacija u Samsung Browseru', {
          description: '1. Dodirnite ikonu izbornika (≡) na dnu\n2. Odaberite "Dodaj stranicu na" → "Početni zaslon"',
          duration: 10000,
        });
      } else {
        toast.info('Instalacija na Android', {
          description: '1. Dodirnite ikonu izbornika (⋮) u gornjem desnom kutu\n2. Odaberite "Instaliraj aplikaciju"',
          duration: 10000,
        });
      }
    } else {
      // Desktop
      if (isChrome) {
        toast.info('Instalacija u Chromeu', {
          description: 'Kliknite ikonu instalacije (⊕) u adresnoj traci ili otvorite izbornik → "Instaliraj Skripta..."',
          duration: 10000,
        });
      } else if (isFirefox) {
        toast.warning('Firefox ne podržava PWA', {
          description: 'Firefox na desktopu ne podržava instalaciju PWA aplikacija. Koristite Chrome ili Edge.',
          duration: 10000,
        });
      } else {
        toast.info('Instalacija aplikacije', {
          description: 'Potražite opciju "Instaliraj" u adresnoj traci ili izborniku preglednika.',
          duration: 10000,
        });
      }
    }
  }, [deferredPrompt, isInstalled]);

  // Don't render during SSR
  if (!isReady) {
    return null;
  }

  // Hide if installed
  if (isInstalled) {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleInstallClick}
      title="Instaliraj aplikaciju"
      aria-label="Instaliraj aplikaciju"
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}
