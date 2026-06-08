import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Nettoyage : on a déployé une PWA puis on l'a retirée. Pour les utilisateurs
// qui ont déjà mis en cache l'ancien Service Worker, il faut le désenregistrer
// activement sinon ils continueront à voir la version cachée à vie. Ce code
// peut être retiré dans 2-3 mois quand tous les caches auront expiré.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .catch(() => {
      // Ignore les erreurs (mode privé, navigateur restreint, etc.)
    });
  // Vide aussi les caches Workbox/PWA précachés
  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
