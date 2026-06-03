import { MessageCircle } from "lucide-react";

interface WhatsAppFabProps {
  phone?: string; // numéro au format international SANS le + (ex: "212661792473")
  message?: string;
}

/**
 * Floating Action Button WhatsApp en bas à droite de l'écran.
 * Ouvre wa.me avec un message pré-rempli.
 * Le numéro et le message peuvent être surchargés via .env (VITE_WHATSAPP_NUMBER).
 */
export const WhatsAppFab = ({
  phone = import.meta.env.VITE_WHATSAPP_NUMBER || "212661792473",
  message = "Bonjour Broccagri, j'ai une question sur ma commande / vos produits.",
}: WhatsAppFabProps) => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Broccagri sur WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 group"
    >
      <div className="relative">
        {/* Halo animé */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping" />
        {/* Bouton principal */}
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] flex items-center justify-center shadow-2xl transition-all hover:scale-110">
          <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-white" fill="white" strokeWidth={1.5} />
        </div>
      </div>
      {/* Bulle texte au hover (desktop) */}
      <span className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Une question&nbsp;? Écris-nous
      </span>
    </a>
  );
};
