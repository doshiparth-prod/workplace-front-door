/**
 * Résumé reading happens entirely in the browser: the file is never uploaded.
 * We extract plain text with pdf.js, then pull out skills with transparent keyword rules.
 * Production: encrypted document storage + (optionally) an LLM extractor with guardrails.
 */

export interface Skill {
  id: string;
  label: { en: string; es: string };
  re: RegExp;
}

export const SKILLS: Skill[] = [
  { id: "forklift", label: { en: "Forklift", es: "Montacargas" }, re: /forklift|reach truck|pallet jack|montacargas/i },
  { id: "warehouse", label: { en: "Warehouse / inventory", es: "Almacén / inventario" }, re: /warehouse|inventory|shipping|receiving|picker|packer|logistics|almac[eé]n/i },
  { id: "customer", label: { en: "Customer service", es: "Servicio al cliente" }, re: /customer service|call center|client(s)? |guest service|servicio al cliente/i },
  { id: "retail", label: { en: "Retail / cashier", es: "Ventas / cajero" }, re: /retail|cashier|sales associate|point of sale|\bpos\b|cajer[oa]/i },
  { id: "patient", label: { en: "Patient care", es: "Cuidado de pacientes" }, re: /patient|cna|caregiver|home health|nursing|medical assistant|enfermer/i },
  { id: "manufacturing", label: { en: "Manufacturing / machining", es: "Manufactura" }, re: /cnc|machin(ist|e operator)|assembly|production line|manufactur|welding|weld/i },
  { id: "driving", label: { en: "Driving / CDL", es: "Manejo / CDL" }, re: /\bcdl\b|driver|delivery|chofer/i },
  { id: "it", label: { en: "Computers / IT", es: "Computación / TI" }, re: /\bit support|help ?desk|comptia|computer|microsoft office|excel|technical support/i },
  { id: "food", label: { en: "Food service", es: "Servicio de comida" }, re: /food service|cook|kitchen|server|barista|restaurant|cocin/i },
  { id: "construction", label: { en: "Construction / trades", es: "Construcción / oficios" }, re: /construction|carpent|electric(al|ian)|plumb|hvac|laborer|construcci/i },
  { id: "bilingual", label: { en: "Bilingual (Spanish)", es: "Bilingüe (español)" }, re: /bilingual|spanish|espa[ñn]ol|biling[uü]e/i },
  { id: "admin", label: { en: "Office / admin", es: "Oficina / administración" }, re: /administrative|receptionist|data entry|office assistant|scheduling|billing|recepcionista/i },
];

export function extractSkills(text: string): string[] {
  return SKILLS.filter((s) => s.re.test(text)).map((s) => s.id);
}

export async function pdfToText(file: File): Promise<string> {
  if (file.type === "text/plain" || file.name.endsWith(".txt")) return file.text();
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let p = 1; p <= Math.min(doc.numPages, 5); p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((i) => ("str" in i ? i.str : "")).join(" ") + "\n";
  }
  return out;
}

export const skillLabel = (id: string, lang: "en" | "es") => SKILLS.find((s) => s.id === id)?.label[lang] ?? id;
