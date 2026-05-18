import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// En production le shop est servi sous /boutique/ via proxy Netlify depuis le vitrine.
// En dev local, on reste au root pour ne pas casser le DX.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/boutique/" : "/",
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
