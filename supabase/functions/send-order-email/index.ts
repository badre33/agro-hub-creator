import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Validate required fields
    if (!orderData.order_id || typeof orderData.order_id !== 'string') {
      console.error("Missing or invalid order_id");
      return new Response(
        JSON.stringify({ error: "Invalid order_id" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role to verify order exists
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the order exists in the database - this prevents fake order emails
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_name, customer_phone, delivery_city, total_amount, created_at")
      .eq("id", orderData.order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found or error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the order was created recently (within last 5 minutes) to prevent replay attacks
    const orderCreatedAt = new Date(order.created_at);
    const now = new Date();
    const timeDiffMinutes = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60);
    
    if (timeDiffMinutes > 5) {
      console.error("Order too old, possible replay attack. Time diff:", timeDiffMinutes, "minutes");
      return new Response(
        JSON.stringify({ error: "Order email already processed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify order details match what's in the database
    if (order.customer_name !== orderData.customer_name ||
        order.customer_phone !== orderData.customer_phone ||
        order.delivery_city !== orderData.delivery_city) {
      console.error("Order data mismatch");
      return new Response(
        JSON.stringify({ error: "Invalid order data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch actual order items from database for verification
    const { data: dbOrderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit, product_price, subtotal")
      .eq("order_id", orderData.order_id);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to verify order items" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use database items instead of client-provided items for email
    const verifiedItems = dbOrderItems || [];

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

    // Generate items HTML using verified database data
    const itemsHtml = verifiedItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(item.product_name)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} ${escapeHtml(item.unit)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.product_price} DH/${escapeHtml(item.unit)}</td>
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
              <p style="margin: 5px 0;"><strong>Nom:</strong> ${escapeHtml(order.customer_name)}</p>
              <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${escapeHtml(order.customer_phone)}</p>
              <p style="margin: 5px 0;"><strong>📍 Ville de livraison:</strong> ${escapeHtml(order.delivery_city)}</p>
              ${orderData.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${escapeHtml(orderData.notes)}</p>` : ""}
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
                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${order.total_amount.toFixed(2)} DH</td>
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
      subject: `🥦 Nouvelle Commande #${orderData.order_id.slice(0, 8)} - ${escapeHtml(order.customer_name)}`,
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
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Helper function to escape HTML to prevent XSS
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(handler);
