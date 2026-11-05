"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/lib/store";
import { matchOpportunities } from "@/lib/match";
import { OppCard } from "@/components/OppCard";
import { ResumeReader } from "@/components/ResumeReader";
import { needLabel } from "@/lib/needs";
import type { TKey } from "@/lib/i18n";
import type { OppType } from "@/lib/types";

const TYPES: OppType[] = ["job", "training", "program", "event"];

function Results() {
  const { t, opportunities, intake, ready } = useStore();
  const q = useSearchParams().get("q") ?? "";
  const [type, setType] = useState<OppType | "all">("all");
  if (!ready) return null;
  const matches = matchOpportunities(opportunities, intake, q).slice(0, 10);
  const shown = matches.filter((m) => type === "all" || m.opp.type === type);
  const counts = Object.fromEntries(TYPES.map((x) => [x, matches.filter((m) => m.opp.type === x).length]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">{t("resultsTitle")}</h1>
        <p className="text-muted mt-1">{q ? `“${q}”` : t("resultsSub")}</p>
        {!q && intake.need && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">{t("answersSoFar")}:</span>
            <span className="chip bg-brand-soft text-brand-dark">{t(needLabel[intake.need])}</span>
            {intake.town && <span className="chip bg-brand-soft text-brand-dark">📍 {intake.town}</span>}
            {(intake.barriers ?? []).map((b) => <span key={b} className="chip bg-brand-soft text-brand-dark">{t(b as TKey)}</span>)}
            <Link href={`/start/${intake.need}`} className="underline text-brand font-semibold">{t("edit")}</Link>
          </div>
        )}
      </div>

      {/* Type filters with counts */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter">
        {(["all", ...TYPES] as const).map((x) => {
          const n = x === "all" ? matches.length : counts[x];
          if (x !== "all" && !n) return null;
          return (
            <button key={x} role="tab" aria-selected={type === x} onClick={() => setType(x)}
              className={`chip !text-sm !px-3.5 !py-2 border whitespace-nowrap ${type === x ? "bg-foreground text-white border-foreground" : "bg-surface border-line"}`}>
              {x === "all" ? t("filterAll") : t(`type_${x}` as TKey)} · {n}
            </button>
          );
        })}
      </div>

      {intake.need !== "employer" && (
        <details className="group" open={!intake.resumeFileName}>
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand">
            {intake.resumeFileName ? `📄 ${intake.resumeFileName} · ${(intake.skills ?? []).length} skills ▾` : ""}
          </summary>
          <div className="mt-2"><ResumeReader /></div>
        </details>
      )}

      {shown.length === 0 ? (
        <p className="card p-6 text-lg">{t("noMatches")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((m, i) => (
            <OppCard key={m.opp.id} opp={m.opp} reasons={m.reasons} skills={m.skills} best={i === 0 && type === "all" && m.reasons.length + m.skills.length > 0} />
          ))}
        </div>
      )}

      <div className="card p-5 flex flex-wrap items-center gap-4 bg-brand-soft !border-brand/30">
        <span aria-hidden className="text-3xl">🤝</span>
        <div className="mr-auto">
          <p className="text-lg font-bold">{t("talkCounselor")}</p>
          <p className="text-muted">{t("talkCounselorSub")}</p>
        </div>
        <Link href="/book" className="btn-primary">{t("talkCounselor")} →</Link>
      </div>

      {/* Sticky mobile CTA, above the bottom nav */}
      <div className="sm:hidden fixed inset-x-0 bottom-16 z-20 px-4 pb-2">
        <Link href="/book" className="btn-primary w-full shadow-lg">🤝 {t("stickyCta")}</Link>
      </div>
      <div className="sm:hidden h-14" aria-hidden />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  );
}
