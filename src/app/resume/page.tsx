"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SKILLS, skillLabel } from "@/lib/resume";

interface JobRow { title: string; place: string; years: string }

/** "No résumé? We'll build one" — a plain, printable résumé from a few prompts. Stays on device. */
export default function ResumeBuilder() {
  const { lang, intake, setIntake, ready } = useStore();
  const es = lang === "es";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobs, setJobs] = useState<JobRow[]>([{ title: "", place: "", years: "" }]);
  const [edu, setEdu] = useState("");
  if (!ready) return null;
  const skills = intake.skills ?? [];
  const toggle = (id: string) => setIntake({ skills: skills.includes(id) ? skills.filter((x) => x !== id) : [...skills, id] });

  return (
    <div className="grid gap-8 lg:grid-cols-2 items-start">
      <section className="space-y-5 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">{es ? "Creemos su currículum" : "Let's build your résumé"}</h1>
          <p className="text-muted">{es ? "4 pasos cortos. Puede imprimirlo o guardarlo como PDF." : "4 short steps. Print it or save it as a PDF."}</p>
        </div>
        <div className="card p-5 space-y-3">
          <p className="font-bold">1 · {es ? "Sus datos" : "About you"}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">{es ? "Nombre completo" : "Full name"}<input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label className="text-sm font-semibold">{es ? "Teléfono" : "Phone"}<input className="input mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          </div>
        </div>
        <div className="card p-5 space-y-3">
          <p className="font-bold">2 · {es ? "Trabajos que ha tenido (fechas aproximadas está bien)" : "Jobs you've had (approximate dates are fine)"}</p>
          {jobs.map((j, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              {(["title", "place", "years"] as (keyof JobRow)[]).map((k) => (
                <input key={k} className="input !py-2" aria-label={k}
                  placeholder={k === "title" ? (es ? "Puesto" : "Job title") : k === "place" ? (es ? "Dónde" : "Where") : es ? "Años (ej. 2021–2024)" : "Years (e.g. 2021–2024)"}
                  value={j[k]} onChange={(e) => setJobs(jobs.map((x, n) => (n === i ? { ...x, [k]: e.target.value } : x)))} />
              ))}
            </div>
          ))}
          <button type="button" className="btn-ghost !min-h-9 !py-1 text-sm" onClick={() => setJobs([...jobs, { title: "", place: "", years: "" }])}>+ {es ? "Otro trabajo" : "Add another"}</button>
        </div>
        <div className="card p-5 space-y-3">
          <p className="font-bold">3 · {es ? "¿Qué sabe hacer?" : "What are you good at?"}</p>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <button key={s.id} type="button" aria-pressed={skills.includes(s.id)} onClick={() => toggle(s.id)}
                className={`chip !text-sm !px-3 !py-1.5 border ${skills.includes(s.id) ? "bg-brand text-white border-brand" : "bg-surface border-line"}`}>
                {s.label[lang]}
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5 space-y-3">
          <p className="font-bold">4 · {es ? "Estudios" : "School"}</p>
          <input className="input" placeholder={es ? "ej. Bassick High School, 2015" : "e.g. Bassick High School, 2015 — or GED in progress"} value={edu} onChange={(e) => setEdu(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => { setIntake({ resumeFileName: es ? "currículum (creado aquí)" : "résumé (built here)" }); window.print(); }}>
            🖨 {es ? "Imprimir / guardar PDF" : "Print / save as PDF"}
          </button>
          <Link href="/book" className="btn-secondary">{es ? "Revisarlo con un consejero" : "Review it with a counselor"} →</Link>
        </div>
      </section>

      {/* Live preview (this is what prints) */}
      <section aria-label="Preview" className="card p-8 bg-white text-black lg:sticky lg:top-28 print:shadow-none print:border-0">
        <h2 className="text-2xl font-bold">{name || (es ? "Su nombre" : "Your Name")}</h2>
        <p className="text-sm text-gray-600">{[phone, intake.town ? `${intake.town}, CT` : ""].filter(Boolean).join(" · ")}</p>
        <hr className="my-4" />
        <h3 className="font-bold uppercase text-xs tracking-wider text-gray-500">{es ? "Habilidades" : "Skills"}</h3>
        <p className="mt-1">{skills.length ? skills.map((s) => skillLabel(s, lang)).join(" · ") : "—"}</p>
        <h3 className="font-bold uppercase text-xs tracking-wider text-gray-500 mt-4">{es ? "Experiencia" : "Experience"}</h3>
        <ul className="mt-1 space-y-1">
          {jobs.filter((j) => j.title).map((j, i) => (
            <li key={i}><b>{j.title}</b>{j.place && `, ${j.place}`}{j.years && <span className="text-gray-600"> · {j.years}</span>}</li>
          ))}
          {!jobs.some((j) => j.title) && <li className="text-gray-400">—</li>}
        </ul>
        <h3 className="font-bold uppercase text-xs tracking-wider text-gray-500 mt-4">{es ? "Educación" : "Education"}</h3>
        <p className="mt-1">{edu || "—"}</p>
      </section>
    </div>
  );
}
