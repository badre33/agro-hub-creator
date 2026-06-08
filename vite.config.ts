import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Le shop est servi sous broccagri.ma/boutique via reverse proxy depuis le vitrine.
// En production, les assets sont référencés en URL ABSOLUE vers le domaine shop
// pour éviter les bricolages de rewrites Netlify entre les deux apps.
// En dev local, on reste au root pour un DX simple.
export default defineConfig(({ command }) => ({
  base:
    command === "build" ? "https://broccagrishop.netlify.app/" : "/",
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
