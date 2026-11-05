"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import { OPPORTUNITIES, TOWNS } from "@/data/seed";
import { OppCard } from "@/components/OppCard";

export default function Employer() {
  const { t, lang, addReferral, track } = useStore();
  const [f, setF] = useState({ company: "", name: "", email: "", town: "", roles: "", count: 1, startDate: "", ojt: true });
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f, v: string | number | boolean) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.company && f.name && f.email && f.town && f.roles;
  const roundtable = OPPORTUNITIES.find((o) => o.id === "e5")!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addReferral({
      id: uid("r"), kind: "employer", createdAt: new Date().toISOString(), name: f.name, email: f.email, language: lang,
      need: "employer", town: f.town, barriers: [], opportunityIds: [], contactPref: "email", smsConsent: { optedIn: false },
      status: "new", notes: "", source: "front-door",
      employer: { company: f.company, roles: f.roles, count: Number(f.count), startDate: f.startDate, ojt: f.ojt },
    });
    track("employer_lead", { need: "employer", town: f.town });
    setDone(true);
  };

  if (done)
    return (
      <div className="max-w-xl mx-auto card p-8 text-center space-y-4">
        <p aria-hidden className="text-5xl">🤝</p>
        <h1 className="text-2xl font-bold">{t("employerThanks")}</h1>
        <Link href="/" className="btn-secondary">{t("startOver")}</Link>
      </div>
    );

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_20rem] items-start">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">{t("employerTitle")}</h1>
          <p className="text-muted mt-1">{t("employerSub")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="co">{t("company")} *</label><input id="co" className="input" value={f.company} onChange={(e) => set("company", e.target.value)} /></div>
          <div>
            <label className="label" htmlFor="tw">Town *</label>
            <select id="tw" className="input" value={f.town} onChange={(e) => set("town", e.target.value)}>
              <option value="" disabled>—</option>{TOWNS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div><label className="label" htmlFor="nm">{t("contactName")} *</label><input id="nm" className="input" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="label" htmlFor="em">{t("email")} *</label><input id="em" type="email" className="input" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        </div>
        <div><label className="label" htmlFor="ro">{t("roles")} *</label><input id="ro" className="input" placeholder="e.g. CNC machinists, warehouse associates" value={f.roles} onChange={(e) => set("roles", e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="ct">{t("count")}</label><input id="ct" type="number" min={1} className="input" value={f.count} onChange={(e) => set("count", e.target.value)} /></div>
          <div><label className="label" htmlFor="sd">{t("startDate")}</label><input id="sd" type="date" className="input" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
        </div>
        <label className="card flex items-start gap-3 p-4 cursor-pointer">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--brand)]" checked={f.ojt} onChange={(e) => set("ojt", e.target.checked)} />
          <span>{t("ojt")}</span>
        </label>
        <button className="btn-primary w-full" disabled={!valid}>{t("submitEmployer")} →</button>
      </form>
      <aside className="space-y-3">
        <p className="font-semibold">Upcoming for employers</p>
        <OppCard opp={roundtable} />
      </aside>
    </div>
  );
}
