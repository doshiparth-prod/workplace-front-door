"use client";

import { useState } from "react";
import { useStore, uid } from "@/lib/store";
import { TOWNS } from "@/data/seed";
import type { NeedId, OppType, Tag } from "@/lib/types";

const TAGS: Tag[] = ["transit", "evening", "childcare", "free", "youth", "no-diploma", "full-time", "remote"];
const NEEDS: NeedId[] = ["job", "training", "career", "youth", "employer"];
const blank = { type: "event" as OppType, titleEn: "", titleEs: "", provider: "The WorkPlace", town: "Bridgeport", date: "", summaryEn: "", summaryEs: "", needs: ["job"] as NeedId[], tags: ["free"] as Tag[] };

export default function Content() {
  const { opportunities, addOpportunity, updateOpportunity, ready } = useStore();
  const [f, setF] = useState(blank);
  const [flash, setFlash] = useState("");
  if (!ready) return null;
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const valid = f.titleEn && f.summaryEn && f.needs.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addOpportunity({
      id: uid("o"), type: f.type, provider: f.provider, town: f.town, needs: f.needs, tags: f.tags,
      date: f.date ? new Date(f.date).toISOString() : undefined,
      title: { en: f.titleEn, es: f.titleEs || f.titleEn }, summary: { en: f.summaryEn, es: f.summaryEs || f.summaryEn }, published: true,
    });
    setFlash(`Published “${f.titleEn}” — residents will see it in matches right away.`);
    setF(blank);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[26rem_1fr] items-start">
      <form onSubmit={submit} className="card p-5 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Add a program or event</h1>
          <p className="text-sm text-muted">No developer needed. Spanish is optional — English is used if blank.</p>
        </div>
        {flash && <p role="status" className="rounded-xl bg-emerald-50 border border-success p-3 text-sm">✅ {flash}</p>}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Type
            <select className="input !py-2" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as OppType })}>
              {["event", "program", "training", "job"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="text-sm">Town
            <select className="input !py-2" value={f.town} onChange={(e) => setF({ ...f, town: e.target.value })}>
              {TOWNS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">Title (English) *<input className="input !py-2" value={f.titleEn} onChange={(e) => setF({ ...f, titleEn: e.target.value })} /></label>
        <label className="block text-sm">Title (Español)<input className="input !py-2" value={f.titleEs} onChange={(e) => setF({ ...f, titleEs: e.target.value })} /></label>
        <label className="block text-sm">Summary (English) *<textarea rows={2} className="input !py-2" value={f.summaryEn} onChange={(e) => setF({ ...f, summaryEn: e.target.value })} /></label>
        <label className="block text-sm">Summary (Español)<textarea rows={2} className="input !py-2" value={f.summaryEs} onChange={(e) => setF({ ...f, summaryEs: e.target.value })} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Provider<input className="input !py-2" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} /></label>
          <label className="text-sm">Date & time<input type="datetime-local" className="input !py-2" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">Show to residents who need *</legend>
          <div className="flex flex-wrap gap-1 mt-1">
            {NEEDS.map((n) => (
              <button type="button" key={n} aria-pressed={f.needs.includes(n)} onClick={() => setF({ ...f, needs: toggle(f.needs, n) })}
                className={`chip !text-sm !px-3 !py-1 border ${f.needs.includes(n) ? "bg-brand text-white border-brand" : "bg-surface border-line"}`}>{n}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold">Matching tags</legend>
          <div className="flex flex-wrap gap-1 mt-1">
            {TAGS.map((n) => (
              <button type="button" key={n} aria-pressed={f.tags.includes(n)} onClick={() => setF({ ...f, tags: toggle(f.tags, n) })}
                className={`chip !text-sm !px-3 !py-1 border ${f.tags.includes(n) ? "bg-brand text-white border-brand" : "bg-surface border-line"}`}>{n}</button>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary w-full" disabled={!valid}>Publish</button>
      </form>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-brand-soft text-left">
            <tr><th className="p-3">Listing</th><th className="p-3">Type</th><th className="p-3">Town</th><th className="p-3">Shown for</th><th className="p-3">Live</th></tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="p-3"><span className="font-semibold">{o.title.en}</span><span className="block text-xs text-muted">{o.provider}</span></td>
                <td className="p-3">{o.type}</td>
                <td className="p-3">{o.town}</td>
                <td className="p-3">{o.needs.join(", ")}</td>
                <td className="p-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={o.published} onChange={(e) => updateOpportunity(o.id, { published: e.target.checked })} />
                    <span className="sr-only">Published</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
