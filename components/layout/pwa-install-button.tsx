'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for app installed event
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    // Already installed
    if (isInstalled) {
      toast.info('Aplikacija je već instalirana!', {
        description: 'Skripta je već dodana na vaš uređaj.',
      });
      return;
    }

    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      toast.info('Aplikacija je već instalirana!', {
        description: 'Trenutno koristite instaliranu verziju aplikacije.',
      });
      return;
    }

    // If we have the deferred prompt, use it
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          toast.success('Aplikacija se instalira!', {
            description: 'Skripta će uskoro biti dostupna na vašem uređaju.',
          });
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (error) {
        toast.error('Greška pri instalaciji', {
          description: 'Pokušajte ponovo ili koristite opciju "Dodaj na početni zaslon" u izborniku preglednika.',
        });
      }
      return;
    }

    // No deferred prompt available - show instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      toast.info('Kako instalirati na iOS', {
        description: 'Dodirnite ikonu "Dijeli" (□↑) pa odaberite "Dodaj na početni zaslon".',
        duration: 8000,
      });
    } else if (isIOS) {
      toast.info('Otvorite u Safariju', {
        description: 'Za instalaciju PWA na iOS, otvorite stranicu u Safari pregledniku, zatim dodirnite "Dijeli" → "Dodaj na početni zaslon".',
        duration: 8000,
      });
    } else if (isAndroid) {
      toast.info('Kako instalirati na Android', {
        description: 'Otvorite izbornik preglednika (⋮) i odaberite "Instaliraj aplikaciju" ili "Dodaj na početni zaslon".',
        duration: 8000,
      });
    } else {
      toast.info('Kako instalirati aplikaciju', {
        description: 'Potražite opciju "Instaliraj" u adresnoj traci ili izborniku preglednika.',
        duration: 8000,
      });
    }
  };

  // Always show the button (unless already installed)
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
