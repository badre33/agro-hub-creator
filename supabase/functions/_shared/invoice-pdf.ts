// Génération de facture PDF côté Edge Function (Deno).
// Utilise pdf-lib via esm.sh. Pas de dépendance Node.

import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFFont,
  PDFPage,
} from "https://esm.sh/pdf-lib@1.17.1";

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit: string;
  product_price: number;
  subtotal: number;
}

export interface InvoiceData {
  order_id: string;
  order_number?: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_city: string;
  notes?: string;
  total_amount: number;
  items: InvoiceItem[];
}

const BRAND_GREEN = rgb(0.13, 0.65, 0.31); // ~ #22a44f
const TEXT_DARK = rgb(0.13, 0.16, 0.22);
const TEXT_LIGHT = rgb(0.45, 0.49, 0.55);
const BG_LIGHT = rgb(0.96, 0.97, 0.97);
const BORDER = rgb(0.85, 0.87, 0.88);

const PAGE_WIDTH = 595.28; // A4 portrait
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

export async function buildInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Facture Broccagri - ${data.order_id.slice(0, 8).toUpperCase()}`);
  doc.setAuthor("Broccagri");
  doc.setSubject("Facture client");
  doc.setCreator("Broccagri (broccagri.ma)");

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let cursorY = PAGE_HEIGHT - MARGIN;

  // ===== HEADER =====
  cursorY = drawHeader(page, fontRegular, fontBold, cursorY, data);

  // ===== CLIENT BLOCK =====
  cursorY -= 30;
  cursorY = drawCustomerBlock(page, fontRegular, fontBold, cursorY, data);

  // ===== ITEMS TABLE =====
  cursorY -= 30;
  cursorY = drawItemsTable(page, fontRegular, fontBold, cursorY, data);

  // ===== TOTAL =====
  cursorY -= 10;
  cursorY = drawTotal(page, fontRegular, fontBold, cursorY, data);

  // ===== NOTES =====
  if (data.notes && data.notes.trim()) {
    cursorY -= 30;
    cursorY = drawNotes(page, fontRegular, fontBold, cursorY, data.notes);
  }

  // ===== FOOTER =====
  drawFooter(page, fontRegular, fontBold);

  return await doc.save();
}

function drawHeader(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  y: number,
  data: InvoiceData,
): number {
  // Logo / nom de marque
  page.drawText("BROCCAGRI", {
    x: MARGIN,
    y,
    size: 24,
    font: fontBold,
    color: BRAND_GREEN,
  });
  page.drawText("Fruits & légumes frais du terroir marocain", {
    x: MARGIN,
    y: y - 16,
    size: 9,
    font: fontRegular,
    color: TEXT_LIGHT,
  });

  // Bloc droite : infos facture
  const rightX = PAGE_WIDTH - MARGIN - 200;
  page.drawText("FACTURE", {
    x: rightX,
    y,
    size: 16,
    font: fontBold,
    color: TEXT_DARK,
  });

  const invoiceNumber =
    data.order_number || data.order_id.slice(0, 8).toUpperCase();
  const dateStr = new Date(data.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  page.drawText(`N° ${invoiceNumber}`, {
    x: rightX,
    y: y - 18,
    size: 10,
    font: fontRegular,
    color: TEXT_DARK,
  });
  page.drawText(`Date : ${dateStr}`, {
    x: rightX,
    y: y - 32,
    size: 10,
    font: fontRegular,
    color: TEXT_LIGHT,
  });

  // Séparateur
  page.drawLine({
    start: { x: MARGIN, y: y - 50 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 50 },
    thickness: 2,
    color: BRAND_GREEN,
  });

  return y - 60;
}

function drawCustomerBlock(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  y: number,
  data: InvoiceData,
): number {
  page.drawText("CLIENT", {
    x: MARGIN,
    y,
    size: 10,
    font: fontBold,
    color: TEXT_LIGHT,
  });

  const lineHeight = 14;
  let lineY = y - 18;

  page.drawText(data.customer_name, {
    x: MARGIN,
    y: lineY,
    size: 12,
    font: fontBold,
    color: TEXT_DARK,
  });
  lineY -= lineHeight;

  page.drawText(`Tél : ${data.customer_phone}`, {
    x: MARGIN,
    y: lineY,
    size: 10,
    font: fontRegular,
    color: TEXT_DARK,
  });
  lineY -= lineHeight;

  page.drawText(`Livraison : ${data.delivery_city}`, {
    x: MARGIN,
    y: lineY,
    size: 10,
    font: fontRegular,
    color: TEXT_DARK,
  });

  return lineY - 6;
}

function drawItemsTable(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  y: number,
  data: InvoiceData,
): number {
  const colX = {
    name: MARGIN,
    qty: 320,
    price: 400,
    total: 480,
  };

  // En-tête
  page.drawRectangle({
    x: MARGIN,
    y: y - 4,
    width: PAGE_WIDTH - 2 * MARGIN,
    height: 22,
    color: BG_LIGHT,
  });
  page.drawText("Produit", {
    x: colX.name + 6,
    y: y + 4,
    size: 9,
    font: fontBold,
    color: TEXT_DARK,
  });
  page.drawText("Quantité", {
    x: colX.qty,
    y: y + 4,
    size: 9,
    font: fontBold,
    color: TEXT_DARK,
  });
  page.drawText("Prix u.", {
    x: colX.price,
    y: y + 4,
    size: 9,
    font: fontBold,
    color: TEXT_DARK,
  });
  page.drawText("Total", {
    x: colX.total,
    y: y + 4,
    size: 9,
    font: fontBold,
    color: TEXT_DARK,
  });

  let rowY = y - 20;

  for (const item of data.items) {
    page.drawText(truncate(item.product_name, 38), {
      x: colX.name + 6,
      y: rowY,
      size: 10,
      font: fontRegular,
      color: TEXT_DARK,
    });
    page.drawText(`${item.quantity} ${item.unit}`, {
      x: colX.qty,
      y: rowY,
      size: 10,
      font: fontRegular,
      color: TEXT_DARK,
    });
    page.drawText(`${item.product_price.toFixed(2)} DH`, {
      x: colX.price,
      y: rowY,
      size: 10,
      font: fontRegular,
      color: TEXT_DARK,
    });
    page.drawText(`${item.subtotal.toFixed(2)} DH`, {
      x: colX.total,
      y: rowY,
      size: 10,
      font: fontBold,
      color: TEXT_DARK,
    });

    rowY -= 18;
    page.drawLine({
      start: { x: MARGIN, y: rowY + 6 },
      end: { x: PAGE_WIDTH - MARGIN, y: rowY + 6 },
      thickness: 0.5,
      color: BORDER,
    });
  }

  return rowY;
}

function drawTotal(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  y: number,
  data: InvoiceData,
): number {
  const totalBoxY = y - 30;

  page.drawRectangle({
    x: PAGE_WIDTH - MARGIN - 200,
    y: totalBoxY,
    width: 200,
    height: 36,
    color: BRAND_GREEN,
  });

  page.drawText("TOTAL", {
    x: PAGE_WIDTH - MARGIN - 190,
    y: totalBoxY + 13,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${data.total_amount.toFixed(2)} DH`, {
    x: PAGE_WIDTH - MARGIN - 95,
    y: totalBoxY + 11,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  return totalBoxY;
}

