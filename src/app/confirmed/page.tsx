"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { COUNSELORS } from "@/data/seed";
import { PhoneThread } from "@/components/PhoneThread";
import { matchOpportunities } from "@/lib/match";
import { OppCard } from "@/components/OppCard";
import { StatusTracker } from "@/components/StatusTracker";
import type { TKey } from "@/lib/i18n";

function apptIcs(title: string, slot: string, where: string) {
  const s = new Date(slot);
  const e = new Date(s.getTime() + 30 * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${title}`, `LOCATION:${where}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}

export default function Confirmed() {
  const { t, lang, referrals, lastReferralId, opportunities, intake, ready } = useStore();
  if (!ready) return null;
  const r = referrals.find((x) => x.id === lastReferralId);
  if (!r) return <p className="card p-6"><Link className="underline" href="/">{t("startOver")}</Link></p>;
  const c = COUNSELORS.find((x) => x.id === r.counselorId);
  const when = r.slot
    ? new Date(r.slot).toLocaleString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";
  const where = r.meet === "inperson" || !r.meet ? c?.office ?? "" : t(`meet_${r.meet}` as TKey);
  // Suggest the nearest upcoming event as a "while you wait" step.
  const event = matchOpportunities(opportunities, { ...intake, need: r.need, town: r.town }).find((m) => m.opp.type === "event")?.opp;

  return (
    <div className="grid gap-8 md:grid-cols-2 items-start">
      <section className="space-y-5">
        <div className="card p-6 !border-success rise">
          <p aria-hidden className="text-4xl">✅</p>
          <h1 className="text-3xl font-bold mt-2">{t("confirmedTitle")}</h1>
          <p className="mt-2 text-lg">{t("withCounselor")} <strong>{c?.name}</strong></p>
          <p className="text-lg">{when}</p>
          <p className="text-muted">{where}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn-primary" href={apptIcs(`The WorkPlace – ${c?.name}`, r.slot!, where)} download="appointment.ics">📅 {t("addApptCal")}</a>
            <Link className="btn-secondary" href="/plan">{t("viewPlan")}</Link>
          </div>
          <p className="text-xs text-muted mt-3">Ref #{r.id}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold">{t("confirmedSub")}</h2>
          <ol className="mt-3 space-y-3">
            {[t("next1"), t("next2"), t("next3")].map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-brand text-white font-bold">{i + 1}</span>
                <span className="pt-1">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <StatusTracker referral={r} />

        <div className="card p-5">
          <h2 className="font-bold">🧾 {lang === "es" ? "Antes de su cita" : "Before your appointment"}</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {(["prep1", "prep2", "prep3"] as TKey[]).map((k) => <li key={k}>☐ {t(k)}</li>)}
          </ul>
        </div>

        {event && (
          <div>
            <h2 className="text-xl font-bold mb-2">{t("whileWait")}</h2>
            <OppCard opp={event} />
          </div>
        )}
      </section>

      <section aria-label={t("yourTexts")} className="md:sticky md:top-28">
        <h2 className="text-xl font-bold mb-3 text-center">{t("yourTexts")}</h2>
        {r.smsConsent.optedIn || r.smsConsent.optedOutAt ? (
          <PhoneThread referralId={r.id} side="resident" />
        ) : (
          <p className="card p-6 text-muted text-center">{r.contactPref === "email" ? "✉️ " + t("c_email") : "📞 " + t("c_call")}</p>
        )}
      </section>
    </div>
  );
}
