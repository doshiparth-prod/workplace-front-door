import type { TKey } from "./i18n";
import type { Intake, Opportunity, Tag } from "./types";

// Barrier answer -> tag it should be matched against, and the "why" label.
const BARRIER_TAG: Record<string, { tag: Tag; reason: TKey }> = {
  b_noCar: { tag: "transit", reason: "r_transit" },
  b_evenings: { tag: "evening", reason: "r_evening" },
  b_childcare: { tag: "childcare", reason: "r_childcare" },
  b_free: { tag: "free", reason: "r_free" },
  b_noDiploma: { tag: "no-diploma", reason: "r_noDiploma" },
  b_fullTime: { tag: "full-time", reason: "r_fullTime" },
};

export const BARRIERS = Object.keys(BARRIER_TAG);

export interface Match {
  opp: Opportunity;
  score: number;
  reasons: TKey[];
  skills: string[]; // résumé skills that line up with this listing
}

// Simple, explainable rules-based ranking. Explainability matters more than cleverness
// for residents and for staff who need to trust (and audit) what the tool recommends.
export function matchOpportunities(all: Opportunity[], intake: Partial<Intake>, query = ""): Match[] {
  const q = query.trim().toLowerCase();
  const need = intake.need;
  return all
    .filter((o) => o.published)
    .filter((o) => (q ? `${o.title.en} ${o.title.es} ${o.summary.en} ${o.provider}`.toLowerCase().includes(q) : true))
    .filter((o) => (need && !q ? o.needs.includes(need) : true))
    .map((opp) => {
      let score = 1;
      const reasons: TKey[] = [];
      if (intake.town && opp.town === intake.town) {
        score += 3;
        reasons.push("r_town");
      }
      for (const b of intake.barriers ?? []) {
        const m = BARRIER_TAG[b];
        if (!m) continue;
        if (opp.tags.includes(m.tag)) {
          score += 2;
          reasons.push(m.reason);
        } else if (m.tag === "evening" || m.tag === "free" || m.tag === "no-diploma") {
          score -= 2; // hard-ish constraints
        }
      }
      if (need === "youth" && opp.tags.includes("youth")) {
        score += 2;
        reasons.push("r_youth");
      }
      if (opp.type === "event") score += 0.5;
      const skills = (intake.skills ?? []).filter((s) => opp.skills?.includes(s));
      score += skills.length * 2.5;
      return { opp, score, reasons, skills };
    })
    .sort((a, b) => b.score - a.score);
}

export function icsFor(o: Opportunity, title: string): string {
  const start = new Date(o.date ?? "2026-11-18T10:00:00");
  const end = new Date(start.getTime() + 2 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Front Door Demo//EN",
    "BEGIN:VEVENT",
    `UID:${o.id}@frontdoor-demo`,
    `DTSTAMP:${fmt(start)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${o.town}, CT`,
    `DESCRIPTION:${o.provider}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}
