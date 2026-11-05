"use client";

import { useStore } from "@/lib/store";
import { BASELINE } from "@/data/seed";

const NEED_EN: Record<string, string> = { job: "Job", training: "Training", career: "Career help", youth: "Youth", employer: "Employer" };

export default function Insights() {
  const { events, referrals, ready } = useStore();
  if (!ready) return null;
  const count = (n: string) => events.filter((e) => e.name === n).length;
  const live = {
    visits: count("visit"),
    needSelected: count("need_selected"),
    intakeCompleted: count("intake_completed"),
    referrals: count("referral_created") + count("employer_lead"),
    enrolled: referrals.filter((r) => r.status === "enrolled").length,
  };
  const funnel = [
    { label: "Visited the front door", v: BASELINE.visits + live.visits, d: live.visits },
    { label: "Picked a need", v: BASELINE.needSelected + live.needSelected, d: live.needSelected },
    { label: "Finished intake", v: BASELINE.intakeCompleted + live.intakeCompleted, d: live.intakeCompleted },
    { label: "Referral / booking", v: BASELINE.referrals + live.referrals, d: live.referrals },
    { label: "Enrolled in a service", v: BASELINE.enrolled + live.enrolled, d: live.enrolled },
  ];
  const max = funnel[0].v;

  const towns: Record<string, Record<string, number>> = JSON.parse(JSON.stringify(BASELINE.needByTown));
  for (const r of referrals) {
    towns[r.town] ??= { job: 0, training: 0, career: 0, youth: 0, employer: 0 };
    towns[r.town][r.need] = (towns[r.town][r.need] ?? 0) + 1;
  }
  const consentRows = referrals.filter((r) => r.kind === "resident");
  const optIn = consentRows.length ? consentRows.filter((r) => r.smsConsent.optedIn).length / consentRows.length : 0;
  const es = referrals.length ? referrals.filter((r) => r.language === "es").length / referrals.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights · last 30 days</h1>
        <p className="text-sm text-muted">Sample baseline + live activity from this demo (green). In production this feeds WIOA performance reporting.</p>
      </div>

      <section className="card p-5">
        <h2 className="font-bold mb-4">Service-navigation funnel</h2>
        <ol className="space-y-3">
          {funnel.map((f, i) => (
            <li key={f.label}>
              <div className="flex justify-between text-sm">
                <span>{f.label}</span>
                <span className="font-semibold">
                  {f.v.toLocaleString()} {f.d > 0 && <span className="text-success">(+{f.d} live)</span>}
                  {i > 0 && <span className="text-muted font-normal"> · {Math.round((f.v / funnel[i - 1].v) * 100)}% of prior</span>}
                </span>
              </div>
              <div className="h-4 rounded-full bg-background mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(f.v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-muted">Text opt-in rate (live referrals)</p><p className="text-3xl font-bold">{Math.round(optIn * 100)}%</p><p className="text-xs text-muted">Baseline {Math.round(BASELINE.smsOptIn * 100)}%</p></div>
        <div className="card p-5"><p className="text-sm text-muted">Spanish-language sessions</p><p className="text-3xl font-bold">{Math.round(es * 100)}%</p><p className="text-xs text-muted">Baseline {Math.round(BASELINE.spanishShare * 100)}%</p></div>
        <div className="card p-5"><p className="text-sm text-muted">Open referrals awaiting contact</p><p className="text-3xl font-bold">{referrals.filter((r) => r.status === "new").length}</p><p className="text-xs text-muted">Target: contacted within 1 business day</p></div>
      </div>

      <section className="card overflow-x-auto">
        <h2 className="font-bold p-5 pb-2">Needs by town (where to focus outreach)</h2>
        <table className="w-full text-sm">
          <thead className="bg-brand-soft text-left">
            <tr><th className="p-3">Town</th>{Object.keys(NEED_EN).map((n) => <th key={n} className="p-3">{NEED_EN[n]}</th>)}</tr>
          </thead>
          <tbody>
            {Object.entries(towns).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0)).map(([tw, row]) => (
              <tr key={tw} className="border-t border-line">
                <td className="p-3 font-semibold">{tw}</td>
                {Object.keys(NEED_EN).map((n) => <td key={n} className="p-3">{row[n] ?? 0}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
