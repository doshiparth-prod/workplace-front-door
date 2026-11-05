"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import { COUNSELORS } from "@/data/seed";
import { OppCard } from "@/components/OppCard";
import { PhoneThread } from "@/components/PhoneThread";
import { StatusTracker } from "@/components/StatusTracker";

export default function Plan() {
  const { t, lang, saved, rsvps, opportunities, referrals, lastReferralId, intake, addReferral, addMessage, track, ready } = useStore();
  const [phone, setPhone] = useState("");
  const [threadId, setThreadId] = useState<string>();
  if (!ready) return null;
  const appt = referrals.find((r) => r.id === lastReferralId && r.slot);
  const c = appt && COUNSELORS.find((x) => x.id === appt.counselorId);
  const savedItems = opportunities.filter((o) => saved.includes(o.id) && o.type !== "event");
  const events = opportunities.filter((o) => o.type === "event" && (rsvps.includes(o.id) || saved.includes(o.id)));
  const empty = !appt && savedItems.length === 0 && events.length === 0;
  const fmt = (s: string) => new Date(s).toLocaleString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const textPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const number = appt?.phone ?? phone;
    if (!number.trim()) return;
    const now = new Date().toISOString();
    let id = appt?.id;
    if (!id || !appt?.smsConsent.optedIn) {
      id = uid("r");
      addReferral({
        id, kind: "resident", createdAt: now, name: "(texted plan)", phone: number, language: lang,
        need: intake.need ?? "career", town: intake.town ?? "Bridgeport", barriers: intake.barriers ?? [],
        opportunityIds: saved, contactPref: "text", smsConsent: { optedIn: true, at: now },
        status: "new", notes: "Texted their plan — warm lead, follow up.", source: "my-plan",
      });
      track("sms_opt_in");
    }
    const lines = [
      ...(appt ? [`📅 ${fmt(appt.slot!)} – ${c?.name}`] : []),
      ...[...savedItems, ...events].map((o, i) => `${i + 1}. ${o.title[lang]} (${o.town})`),
    ].join("\n");
    addMessage({
      referralId: id, direction: "out",
      body: (lang === "es" ? "Su plan de The WorkPlace:\n" : "Your WorkPlace plan:\n") + lines + (lang === "es" ? "\nResponda AYUDA para hablar con un consejero. STOP para cancelar." : "\nReply HELP to talk to a counselor. STOP to opt out."),
    });
    setThreadId(id);
  };

  if (empty)
    return (
      <div className="max-w-xl mx-auto card p-8 text-center space-y-4">
        <p aria-hidden className="text-5xl">★</p>
        <h1 className="text-2xl font-bold">{t("planTitle")}</h1>
        <p className="text-muted">{t("planEmpty")}</p>
        <Link href="/" className="btn-primary">{t("homeTitle")} →</Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("planTitle")}</h1>
        <p className="text-muted">{t("planSub")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] items-start">
        <div className="space-y-8">
          {appt ? (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="card p-5 !border-success">
                <p className="text-sm font-semibold text-success">✅ {t("planAppt")}</p>
                <p className="text-xl font-bold mt-1">{fmt(appt.slot!)}</p>
                <p className="text-muted">{c?.name} · {c?.office}</p>
                {appt.smsConsent.optedIn && <div className="mt-4"><PhoneThread referralId={appt.id} side="resident" /></div>}
              </div>
              <StatusTracker referral={appt} />
            </section>
          ) : (
            <section className="card p-5 bg-brand-soft !border-brand/30 flex flex-wrap items-center gap-3">
              <div className="mr-auto">
                <p className="font-bold">👉 {t("planNext")}</p>
                <p className="text-muted">{t("planNextBook")}</p>
              </div>
              <Link href="/book" className="btn-primary">{t("talkCounselor")} →</Link>
            </section>
          )}
          {events.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">🗓 {t("planEvents")}</h2>
              <div className="grid gap-4 md:grid-cols-2">{events.map((o) => <OppCard key={o.id} opp={o} />)}</div>
            </section>
          )}
          {savedItems.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">★ {t("planSaved")}</h2>
              <div className="grid gap-4 md:grid-cols-2">{savedItems.map((o) => <OppCard key={o.id} opp={o} />)}</div>
            </section>
          )}
        </div>
        <aside className="space-y-3 lg:sticky lg:top-28">
          {!threadId ? (
            <form onSubmit={textPlan} className="card p-5 space-y-3">
              <p className="font-bold text-lg">💬 {t("textMyPlan")}</p>
              {!appt?.phone && (
                <label className="block text-sm font-semibold">{t("phone")}
                  <input className="input mt-1" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(203) 555-0100" />
                </label>
              )}
              <p className="text-xs text-muted">{t("smsConsent")}</p>
              <button className="btn-primary w-full">{t("textMyPlan")}</button>
            </form>
          ) : (
            <>
              <p className="font-semibold text-success">✓ {t("listTexted")}</p>
              <PhoneThread referralId={threadId} side="resident" />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
