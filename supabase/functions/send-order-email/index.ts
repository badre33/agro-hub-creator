// Edge Function : envoi de la notification de commande.
//
// Le nom de la fonction reste `send-order-email` pour compatibilité avec le
// frontend (Cart.tsx), mais elle fait désormais trois choses :
//   1. Vérifie la commande en DB (anti-replay, anti-spoof)
//   2. Génère un PDF de facture (pdf-lib, côté Edge)
//   3. Envoie un email à l'admin avec le PDF en pièce jointe (Resend)
//   4. Envoie un message WhatsApp au client avec le PDF (Cloud API Meta)
//
// Secrets Supabase requis :
//   RESEND_API_KEY              – clé Resend
//   ADMIN_EMAIL                 – email à qui notifier
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY – injectés automatiquement
//   WHATSAPP_ACCESS_TOKEN       – token permanent Meta
//   WHATSAPP_PHONE_NUMBER_ID    – ID du numéro WhatsApp Business
//   WHATSAPP_TEMPLATE_NAME      – (opt) nom du template, par défaut "order_confirmation"

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  buildInvoicePdf,
  InvoiceItem,
} from "../_shared/invoice-pdf.ts";
import {
  normalizeMoroccanPhone,
  readWhatsAppConfigFromEnv,
  sendInvoiceTemplate,
  uploadPdfToWhatsApp,
} from "../_shared/whatsapp.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  total_amount: number;
  items: InvoiceItem[];
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-email function called");

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    console.log("Order data received:", orderData);

    // -- VALIDATION --
    if (!orderData.order_id || typeof orderData.order_id !== "string") {
      return jsonError(400, "Invalid order_id");
    }

    // -- SUPABASE CLIENT (service role) --
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return jsonError(500, "Server configuration error");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // -- FETCH + VERIFY ORDER --
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, customer_name, customer_phone, delivery_city, total_amount, created_at",
      )
      .eq("id", orderData.order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return jsonError(404, "Order not found");
    }

    // Anti-replay : la commande doit avoir < 5 min
    const orderCreatedAt = new Date(order.created_at);
    const timeDiffMinutes =
      (Date.now() - orderCreatedAt.getTime()) / (1000 * 60);
    if (timeDiffMinutes > 5) {
      console.error("Order too old. Diff (min):", timeDiffMinutes);
      return jsonError(400, "Order email already processed");
    }

    // Anti-spoof : les champs doivent matcher
    if (
      order.customer_name !== orderData.customer_name ||
      order.customer_phone !== orderData.customer_phone ||
      order.delivery_city !== orderData.delivery_city
    ) {
      console.error("Order data mismatch");
      return jsonError(400, "Invalid order data");
    }

    // -- FETCH ITEMS FROM DB (source of truth, not client) --
    const { data: dbItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit, product_price, subtotal")
      .eq("order_id", orderData.order_id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return jsonError(500, "Failed to verify order items");
    }
    const verifiedItems: InvoiceItem[] = dbItems || [];

    // -- GENERATE PDF --
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await buildInvoicePdf({
        order_id: order.id,
        created_at: order.created_at,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_city: order.delivery_city,
        notes: orderData.notes,
        total_amount: Number(order.total_amount),
        items: verifiedItems,
      });
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
      return jsonError(500, "PDF generation failed");
    }

    const orderShortId = order.id.slice(0, 8).toUpperCase();
    const invoiceFilename = `Facture-Broccagri-${orderShortId}.pdf`;

    // -- SEND EMAIL TO ADMIN (with PDF attached) --
    let emailResponse: unknown = null;
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not configured, skipping admin email");
    } else {
      try {
        const itemsHtml = verifiedItems
          .map(
            (item) => `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eee;">${escapeHtml(item.product_name)}</td>
              <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity} ${escapeHtml(item.unit)}</td>
              <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">${item.product_price} DH</td>
              <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${item.subtotal.toFixed(2)} DH</td>
            </tr>`,
          )
          .join("");

        emailResponse = await resend.emails.send({
          from: "Broccagri <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `Nouvelle commande #${orderShortId} — ${escapeHtml(order.customer_name)}`,
          html: buildAdminEmailHtml({
            orderShortId,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            deliveryCity: order.delivery_city,
            notes: orderData.notes,
            totalAmount: Number(order.total_amount),
            itemsHtml,
          }),
          attachments: [
            {
              filename: invoiceFilename,
              content: bytesToBase64(pdfBytes),
            },
          ],
        });
        console.log("Admin email sent:", emailResponse);
      } catch (emailErr) {
        console.error("Email send failed (non-fatal):", emailErr);
        // On continue, WhatsApp peut toujours marcher
      }
    }

    // -- SEND WHATSAPP TO CUSTOMER (with PDF attached) --
    let whatsappResponse: unknown = null;
    const waConfig = readWhatsAppConfigFromEnv();
    if (waConfig) {
      try {
        const toPhone = normalizeMoroccanPhone(order.customer_phone);
        const mediaId = await uploadPdfToWhatsApp(
          waConfig,
          pdfBytes,
          invoiceFilename,
        );

        whatsappResponse = await sendInvoiceTemplate(waConfig, {
          toPhone,
          mediaId,
          filename: invoiceFilename,
          orderNumber: orderShortId,
          totalAmount: Number(order.total_amount),
          languageCode: "fr",
        });
        console.log("WhatsApp sent:", whatsappResponse);
      } catch (waErr) {
        console.error("WhatsApp send failed (non-fatal):", waErr);
        // On ne fait pas échouer la fonction si WhatsApp foire :
        // la commande est enregistrée et l'email admin est parti.
      }
    } else {
      console.log("WhatsApp not configured, skipping customer notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        admin_email_sent: !!emailResponse,
        whatsapp_sent: !!whatsappResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    console.error("Error in send-order-email function:", error);
    return jsonError(500, "Internal server error");
  }
};

