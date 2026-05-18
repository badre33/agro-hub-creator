// Helper WhatsApp Cloud API (Meta).
// Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
//
// Variables d'environnement requises (Supabase Dashboard → Edge Functions → Secrets) :
//   WHATSAPP_ACCESS_TOKEN     – Permanent token de l'app WhatsApp Business
//   WHATSAPP_PHONE_NUMBER_ID  – ID du numéro WhatsApp Business (pas le numéro lui-même)
//   WHATSAPP_TEMPLATE_NAME    – (optionnel) Nom du template approuvé pour l'envoi initial
//                               Par défaut : "order_confirmation"
//
// IMPORTANT : pour envoyer un document à un client qui n'a JAMAIS messagé Broccagri,
// il faut utiliser un message TEMPLATE (pré-approuvé par Meta), pas un message session.
// On utilise un template `order_confirmation` avec un header de type document.
// Si tu n'as pas encore créé le template, voir CLEANUP.md section WhatsApp.

const GRAPH_VERSION = "v18.0";

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  templateName?: string;
}

export function readWhatsAppConfigFromEnv(): WhatsAppConfig | null {
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

  if (!accessToken || !phoneNumberId) {
    console.warn(
      "[whatsapp] Configuration manquante (WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID). " +
        "L'envoi WhatsApp sera sauté.",
    );
    return null;
  }

  return {
    accessToken,
    phoneNumberId,
    templateName: Deno.env.get("WHATSAPP_TEMPLATE_NAME") || "order_confirmation",
  };
}

/**
 * Normalise un numéro de téléphone marocain vers le format E.164 sans + ni espaces.
 * Exemples :
 *   "+212 6 61 79 24 73" -> "212661792473"
 *   "0661792473"         -> "212661792473"
 *   "0561792473"         -> "212561792473"
 */
export function normalizeMoroccanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0")) return "212" + digits.slice(1);
  return digits;
}

/**
 * Upload un PDF sur le serveur de média WhatsApp et renvoie le media_id.
 * Le media_id reste valide ~30 jours côté WhatsApp.
 */
export async function uploadPdfToWhatsApp(
  config: WhatsAppConfig,
  pdf: Uint8Array,
  filename: string,
): Promise<string> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/media`;

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append(
    "file",
    new Blob([pdf], { type: "application/pdf" }),
    filename,
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp media upload failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (!data.id) {
    throw new Error(`WhatsApp media upload returned no id: ${JSON.stringify(data)}`);
  }
  return data.id;
}

/**
 * Envoie un message TEMPLATE avec header document.
 * Le template doit exister et être approuvé côté Meta Business.
 * Schéma attendu côté Meta :
 *   - Header : type DOCUMENT
 *   - Body   : 2 variables {{1}} = numéro de commande, {{2}} = total en DH
 */
export async function sendInvoiceTemplate(
  config: WhatsAppConfig,
  params: {
    toPhone: string;
    mediaId: string;
    filename: string;
    orderNumber: string;
    totalAmount: number;
    languageCode?: string;
  },
): Promise<unknown> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: params.toPhone,
    type: "template",
    template: {
      name: config.templateName,
      language: { code: params.languageCode || "fr" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: { id: params.mediaId, filename: params.filename },
            },
          ],
        },
        {
          type: "body",
          parameters: [
            { type: "text", text: params.orderNumber },
            { type: "text", text: params.totalAmount.toFixed(2) },
          ],
        },
      ],
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${errBody}`);
  }

  return await res.json();
}

/**
 * Alternative : envoyer un message session (sans template).
 * Ne fonctionne que si le client a écrit à Broccagri dans les 24 dernières heures.
 * Gardé en utilitaire mais pas utilisé par défaut.
 */
export async function sendDocumentInSessionWindow(
  config: WhatsAppConfig,
  params: { toPhone: string; mediaId: string; filename: string; caption?: string },
): Promise<unknown> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: params.toPhone,
    type: "document",
    document: {
      id: params.mediaId,
      filename: params.filename,
      caption: params.caption,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`WhatsApp send (session) failed (${res.status}): ${errBody}`);
  }

  return await res.json();
}
