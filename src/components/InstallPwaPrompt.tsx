import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Bannière d'installation PWA.
 *
 * Comportements :
 * - Chrome/Edge/Android : capture `beforeinstallprompt` → bouton "Installer".
 * - Safari iOS : pas d'API d'install, on affiche des instructions visuelles.
 * - Cachée si l'app est déjà installée (`display-mode: standalone` ou navigateur.standalone iOS).
 * - Cachée définitivement si l'utilisateur a refusé/installé.
 * - Re-apparaît 14 jours après un "Plus tard".
 */

// Event Chrome non typé dans le DOM standard
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "broccagri-pwa-dismissed-at";
const DISMISS_DAYS = 14;

// Détecte si on est déjà en mode "installée"
const isInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  // Standard
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari (propriétaire)
  // @ts-expect-error - propriété propriétaire iOS
  if (window.navigator.standalone === true) return true;
  return false;
};

const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
};

const isInDismissWindow = (): boolean => {
  try {
    const stamp = localStorage.getItem(DISMISS_KEY);
    if (!stamp) return false;
    const dismissedAt = parseInt(stamp, 10);
    if (Number.isNaN(dismissedAt)) return false;
    const ageMs = Date.now() - dismissedAt;
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

export const InstallPwaPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isInstalled() || isInDismissWindow()) return;

    // Cas 1 : Chrome/Edge/Android — on attend l'event
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Délai léger pour ne pas afficher la bannière dès le premier paint
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Cas 2 : iOS Safari — l'event n'existe pas, on affiche les instructions après délai
    if (isIOS()) {
      const t = setTimeout(() => {
        setShow(true);
      }, 5000);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    // Cas 3 : l'app vient d'être installée -> on cache
    const onInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShow(false);
      } else {
        dismiss();
      }
      setDeferredPrompt(null);
      return;
    }
    if (isIOS()) {
      setShowIosHelp(true);
    }
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // localStorage indispo (mode privé) : on ferme juste pour cette session
    }
    setShow(false);
    setShowIosHelp(false);
  };

  if (!show) return null;

  // Modale d'instructions iOS (overlay plein écran)
  if (showIosHelp) {
    return (
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={dismiss}
      >
        <div
          className="bg-card border-2 border-primary/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg">Installer Broccagri</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismiss}
              className="h-8 w-8 -mt-1 -mr-1"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ajoutez Broccagri à votre écran d'accueil pour commander en un clic.
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3 items-start">
              <span className="bg-primary text-primary-foreground font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 text-xs">
                1
              </span>
              <span>
                Appuyez sur le bouton <strong>Partager</strong>{" "}
                <Share className="h-4 w-4 inline -mt-0.5 mx-0.5" /> en bas de Safari
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-primary text-primary-foreground font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 text-xs">
                2
              </span>
              <span>
                Choisissez <strong>"Sur l'écran d'accueil"</strong>{" "}
                <Plus className="h-4 w-4 inline -mt-0.5 mx-0.5" />
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="bg-primary text-primary-foreground font-bold rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 text-xs">
                3
              </span>
              <span>
                Confirmez avec <strong>"Ajouter"</strong> en haut à droite
              </span>
            </li>
          </ol>
          <Button onClick={dismiss} className="w-full mt-5" variant="outline">
            J'ai compris
          </Button>
        </div>
      </div>
    );
  }

  // Bannière compacte en bas d'écran
  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-in slide-in-from-bottom duration-500">
      <div className="bg-card border-2 border-primary/30 shadow-2xl rounded-2xl p-3 sm:p-4 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl flex-shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Installer Broccagri</p>
          <p className="text-xs text-muted-foreground leading-tight">
            Accès rapide, fonctionne hors-ligne
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="flex-shrink-0 h-9 px-3 text-xs font-semibold"
        >
          Installer
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          className="h-8 w-8 flex-shrink-0 -mr-1"
          aria-label="Plus tard"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