// --- helpers ---

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function buildAdminEmailHtml(p: {
  orderShortId: string;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  notes?: string;
  totalAmount: number;
  itemsHtml: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Nouvelle Commande - Broccagri</title></head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:20px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">Broccagri</h1>
          <p style="color:rgba(255,255,255,0.9);margin:5px 0 0 0;">Nouvelle commande reçue</p>
        </div>
        <div style="background:#f9fafb;padding:20px;border:1px solid #e5e7eb;">
          <h2 style="color:#16a34a;margin-top:0;">Détails de la commande #${p.orderShortId}</h2>
          <div style="background:white;padding:15px;border-radius:8px;margin-bottom:20px;">
            <h3 style="margin-top:0;color:#374151;">Informations client</h3>
            <p style="margin:5px 0;"><strong>Nom:</strong> ${escapeHtml(p.customerName)}</p>
            <p style="margin:5px 0;"><strong>Téléphone:</strong> ${escapeHtml(p.customerPhone)}</p>
            <p style="margin:5px 0;"><strong>Ville de livraison:</strong> ${escapeHtml(p.deliveryCity)}</p>
            ${p.notes ? `<p style="margin:5px 0;"><strong>Notes:</strong> ${escapeHtml(p.notes)}</p>` : ""}
          </div>
          <div style="background:white;padding:15px;border-radius:8px;">
            <h3 style="margin-top:0;color:#374151;">Articles commandés</h3>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:10px;text-align:left;">Produit</th>
                  <th style="padding:10px;text-align:center;">Quantité</th>
                  <th style="padding:10px;text-align:right;">Prix unitaire</th>
                  <th style="padding:10px;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${p.itemsHtml}</tbody>
              <tfoot>
                <tr style="background:#22c55e;color:white;">
                  <td colspan="3" style="padding:15px;font-weight:bold;font-size:18px;">TOTAL</td>
                  <td style="padding:15px;text-align:right;font-weight:bold;font-size:18px;">${p.totalAmount.toFixed(2)} DH</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p style="margin-top:20px;font-size:14px;color:#555;">La facture PDF correspondante est jointe à cet email.</p>
        </div>
        <div style="background:#374151;color:white;padding:15px;text-align:center;border-radius:0 0 10px 10px;">
          <p style="margin:0;font-size:14px;">Broccagri — Fruits & Légumes Frais</p>
        </div>
      </body>
    </html>`;
}

serve(handler);
