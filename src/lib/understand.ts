import { TOWNS } from "@/data/seed";
import type { NeedId } from "./types";

/**
 * "Tell us in your own words" — transparent, rules-based understanding of free text (EN + ES).
 * Deliberately explainable: we always show residents what we understood and let them edit it.
 * In production this is where an LLM with guardrails would slot in (same output shape).
 */
export interface Understood {
  need?: NeedId;
  town?: string;
  barriers: string[];
  matched: string[]; // phrases we keyed on (shown to staff for transparency)
}

const RULES: { re: RegExp; need?: NeedId; barrier?: string; label: string }[] = [
  { re: /\b(i'?m an employer|employer|we'?re hiring|we need workers|my company|my business|necesito contratar|mi empresa|empleador)\b/i, need: "employer", label: "employer" },
  { re: /\b(ged|diploma|high school|secundaria|preparatoria|internship|pasant[ií]a|first job|primer empleo)\b/i, need: "youth", label: "GED / first job" },
  { re: /\b(train|training|certif\w*|course|class(es)?|learn|become a|nurs\w*|cna|cdl|it support|coding|capacitaci[oó]n|curso|clases|aprender|enfermer\w*)\b/i, need: "training", label: "training" },
  { re: /\b(r[eé]sum[eé]|cv|interview|career|coach|curr[ií]culum|entrevista|consejer\w*)\b/i, need: "career", label: "career help" },
  { re: /\b(job|work|laid off|fired|lost my job|unemployed|hiring|empleo|trabajo|despedid\w*|desemplead\w*)\b/i, need: "job", label: "job" },
  { re: /\b(no car|don'?t have a car|without a car|bus|no tengo (carro|auto|coche)|sin carro|autob[uú]s)\b/i, barrier: "b_noCar", label: "no car" },
  { re: /\b(evening|evenings|night|nights|after work|noche|noches|tarde)\b/i, barrier: "b_evenings", label: "evenings" },
  { re: /\b(kid|kids|child|children|daughter|son|childcare|daycare|hij[oa]s?|ni[ñn]os|guarder[ií]a)\b/i, barrier: "b_childcare", label: "childcare" },
  { re: /\b(free|can'?t afford|no money|broke|gratis|no tengo dinero|sin costo)\b/i, barrier: "b_free", label: "free" },
  { re: /\b(no diploma|didn'?t finish|dropped out|ged|sin diploma|no termin[eé])\b/i, barrier: "b_noDiploma", label: "no diploma" },
  { re: /\b(full[- ]time|tiempo completo|benefits|beneficios)\b/i, barrier: "b_fullTime", label: "full-time" },
];

export function understand(text: string): Understood {
  const out: Understood = { barriers: [], matched: [] };
  if (!text.trim()) return out;
  for (const r of RULES) {
    const m = text.match(r.re);
    if (!m) continue;
    out.matched.push(m[0]);
    if (r.need && !out.need) out.need = r.need;
    if (r.barrier && !out.barriers.includes(r.barrier)) out.barriers.push(r.barrier);
  }
  // Age 16–24 → youth path (unless clearly an employer).
  const age = text.match(/\b(1[6-9]|2[0-4])\s*(years?|yrs?|y\/o|años)\b|\bi'?m (1[6-9]|2[0-4])\b|tengo (1[6-9]|2[0-4])/i);
  if (age && out.need !== "employer") out.need = "youth";
  const town = TOWNS.find((t) => new RegExp(`\\b${t}\\b`, "i").test(text));
  if (town) out.town = town;
  return out;
}