function drawNotes(
  page: PDFPage,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  y: number,
  notes: string,
): number {
  page.drawText("NOTES", {
    x: MARGIN,
    y,
    size: 10,
    font: fontBold,
    color: TEXT_LIGHT,
  });

  // Naïf wrap : on coupe à ~80 chars par ligne
  const lines = wrapText(notes, 90);
  let lineY = y - 16;
  for (const line of lines) {
    page.drawText(line, {
      x: MARGIN,
      y: lineY,
      size: 9,
      font: fontRegular,
      color: TEXT_DARK,
    });
    lineY -= 12;
  }
  return lineY;
}

function drawFooter(page: PDFPage, fontRegular: PDFFont, fontBold: PDFFont) {
  const footerY = 50;

  page.drawLine({
    start: { x: MARGIN, y: footerY + 24 },
    end: { x: PAGE_WIDTH - MARGIN, y: footerY + 24 },
    thickness: 0.5,
    color: BORDER,
  });

  page.drawText("Broccagri  ·  contact@broccagri.ma  ·  +212 661 79 24 73  ·  broccagri.ma", {
    x: MARGIN,
    y: footerY + 10,
    size: 8,
    font: fontRegular,
    color: TEXT_LIGHT,
  });

  page.drawText("Merci pour votre commande !", {
    x: MARGIN,
    y: footerY - 4,
    size: 9,
    font: fontBold,
    color: BRAND_GREEN,
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}
