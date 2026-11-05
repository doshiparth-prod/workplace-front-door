import Link from "next/link";

export const metadata = { title: "How it works · Front Door prototype" };

const RFP = [
  ["A. Discovery & UX", "Needs-first navigation, 9 persona journeys, this clickable prototype", "Working", "Discovery sprint + usability testing with residents at an American Job Center"],
  ["B. Need-based navigation", "5 \"What do you need?\" tiles + 3-question intake", "Working", "Same, tuned with analytics"],
  ["B. Search & discovery", "Matched jobs, training, programs, events with \"why this matched\"", "Working (sample data)", "Live feeds: workplace.org, CTHires, state training provider list (ETPL)"],
  ["B. Calls to action", "Counselor booking, text-me-my-list, call/text us on every screen", "Working", "Calendar sync with counselor schedules"],
  ["B. Events", "RSVP + add to calendar (.ics)", "Working", "+ automated reminders"],
  ["B. Saved items", "Save + My saved list, no account needed", "Working (on device)", "Optional account / magic-link login"],
  ["B. Résumé upload", "PDF read on the resident's device (never uploaded) → skills they confirm → better matches + counselor sees skills. No résumé? A guided builder makes a printable one", "Working", "Encrypted document storage, virus scanning, retention rules; optional AI extraction with guardrails"],
  ["B. Status & follow-through", "Residents see their request move (received → assigned → contacted → scheduled → enrolled) as counselors update it", "Working", "Same, plus text notifications on each change"],
  ["Language-aware routing", "Spanish speakers are routed to a bilingual counselor (nearest office if none local)", "Working", "Routing by language, capacity and specialty"],
  ["Employer ↔ jobseeker matching", "Employer requests show which jobseekers in the queue have matching skills", "Working", "Consent-based candidate referrals to employers"],
  ["B. Employer pathway", "Hiring-help + OJT-funds form → staff queue", "Working", "Job posting, recruitment events, OJT contracts"],
  ["C. Two-way SMS", "Consent capture w/ timestamp, counselor ↔ resident thread, STOP opt-out, templates", "Simulated", "SMS provider (10DLC registration), inbound webhook, consent ledger, quiet hours"],
  ["D. Cross-platform", "Mobile-first responsive web app, installable (PWA)", "Working", "Shared codebase → iOS/Android store apps if desired"],
  ["E. Integrations & data", "This page (architecture + data model)", "Shown", "Phased per API availability; CSV/SFTP bridges where no API exists"],
  ["F. Accessibility, language, privacy, security", "EN/ES everywhere, larger text, keyboard + screen reader, AA contrast, data minimization", "Working + shown", "WCAG 2.1 AA audit, more languages, SSO + role-based access, encryption, audit logs"],
  ["G. Testing, launch, support", "Persona acceptance checklist (below)", "Shown", "Test plan, pilot at one AJC, SLAs, release cadence"],
  ["Content management", "Staff add/edit/unpublish listings with no developer", "Working", "Roles + review/approval workflow"],
  ["Measurement & reporting", "Funnel, needs by town, SMS opt-in, language mix", "Working", "Tied to WIOA performance measures"],
];

const PERSONAS = [
  ["P1 Jobseeker (Bridgeport, no car)", "Find a job → intake → bus-line matches → book counselor + text consent", "Referral in counselor queue + text thread"],
  ["P2 Career changer (Stamford, evenings)", "Get training → free evening programs → save → text me my list", "Saved list delivered by text"],
  ["P3 Young adult, Spanish (Norwalk)", "Español → 16–24 → GED / internships → résumé → request help", "Full journey in Spanish"],
  ["P4 Low digital literacy", "Larger text, icon tiles, call/text us on every screen", "≤5 taps or reaches a human"],
  ["P5 Keyboard / screen reader", "Skip link, labeled fields, visible focus", "P1 completed without a mouse"],
  ["P6 Employer (Shelton manufacturer)", "I'm an employer → hiring help + OJT", "Employer lead in staff queue"],
  ["P7 Counselor (AJC Bridgeport)", "Queue → context → text resident → status", "Update visible to resident"],
  ["P8 Content staff", "Add event (EN/ES)", "Appears in resident matches immediately"],
  ["P9 Leadership / funders", "Insights", "Funnel moves with live activity"],
];

