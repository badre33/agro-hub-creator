import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// En production le shop est servi sous /boutique/ via proxy Netlify depuis le vitrine.
// On build directement dans dist/boutique/ pour que les fichiers soient physiquement
// à l'emplacement attendu par les URLs (pas besoin de rewrites compliqués côté Netlify).
// En dev local, on reste au root pour ne pas casser le DX.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/boutique/" : "/",
  build: {
    outDir: command === "build" ? "dist/boutique" : "dist",
    emptyOutDir: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
