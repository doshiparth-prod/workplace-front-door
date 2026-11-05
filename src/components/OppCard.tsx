"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { icsFor } from "@/lib/match";
import { EligibilityCheck } from "./EligibilityCheck";
import { skillLabel } from "@/lib/resume";
import type { TKey } from "@/lib/i18n";
import type { Opportunity } from "@/lib/types";

const TYPE_STYLE: Record<string, string> = {
  job: "bg-sky-100 text-sky-900",
  training: "bg-violet-100 text-violet-900",
  program: "bg-emerald-100 text-emerald-900",
  event: "bg-amber-100 text-amber-900",
};
const TYPE_ICON: Record<string, string> = { job: "💼", training: "🎓", program: "🧭", event: "🗓" };

export function OppCard({ opp, reasons = [], best = false, skills = [] }: { opp: Opportunity; reasons?: TKey[]; best?: boolean; skills?: string[] }) {
  const { t, lang, saved, toggleSaved, rsvps, toggleRsvp, setIntake } = useStore();
  const router = useRouter();
  const [elig, setElig] = useState(false);
  const isSaved = saved.includes(opp.id);
  const going = rsvps.includes(opp.id);
  const title = opp.title[lang];
  const date = opp.date
    ? new Date(opp.date).toLocaleString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  // One clear primary action per listing type.
  const primary =
    opp.type === "event" ? (
      <button onClick={() => toggleRsvp(opp.id)} aria-pressed={going} className={going ? "btn-secondary !min-h-11 flex-1" : "btn-primary !min-h-11 flex-1"}>
        {going ? "✓ " + t("rsvped") : t("rsvp")}
      </button>
    ) : opp.type === "training" ? (
      <button onClick={() => setElig(true)} className="btn-primary !min-h-11 flex-1">{t("cta_training")}</button>
    ) : (
      <button
        onClick={() => {
          if (!isSaved) toggleSaved(opp.id);
          setIntake({ focusOppId: opp.id });
          router.push("/book");
        }}
        className="btn-primary !min-h-11 flex-1"
      >
        {opp.type === "job" ? t("cta_job") : t("cta_program")} →
      </button>
    );

  return (
    <article className={`card p-5 flex flex-col gap-3 rise ${best ? "!border-brand ring-2 ring-brand/20" : ""}`}>
      {best && <p className="-mt-1 text-sm font-bold text-brand">⭐ {t("bestMatch")}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`chip ${TYPE_STYLE[opp.type]}`}>{TYPE_ICON[opp.type]} {t(`type_${opp.type}` as TKey)}</span>
        <span className="text-sm text-muted">📍 {opp.town}</span>
        {date && <span className="text-sm font-semibold">{date}</span>}
      </div>
      <div>
        <h3 className="text-lg font-bold leading-snug">{title}</h3>
        <p className="text-sm text-muted">{opp.provider}</p>
      </div>
      <p className="text-[15px]">{opp.summary[lang]}</p>
      {(reasons.length > 0 || skills.length > 0) && (
        <ul className="flex flex-wrap gap-1.5" aria-label={t("why")}>
          {skills.map((s) => (
            <li key={s} className="chip bg-violet-50 text-violet-900 border border-violet-200">
              📄 {lang === "es" ? `Coincide con su experiencia: ${skillLabel(s, lang)}` : `Matches your ${skillLabel(s, lang).toLowerCase()} experience`}
            </li>
          ))}
          {reasons.map((r) => (
            <li key={r} className="chip bg-emerald-50 text-emerald-900 border border-emerald-200">✓ {t(r)}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {primary}
        <button
          onClick={() => toggleSaved(opp.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t("saved") : t("save")}
          className={`btn-secondary !min-h-11 !px-3 ${isSaved ? "!bg-brand-soft" : ""}`}
        >
          {isSaved ? "★" : "☆"} <span className="hidden sm:inline">{isSaved ? t("saved") : t("save")}</span>
        </button>
        {opp.type === "event" && (
          <a href={icsFor(opp, title)} download={`${opp.id}.ics`} className="btn-ghost !min-h-11 !px-3" aria-label={t("addCal")}>📅</a>
        )}
      </div>
      {elig && <EligibilityCheck opp={opp} onClose={() => setElig(false)} />}
    </article>
  );
}
