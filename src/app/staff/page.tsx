"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { COUNSELORS } from "@/data/seed";
import { PhoneThread } from "@/components/PhoneThread";
import { extractSkills, skillLabel } from "@/lib/resume";
import { dict, type TKey } from "@/lib/i18n";
import type { Referral, ReferralStatus } from "@/lib/types";

const STATUSES: ReferralStatus[] = ["new", "contacted", "scheduled", "enrolled", "closed"];
const STATUS_STYLE: Record<ReferralStatus, string> = {
  new: "bg-amber-100 text-amber-900",
  contacted: "bg-blue-100 text-blue-900",
  scheduled: "bg-purple-100 text-purple-900",
  enrolled: "bg-emerald-100 text-emerald-900",
  closed: "bg-gray-200 text-gray-800",
};
const NEED_EN: Record<string, string> = { job: "Job", training: "Training", career: "Career help", youth: "Youth 16–24", employer: "Employer" };
const TEMPLATES = [
  "Hi {name}, this is {counselor} from The WorkPlace. Confirming your appointment {slot}. Reply YES to confirm.",
  "Hi {name}, quick reminder: your appointment is tomorrow. Bring an ID if you have one.",
  "Hi {name}, I found a program that fits what you told us. Can we talk today?",
];

// Time since the referral came in, for the 1-business-day contact target.
const NOW = new Date("2026-11-05T14:00:00").getTime();
function age(r: Referral) {
  const h = Math.max(0, (Date.parse(r.createdAt) > NOW ? 0 : NOW - Date.parse(r.createdAt)) / 3.6e6);
  const label = h < 1 ? "just now" : h < 24 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`;
  const overdue = r.status === "new" && h >= 24;
  return { label, overdue };
}

function summary(r: Referral, oppTitle: (id: string) => string) {
  if (r.kind === "employer" && r.employer)
    return `${r.employer.company} (${r.town}) wants ${r.employer.count} ${r.employer.roles}${r.employer.startDate ? ` by ${r.employer.startDate}` : ""}${r.employer.ojt ? "; interested in OJT funds" : ""}.`;
  const plan = r.barriers.map((b) => dict.en[b as TKey].replace(/^I /, "").replace(/^It /, "").toLowerCase()).join(", ");
  const focus = r.focusOppId ? ` Asked about “${oppTitle(r.focusOppId)}”.` : "";
  return `${r.name}, ${r.town}, looking for ${NEED_EN[r.need].toLowerCase()}${plan ? ` (${plan})` : ""}.${focus}${r.eligibility === "likely" ? " Pre-screen: likely WIOA-eligible." : ""}`;
}

function nextAction(r: Referral): string {
  if (r.kind === "employer") return r.employer?.ojt ? "Send OJT agreement packet + schedule a site visit" : "Call to scope roles; share upcoming hiring fair";
  if (r.status === "new") return r.smsConsent.optedIn ? "Text to confirm the appointment (Template 1)" : `Call to confirm (${r.contactPref})`;
  if (r.status === "contacted") return "Confirm time, then move to scheduled";
  if (r.status === "scheduled") return r.eligibility === "likely" ? "Bring WIOA eligibility docs checklist to the meeting" : "Prep: review saved listings before the meeting";
  if (r.status === "enrolled") return "Log enrollment in CTHires; 30-day check-in text";
  return "No action";
}

const fmt = (s?: string) => (s ? new Date(s).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

export default function StaffQueue() {
  const { referrals, opportunities, updateReferral, addMessage, ready } = useStore();
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("open");
  const [sel, setSel] = useState<string>();

  const rows = useMemo(
    () =>
      referrals
        .filter((r) => (kind === "all" ? true : r.kind === kind))
        .filter((r) => (status === "open" ? r.status !== "closed" && r.status !== "enrolled" : status === "all" ? true : r.status === status))
        // New + oldest-waiting first, so nobody slips past the 1-business-day target.
        .sort((a, b) => (a.status === "new" ? 0 : 1) - (b.status === "new" ? 0 : 1) || b.createdAt.localeCompare(a.createdAt)),
    [referrals, kind, status],
  );
  if (!ready) return null;
  const r = referrals.find((x) => x.id === sel);
  const counts = STATUSES.map((s) => [s, referrals.filter((x) => x.status === s).length] as const);

  const setStatusFor = (x: Referral, s: ReferralStatus) => updateReferral(x.id, { status: s });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Referral queue</h1>
          <p className="text-muted text-sm">Ms. Denise Johnson · American Job Center – Bridgeport (demo staff view)</p>
        </div>
        <div className="flex gap-2 text-sm">
          {counts.map(([s, n]) => (
            <span key={s} className={`chip ${STATUS_STYLE[s]}`}>{s} {n}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">Type{" "}
          <select className="input !py-1.5 !w-auto" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All</option><option value="resident">Residents</option><option value="employer">Employers</option>
          </select>
        </label>
        <label className="text-sm">Status{" "}
          <select className="input !py-1.5 !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open (needs action)</option><option value="all">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_26rem] items-start">
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-soft text-left">
              <tr>
                <th className="p-3">Who</th><th className="p-3">Need</th><th className="p-3">Town</th>
                <th className="p-3">Contact</th><th className="p-3">Appt</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr
                  key={x.id}
                  onClick={() => setSel(x.id)}
                  className={`border-t border-line cursor-pointer hover:bg-background ${sel === x.id ? "bg-brand-soft" : ""}`}
                >
                  <td className="p-3">
                    <button className="font-semibold text-left underline-offset-2 hover:underline" onClick={() => setSel(x.id)}>
                      {x.kind === "employer" ? x.employer?.company : x.name}
                    </button>
                    <span className="block text-xs text-muted">
                      <span className={age(x).overdue ? "chip bg-red-100 text-red-900 mr-1" : "mr-1"}>{age(x).overdue ? "⏰ " : ""}{age(x).label}</span>
                      · {x.language === "es" ? "Spanish" : "English"}
                      {x.eligibility === "likely" && <span className="chip bg-violet-100 text-violet-900 ml-1">WIOA?</span>}
                    </span>
                  </td>
                  <td className="p-3">{NEED_EN[x.need]}</td>
                  <td className="p-3">{x.town}</td>
                  <td className="p-3">{x.contactPref}{x.smsConsent.optedIn ? " ✅" : ""}</td>
                  <td className="p-3">{fmt(x.slot)}</td>
                  <td className="p-3"><span className={`chip ${STATUS_STYLE[x.status]}`}>{x.status}</span></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="p-6 text-muted" colSpan={6}>Nothing here — queue is clear.</td></tr>}
            </tbody>
          </table>
        </div>

        {r ? (
          <aside className="space-y-4 lg:sticky lg:top-4" aria-label="Referral detail">
            <div className="card p-5 space-y-3">
              <div className="flex items-start gap-2">
                <div className="mr-auto">
                  <h2 className="text-xl font-bold">{r.kind === "employer" ? r.employer?.company : r.name}</h2>
                  <p className="text-sm text-muted">#{r.id} · via {r.source ?? "front-door"} · {r.language === "es" ? "prefers Spanish" : "English"}</p>
                </div>
                <button className="btn-ghost !min-h-8 !py-1 !px-2" onClick={() => setSel(undefined)} aria-label="Close">✕</button>
              </div>
              <p className="rounded-xl bg-background p-3 text-sm">
                <span className="font-semibold">Summary: </span>
                {summary(r, (id) => opportunities.find((o) => o.id === id)?.title.en ?? id)}
              </p>
              <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand-dark">
                <span className="font-semibold">👉 Suggested next step: </span>{nextAction(r)}
              </p>
              {r.freeText && <p className="text-sm italic text-muted">In their words: “{r.freeText}”</p>}
              <dl className="grid grid-cols-[7rem_1fr] gap-y-1 text-sm">
                {r.meet && (<><dt className="text-muted">Meeting</dt><dd>{r.meet === "inperson" ? "In person" : r.meet === "phone" ? "Phone" : "Video"}</dd></>)}
                <dt className="text-muted">Need</dt><dd>{NEED_EN[r.need]}</dd>
                <dt className="text-muted">Town</dt><dd>{r.town}</dd>
                <dt className="text-muted">Contact</dt><dd>{r.phone ?? r.email} ({r.contactPref})</dd>
                <dt className="text-muted">Text consent</dt>
                <dd>{r.smsConsent.optedIn ? `Opted in ${fmt(r.smsConsent.at)}` : r.smsConsent.optedOutAt ? `Opted OUT ${fmt(r.smsConsent.optedOutAt)}` : "No"}</dd>
                <dt className="text-muted">Appointment</dt>
                <dd>
                  {fmt(r.slot)} {r.counselorId && `· ${COUNSELORS.find((c) => c.id === r.counselorId)?.name}`}
                  {r.language === "es" && COUNSELORS.find((c) => c.id === r.counselorId)?.languages.includes("es") && <span className="chip bg-emerald-50 text-emerald-900 border border-emerald-200 ml-1">🗣 routed to Spanish speaker</span>}
                </dd>
                {r.barriers.length > 0 && (<><dt className="text-muted">Plan around</dt><dd>{r.barriers.map((b) => dict.en[b as TKey]).join(", ")}</dd></>)}
                {r.resumeFileName && (<><dt className="text-muted">Résumé</dt><dd>📎 {r.resumeFileName} <span className="text-xs text-muted">(read on resident&apos;s device; file not stored)</span></dd></>)}
                {(r.skills ?? []).length > 0 && (<><dt className="text-muted">Skills</dt><dd className="flex flex-wrap gap-1">{r.skills!.map((s) => <span key={s} className="chip bg-violet-50 text-violet-900 border border-violet-200">{skillLabel(s, "en")}</span>)}</dd></>)}
                {r.employer && (<>
                  <dt className="text-muted">Hiring</dt><dd>{r.employer.count} × {r.employer.roles}</dd>
                  <dt className="text-muted">Start</dt><dd>{r.employer.startDate || "—"}</dd>
                  <dt className="text-muted">OJT funds</dt><dd>{r.employer.ojt ? "Interested" : "No"}</dd>
                </>)}
              </dl>
              {r.opportunityIds.length > 0 && (
                <div>
                  <p className="text-sm text-muted">Saved / chosen</p>
                  <ul className="list-disc pl-5 text-sm">
                    {r.opportunityIds.map((id) => <li key={id}>{opportunities.find((o) => o.id === id)?.title.en ?? id}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <button key={s} onClick={() => setStatusFor(r, s)} aria-pressed={r.status === s}
                    className={`chip !text-sm !px-3 !py-1 border ${r.status === s ? STATUS_STYLE[s] + " border-current" : "bg-surface border-line"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {r.kind === "employer" && r.employer && (() => {
                // Employer ↔ jobseeker matching: role keywords → skills → open resident referrals.
                const want = extractSkills(r.employer.roles);
                const fits = referrals.filter((x) => x.kind === "resident" && x.status !== "closed" && (x.skills ?? []).some((s) => want.includes(s)));
                return (
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm">
                    <p className="font-semibold text-violet-900">🤝 {fits.length} jobseeker{fits.length === 1 ? "" : "s"} in the queue may fit</p>
                    <ul className="mt-1 space-y-0.5">
                      {fits.slice(0, 4).map((x) => (
                        <li key={x.id}>
                          <button className="underline" onClick={() => setSel(x.id)}>{x.name}</button>, {x.town} · {(x.skills ?? []).filter((s) => want.includes(s)).map((s) => skillLabel(s, "en")).join(", ")}
                        </li>
                      ))}
                      {fits.length === 0 && <li className="text-muted">None yet. Suggest a recruitment event or an OJT training cohort.</li>}
                    </ul>
                  </div>
                );
              })()}
              <label className="label !mb-0 text-sm" htmlFor="notes">Case notes</label>
              <textarea id="notes" className="input text-sm" rows={2} value={r.notes} onChange={(e) => updateReferral(r.id, { notes: e.target.value })} />
            </div>

            {r.kind === "resident" && (
              <>
                {r.smsConsent.optedIn && (
                  <div className="flex flex-wrap gap-1">
                    {TEMPLATES.map((tpl, i) => (
                      <button key={i} className="chip bg-brand-soft text-brand !text-xs !py-1"
                        onClick={() => {
                          const c = COUNSELORS.find((x) => x.id === r.counselorId);
                          addMessage({ referralId: r.id, direction: "out", body: tpl.replace("{name}", r.name).replace("{counselor}", c?.name ?? "your counselor").replace("{slot}", fmt(r.slot)) });
                          if (r.status === "new") updateReferral(r.id, { status: "contacted" });
                        }}>
                        Template {i + 1}
                      </button>
                    ))}
                  </div>
                )}
                <PhoneThread referralId={r.id} side="staff" />
                <button
                  className="btn-ghost !min-h-9 !py-1 text-sm"
                  onClick={() => addMessage({ referralId: r.id, direction: "in", body: r.language === "es" ? "Sí, ahí estaré. Gracias!" : "Yes, I'll be there. Thank you!" })}
                >
                  ↩ Simulate resident reply
                </button>
              </>
            )}
          </aside>
        ) : (
          <aside className="card p-6 text-muted">Select a referral to see full context, text the resident, and update status.</aside>
        )}
      </div>
    </div>
  );
}
