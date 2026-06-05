import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

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
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // En dev on désactive le SW (sinon ça cache et c'est pénible à débugger)
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.ico",
        "favicon-16.png",
        "favicon-32.png",
        "apple-touch-icon.png",
        "robots.txt",
      ],
      manifest: {
        name: "Broccagri — Fruits & Légumes du Maroc",
        short_name: "Broccagri",
        description:
          "Commandez en ligne des fruits et légumes frais du terroir marocain. Livraison nationale.",
        theme_color: "#228b4c",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        lang: "fr",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["food", "shopping", "lifestyle"],
      },
      workbox: {
        // Précache des assets statiques (JS, CSS, fonts, images bundle)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}"],
        runtimeCaching: [
          {
            // Google Fonts CSS
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-css",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts files
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Images produits servies depuis le bundle du shop
            urlPattern: ({ url }) =>
              url.origin === "https://broccagrishop.netlify.app" &&
              /\.(png|jpg|jpeg|webp|svg)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "shop-images",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Appels Supabase : NetworkFirst (on tente le live, fallback cache si offline)
            urlPattern: ({ url }) =>
              url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/rest/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/admin/, /^\/login/, /^\/api/],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