const SYSTEMS = [
  { name: "Resident app (web/PWA)", demo: true },
  { name: "Staff console", demo: true },
  { name: "Matching rules", demo: true },
  { name: "workplace.org content", demo: false },
  { name: "CTHires (jobs + case mgmt)", demo: false },
  { name: "State training provider list", demo: false },
  { name: "SMS provider", demo: false },
  { name: "CTtransit routes (GTFS)", demo: false },
  { name: "Analytics warehouse", demo: false },
];

export default function HowItWorks() {
  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm font-semibold text-brand">Prototype prepared in response to The WorkPlace RFP: Mobile App &amp; Digital Workforce Front Door</p>
        <h1 className="text-3xl font-bold mt-1">How it works</h1>
        <p className="text-muted mt-2 max-w-3xl">
          One front door, organized around what people need — not program names. Residents get to a real next step in under two minutes;
          counselors receive a warm referral with full context; content staff keep listings current without a developer; leadership sees
          where people drop off. All data here is sample data and lives only in this browser.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">System at a glance</h2>
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {SYSTEMS.map((s) => (
              <span key={s.name} className={`rounded-xl border-2 px-3 py-2 font-semibold ${s.demo ? "border-brand bg-brand-soft text-brand" : "border-dashed border-line text-muted"}`}>
                {s.name}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-muted mt-4">
            <span className="font-semibold text-brand">Solid</span> = working in this demo · <span className="font-semibold">Dashed</span> = production integration (phased by API availability)
          </p>
          <p className="text-center text-sm mt-3">
            Resident → <b>intake</b> → <b>matching</b> → <b>referral</b> → counselor queue ⇄ <b>SMS</b> ⇄ resident → <b>status</b> → insights
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">RFP coverage</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-soft text-left">
              <tr><th className="p-3">RFP section</th><th className="p-3">In this prototype</th><th className="p-3">Depth</th><th className="p-3">In full deployment</th></tr>
            </thead>
            <tbody>
              {RFP.map(([a, b, c, d]) => (
                <tr key={a + b} className="border-t border-line align-top">
                  <td className="p-3 font-semibold">{a}</td><td className="p-3">{b}</td>
                  <td className="p-3"><span className={`chip ${c.startsWith("Working") ? "bg-emerald-100 text-emerald-900" : c === "Simulated" ? "bg-amber-100 text-amber-900" : "bg-gray-200 text-gray-800"}`}>{c}</span></td>
                  <td className="p-3 text-muted">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold mb-3">Data model</h2>
          <ul className="card p-5 space-y-2 text-sm">
            <li><b>Need</b>: job · training · career help · youth · employer</li>
            <li><b>Opportunity</b>: type, title (EN/ES), provider, town, needs, tags (bus line, evening, childcare, free, no diploma…)</li>
            <li><b>Referral</b>: who, need, town, barriers, chosen listings, appointment, contact preference, <b>SMS consent (timestamped)</b>, status, counselor, notes</li>
            <li><b>Message</b>: referral, direction, body, time</li>
            <li><b>Event</b>: anonymous analytics (visit, need picked, intake done, referral…)</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Privacy &amp; security</h2>
          <ul className="card p-5 space-y-2 text-sm">
            <li>No account needed to explore. We ask for a first name and phone only when someone books.</li>
            <li>Barriers (e.g., childcare) are optional, private, and used only to match and prepare the counselor.</li>
            <li>Texts are sent only with explicit, timestamped consent. STOP opts out instantly and is honored in the staff console.</li>
            <li>Production: SSO + role-based access for staff, encryption in transit/at rest, audit logs, retention schedule. The WorkPlace owns its data.</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Persona acceptance tests</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-soft text-left"><tr><th className="p-3">Persona</th><th className="p-3">Journey</th><th className="p-3">Pass when</th></tr></thead>
            <tbody>
              {PERSONAS.map(([a, b, c]) => (
                <tr key={a} className="border-t border-line"><td className="p-3 font-semibold">{a}</td><td className="p-3">{b}</td><td className="p-3">✅ {c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-bold">Rollout</h2>
        <ol className="mt-2 list-decimal pl-5 space-y-1">
          <li><b>Weeks 1–2:</b> discovery and usability tests with residents and counselors; confirm integrations available.</li>
          <li><b>Weeks 3–6:</b> connect workplace.org content + SMS provider; pilot at one American Job Center.</li>
          <li><b>Weeks 7–10:</b> regional launch, additional languages, CTHires referral handoff, app-store packaging if desired.</li>
        </ol>
        <Link href="/" className="btn-primary mt-4">Try the resident experience →</Link>
      </section>
    </div>
  );
}
