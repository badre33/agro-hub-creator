import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit: string;
  product_price: number;
  subtotal: number;
}

interface OrderEmailRequest {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  total_amount: number;
  items: OrderItem[];
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderEmailRequest = await req.json();
    console.log("Order data received:", orderData);

    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Email configuration missing" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate items HTML
    const itemsHtml = orderData.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${item.unit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.product_price} DH/${item.unit}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.subtotal.toFixed(2)} DH</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Nouvelle Commande - Broccagri</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🥦 Broccagri</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Nouvelle Commande Reçue!</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #16a34a; margin-top: 0;">📦 Détails de la commande #${orderData.order_id.slice(0, 8)}</h2>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #374151;">👤 Informations Client</h3>
              <p style="margin: 5px 0;"><strong>Nom:</strong> ${orderData.customer_name}</p>
              <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${orderData.customer_phone}</p>
              <p style="margin: 5px 0;"><strong>📍 Ville de livraison:</strong> ${orderData.delivery_city}</p>
              ${orderData.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${orderData.notes}</p>` : ""}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #374151;">🛒 Articles commandés</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Quantité</th>
                    <th style="padding: 10px; text-align: right;">Prix unitaire</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #22c55e; color: white;">
                    <td colspan="3" style="padding: 15px; font-weight: bold; font-size: 18px;">TOTAL</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${orderData.total_amount.toFixed(2)} DH</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div style="background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">Broccagri - Fruits & Légumes Frais</p>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", adminEmail);

    const emailResponse = await resend.emails.send({
      from: "Broccagri <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `🥦 Nouvelle Commande #${orderData.order_id.slice(0, 8)} - ${orderData.customer_name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
