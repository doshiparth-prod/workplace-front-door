"use client";

import { useStore } from "@/lib/store";
import { COUNSELORS } from "@/data/seed";
import type { Referral } from "@/lib/types";

const STEPS = [
  { key: "new", en: "Request received", es: "Solicitud recibida" },
  { key: "assigned", en: "Counselor assigned", es: "Consejero asignado" },
  { key: "contacted", en: "Counselor reached out", es: "El consejero le contactó" },
  { key: "scheduled", en: "Meeting confirmed", es: "Reunión confirmada" },
  { key: "enrolled", en: "Enrolled in a service", es: "Inscrito en un servicio" },
] as const;

const RANK: Record<string, number> = { new: 1, contacted: 2, scheduled: 3, enrolled: 4, closed: 4 };

/** Resident-facing view of the same status counselors set in the staff queue. Closes the loop. */
export function StatusTracker({ referral }: { referral: Referral }) {
  const { lang } = useStore();
  const at = RANK[referral.status] ?? 1; // index of the current step (0-based: 0 received, 1 assigned …)
  const c = COUNSELORS.find((x) => x.id === referral.counselorId);
  return (
    <div className="card p-5">
      <p className="font-bold">{lang === "es" ? "Estado de su solicitud" : "Where your request is"}</p>
      <ol className="mt-3 space-y-0">
        {STEPS.map((s, i) => {
          const done = i <= at;
          const current = i === at;
          return (
            <li key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`grid place-items-center h-7 w-7 rounded-full text-xs font-bold ${done ? "bg-success text-white" : "bg-line text-muted"} ${current ? "ring-4 ring-success/20" : ""}`}>
                  {done ? "✓" : i + 1}
                </span>
                {i < STEPS.length - 1 && <span className={`w-0.5 h-6 ${i < at ? "bg-success" : "bg-line"}`} />}
              </div>
              <div className={`pb-2 ${current ? "font-semibold" : done ? "" : "text-muted"}`}>
                {s[lang]}
                {s.key === "assigned" && c && <span className="block text-xs text-muted">{c.name} · {c.office}</span>}
                {current && i < STEPS.length - 1 && (
                  <span className="block text-xs text-success">{lang === "es" ? "Paso actual" : "Current step"}</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
