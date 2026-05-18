# Broccagri — Boutique

Boutique en ligne de Broccagri, déployée sous `broccagri.ma/boutique`. Catalogue de fruits et légumes, panier, commande par facture directe (pas de paiement en ligne), back-office admin pour le suivi des commandes.

## Stack

- Vite + React 18 + TypeScript
- shadcn/ui + Tailwind CSS
- Supabase (orders, order_items, user_roles, auth admin)
- Edge Function Deno : génération facture PDF + envoi WhatsApp Cloud API + email Resend
- React Router

## Développement local

```sh
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:8080`.

## Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner :

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

Les secrets Edge Function (`RESEND_API_KEY`, `ADMIN_EMAIL`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`) sont configurés directement dans Supabase Dashboard.

## Routes

- `/` → Catalogue produits avec filtres par catégorie
- `/panier` → Panier + formulaire de commande
- `/admin` → Back-office (commandes, statuts)
- `/login` → Auth Supabase admin

## Workflow commande

1. Client choisit ses produits → panier (localStorage)
2. Saisie nom + téléphone + ville + notes
3. Création commande en DB Supabase
4. Edge Function `send-order-email` :
   - Génère une facture PDF (pdf-lib)
   - Envoie à l'admin par email (Resend)
   - Envoie au client par WhatsApp Cloud API (avec PDF en pièce jointe)
5. L'admin met à jour le statut dans `/admin` : pending → confirmed → preparing → delivered

## Déploiement

Déployé via Netlify, monté sous `broccagri.ma/boutique` par reverse proxy depuis le vitrine.
