"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import { counselorFor, TOWNS } from "@/data/seed";
import { needLabel } from "@/lib/needs";
import { ResumeReader } from "@/components/ResumeReader";
import { skillLabel } from "@/lib/resume";
import type { TKey } from "@/lib/i18n";
import type { ContactPref, MeetType, Referral } from "@/lib/types";

const SLOTS = (() => {
  const out: string[] = [];
  const d = new Date("2026-11-06T00:00:00");
  while (out.length < 6) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    for (const h of [10, 14, 17]) {
      const s = new Date(d);
      s.setHours(h);
      out.push(s.toISOString());
    }
  }
  return out.slice(0, 6);
})();

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 space-y-3">
      <h2 className="flex items-center gap-3 text-lg font-bold">
        <span className="grid place-items-center h-8 w-8 rounded-full bg-brand text-white text-sm">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Book() {
  const { t, lang, intake, saved, opportunities, addReferral, addMessage, track, setIntake } = useStore();
  const router = useRouter();
  const [meet, setMeet] = useState<MeetType>("inperson");
  const [slot, setSlot] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [townInput, setTown] = useState("");
  // Intake loads from storage after first render, so derive rather than copy into state.
  const town = townInput || intake.town || "";
  const [pref, setPref] = useState<ContactPref>(intake.contactPref ?? "text");
  const [consent, setConsent] = useState(true);
  const counselor = counselorFor(town || "Bridgeport", lang);
  const focus = opportunities.find((o) => o.id === intake.focusOppId);
  const fmt = (s: string) =>
    new Date(s).toLocaleString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const valid = slot && name.trim() && phone.trim() && town;
  const meetIcon: Record<MeetType, string> = { inperson: "🏢", phone: "📞", video: "💻" };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const now = new Date().toISOString();
    const texting = pref === "text" && consent;
    const r: Referral = {
      id: uid("r"), kind: "resident", createdAt: now, name: name.trim(), phone: phone.trim(), language: lang,
      need: intake.need ?? "career", town, barriers: intake.barriers ?? [],
      opportunityIds: Array.from(new Set([...(focus ? [focus.id] : []), ...saved])),
      slot, contactPref: pref, smsConsent: texting ? { optedIn: true, at: now } : { optedIn: false },
      resumeFileName: intake.resumeFileName, skills: intake.skills, status: "new", counselorId: counselor.id, notes: "", source: "front-door",
      meet, eligibility: intake.eligibility, freeText: intake.freeText, focusOppId: focus?.id,
    };
    addReferral(r);
    setIntake({ town });
    track("referral_created", { need: r.need, town });
    if (texting) {
      track("sms_opt_in");
      const where = meet === "inperson" ? counselor.office : meet === "phone" ? (lang === "es" ? "por teléfono" : "by phone") : "by video";
      addMessage({
        referralId: r.id, direction: "out",
        body: lang === "es"
          ? `Hola ${r.name}, es The WorkPlace. Su cita con ${counselor.name} es el ${fmt(slot!)} (${where}). Responda STOP para cancelar mensajes.`
          : `Hi ${r.name}, this is The WorkPlace. You're booked with ${counselor.name} on ${fmt(slot!)} (${where}). Reply STOP to opt out.`,
      });
    }
    router.push("/confirmed");
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_20rem] items-start">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{t("bookTitle")}</h1>
          <p className="text-muted mt-1">{t("bookSub")}</p>
        </div>

        <Section n={1} title={t("meetHow")}>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("meetHow")}>
            {(["inperson", "phone", "video"] as MeetType[]).map((m) => (
              <button type="button" role="radio" aria-checked={meet === m} key={m} onClick={() => setMeet(m)}
                className={`${meet === m ? "btn-primary" : "btn-secondary"} !flex-col !gap-0 !py-2`}>
                <span aria-hidden className="text-xl">{meetIcon[m]}</span>
                <span className="text-sm">{t(`meet_${m}` as TKey)}</span>
              </button>
            ))}
          </div>
          {!intake.town && (
            <label className="block text-sm font-semibold">
              {lang === "es" ? "Su ciudad" : "Your town"}
              <select className="input mt-1" value={town} onChange={(e) => setTown(e.target.value)} required>
                <option value="" disabled>—</option>
                {TOWNS.map((tw) => <option key={tw}>{tw}</option>)}
              </select>
            </label>
          )}
        </Section>

        <Section n={2} title={t("when")}>
          <p className="text-sm text-muted">
            {counselor.name} · {meet === "inperson" ? counselor.office : t(`meet_${meet}` as TKey)}
            {lang === "es" && counselor.languages.includes("es") && <span className="chip bg-emerald-50 text-emerald-900 border border-emerald-200 ml-2">🗣 Habla español</span>}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SLOTS.map((s) => (
              <button type="button" key={s} onClick={() => setSlot(s)} aria-pressed={slot === s} className={`${slot === s ? "btn-primary" : "btn-secondary"} !text-sm`}>
                {fmt(s)}
              </button>
            ))}
          </div>
        </Section>

        <Section n={3} title={t("reachYou")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">{t("yourName")} *
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required />
            </label>
            <label className="block text-sm font-semibold">{t("phone")} *
              <input className="input mt-1" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="(203) 555-0100" required />
            </label>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("q_contact")}>
            {(["text", "call", "email"] as ContactPref[]).map((c) => (
              <button type="button" role="radio" aria-checked={pref === c} key={c} onClick={() => setPref(c)}
                className={`chip !text-sm !px-3 !py-1.5 border ${pref === c ? "bg-brand text-white border-brand" : "bg-surface border-line"}`}>
                {c === "text" ? "💬" : c === "call" ? "📞" : "✉️"} {t(`c_${c}` as TKey)}
              </button>
            ))}
          </div>
          {pref === "text" && (
            <label className="flex items-start gap-3 rounded-xl bg-background p-3 cursor-pointer text-sm">
              <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--brand)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t("smsConsent")}</span>
            </label>
          )}
          <details className="text-sm" open={!!intake.resumeFileName}>
            <summary className="cursor-pointer font-semibold text-brand">📎 {t("resume")}</summary>
            <div className="mt-2"><ResumeReader compact /></div>
          </details>
        </Section>

        <button className="btn-primary w-full text-lg" disabled={!valid}>{t("confirmBook")} →</button>
      </div>

      {/* "You won't have to repeat yourself" */}
      <aside className="card p-5 space-y-3 lg:sticky lg:top-28 bg-brand-soft !border-brand/30">
        <p className="font-bold">👀 {t("counselorSees")}</p>
        <ul className="space-y-2 text-sm">
          {focus && <li>🎯 {t("askingAbout")}: <b>{focus.title[lang]}</b></li>}
          {intake.need && <li>🧭 {t(needLabel[intake.need])}</li>}
          {(town || intake.town) && <li>📍 {town || intake.town}</li>}
          {(intake.barriers ?? []).map((b) => <li key={b}>✓ {t(b as TKey)}</li>)}
          {intake.eligibility === "likely" && <li>🎓 {lang === "es" ? "Probablemente califica para fondos WIOA" : "Likely eligible for WIOA funding"}</li>}
          {(intake.skills ?? []).length > 0 && <li>📄 {(intake.skills ?? []).map((s) => skillLabel(s, lang)).join(", ")}</li>}
          {saved.length > 0 && <li>★ {saved.length} {t("planSaved").toLowerCase()}</li>}
          {intake.freeText && <li className="italic text-muted">“{intake.freeText}”</li>}
        </ul>
      </aside>
    </form>
  );
}
