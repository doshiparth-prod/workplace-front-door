"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { extractSkills, pdfToText, SKILLS, skillLabel } from "@/lib/resume";

/** Reads a résumé on-device, shows what we found, lets the resident confirm. Nothing is uploaded. */
export function ResumeReader({ compact = false }: { compact?: boolean }) {
  const { lang, intake, setIntake } = useStore();
  const [state, setState] = useState<"idle" | "reading" | "done" | "error">(intake.resumeFileName ? "done" : "idle");
  const [adding, setAdding] = useState(false);
  const skills = intake.skills ?? [];
  const es = lang === "es";

  const onFile = async (f?: File) => {
    if (!f) return;
    setState("reading");
    try {
      const text = await pdfToText(f);
      const found = extractSkills(text);
      setIntake({ skills: Array.from(new Set([...skills, ...found])), resumeFileName: f.name });
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className={compact ? "space-y-3" : "card p-5 space-y-3"}>
      {!compact && (
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-3xl">📄</span>
          <div>
            <p className="font-bold text-lg">{es ? "¿Tiene un currículum? Úselo para mejores opciones" : "Have a résumé? Use it for better matches"}</p>
            <p className="text-sm text-muted">
              {es
                ? "Lo leemos en su teléfono o computadora — el archivo no se sube a ningún lado."
                : "We read it right on your phone or computer — the file is never uploaded."}
            </p>
          </div>
        </div>
      )}

      {state !== "done" && (
        <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand/40 bg-brand-soft/50 p-5 text-center cursor-pointer hover:border-brand">
          <span className="font-semibold text-brand">{state === "reading" ? (es ? "Leyendo…" : "Reading…") : es ? "📎 Elegir PDF" : "📎 Choose a PDF"}</span>
          <span className="text-xs text-muted">PDF · {es ? "máx. 5 páginas" : "up to 5 pages"}</span>
          <input type="file" accept="application/pdf,.pdf,.txt" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}
      {state === "error" && <p className="text-sm text-danger">{es ? "No pudimos leer ese archivo. Pruebe otro PDF o siga sin él." : "We couldn't read that file. Try another PDF, or continue without it."}</p>}

      {state === "done" && (
        <div className="rise space-y-2" aria-live="polite">
          <p className="text-sm">
            ✅ <b>{intake.resumeFileName}</b> · {es ? "Encontramos estas habilidades — toque para quitar:" : "We found these skills — tap to remove:"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.length === 0 && <span className="text-sm text-muted">{es ? "No encontramos habilidades claras." : "No clear skills found."}</span>}
            {skills.map((s) => (
              <button key={s} type="button" onClick={() => setIntake({ skills: skills.filter((x) => x !== s) })}
                className="chip !text-sm !px-3 !py-1 bg-emerald-50 text-emerald-900 border border-emerald-200" aria-label={`Remove ${skillLabel(s, lang)}`}>
                {skillLabel(s, lang)} ✕
              </button>
            ))}
            <button type="button" onClick={() => setAdding(!adding)} className="chip !text-sm !px-3 !py-1 border border-line bg-surface">+ {es ? "Agregar" : "Add"}</button>
          </div>
          {adding && (
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.filter((s) => !skills.includes(s.id)).map((s) => (
                <button key={s.id} type="button" onClick={() => setIntake({ skills: [...skills, s.id] })} className="chip !text-sm !px-3 !py-1 border border-line bg-surface">
                  {s.label[lang]}
                </button>
              ))}
            </div>
          )}
          <button type="button" className="text-sm underline text-muted" onClick={() => { setIntake({ resumeFileName: undefined }); setState("idle"); }}>
            {es ? "Usar otro archivo" : "Use a different file"}
          </button>
        </div>
      )}

      <p className="text-sm">
        {es ? "¿No tiene currículum? " : "No résumé? "}
        <Link href="/resume" className="font-semibold text-brand underline">{es ? "Creamos uno con sus respuestas →" : "We'll build one from your answers →"}</Link>
      </p>
    </div>
  );
}
