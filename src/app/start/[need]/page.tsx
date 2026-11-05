"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { TOWNS } from "@/data/seed";
import { BARRIERS, matchOpportunities } from "@/lib/match";
import { needLabel } from "@/lib/needs";
import type { NeedId } from "@/lib/types";
import type { TKey } from "@/lib/i18n";

const STEPS = 2;
const QUICK_TOWNS = ["Bridgeport", "Stamford", "Norwalk", "Stratford", "Milford", "Shelton"];

export default function Intake() {
  const { need } = useParams<{ need: NeedId }>();
  const { t, intake, setIntake, track, opportunities } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(intake.town && intake.need === need ? 2 : 1);

  useEffect(() => {
    if (intake.need !== need) setIntake({ need });
  }, [need, intake.need, setIntake]);

  const barriers = intake.barriers ?? [];
  const order: string[] =
    need === "youth"
      ? ["b_noDiploma", "b_noCar", "b_evenings", "b_childcare", "b_free"]
      : need === "training"
        ? ["b_evenings", "b_free", "b_childcare", "b_noCar", "b_noDiploma"]
        : ["b_noCar", "b_fullTime", "b_evenings", "b_childcare", "b_noDiploma", "b_free"];
  const options = order.filter((b) => BARRIERS.includes(b));
  const live = matchOpportunities(opportunities, { ...intake, need }).filter((m) => m.score > 1).length;

  const finish = () => {
    track("intake_completed", { need, town: intake.town });
    router.push("/results");
  };

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-sm font-semibold text-brand">{t(needLabel[need] ?? "need_job")}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step} aria-label={`${t("step")} ${step} ${t("of")} ${STEPS}`}>
          <div className="h-full bg-brand transition-all" style={{ width: `${(step / STEPS) * 100}%` }} />
        </div>
        <span className="text-sm text-muted whitespace-nowrap">{t("step")} {step} {t("of")} {STEPS}</span>
      </div>

      {/* Live feedback: every answer visibly narrows things down. */}
      {intake.town && (
        <p className="mt-3 rise rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-dark font-semibold" aria-live="polite">
          🎯 {live} {t("matchesSoFar")}
        </p>
      )}

      <fieldset key={step} className="mt-6 rise">
        {step === 1 && (
          <>
            <legend className="text-2xl font-bold">{t("q_town")}</legend>
            <p className="text-muted mt-1 mb-4">{t("q_town_help")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TOWNS.map((tw) => (
                <button
                  type="button"
                  key={tw}
                  onClick={() => { setIntake({ town: tw }); setStep(2); }}
                  aria-pressed={intake.town === tw}
                  className={intake.town === tw ? "btn-primary" : "btn-secondary"}
                >
                  {tw}
                </button>
              ))}
            </div>
            <label htmlFor="town" className="block text-sm text-muted mt-4 mb-1">{t("language") === "English" ? "Otra ciudad" : "Another town"}</label>
            <select id="town" className="input" value={QUICK_TOWNS.includes(intake.town ?? "") ? "" : intake.town ?? ""}
              onChange={(e) => { setIntake({ town: e.target.value }); setStep(2); }}>
              <option value="" disabled>—</option>
              {TOWNS.filter((x) => !QUICK_TOWNS.includes(x)).map((tw) => <option key={tw}>{tw}</option>)}
            </select>
          </>
        )}

        {step === 2 && (
          <>
            <legend className="text-2xl font-bold">{t("q_barriers")}</legend>
            <p className="text-muted mt-1 mb-4">{t("q_barriers_help")}</p>
            <div className="space-y-2">
              {options.map((b) => {
                const on = barriers.includes(b);
                return (
                  <label key={b} className={`card flex items-center gap-3 p-4 cursor-pointer transition ${on ? "!border-brand bg-brand-soft" : "hover:border-brand"}`}>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--brand)]"
                      checked={on}
                      onChange={() => setIntake({ barriers: on ? barriers.filter((x) => x !== b) : [...barriers, b] })}
                    />
                    <span className="text-lg">{t(b as TKey)}</span>
                  </label>
                );
              })}
            </div>
          </>
        )}
      </fieldset>

      <div className="mt-8 flex gap-3">
        <button className="btn-secondary" onClick={() => (step > 1 ? setStep(step - 1) : router.push("/"))}>← {t("back")}</button>
        {step === 2 ? (
          <button className="btn-primary flex-1 text-lg" onClick={finish}>
            {barriers.length ? t("seeResults") : t("b_none") + " · " + t("seeResults")} →
          </button>
        ) : (
          <button className="btn-primary flex-1" disabled={!intake.town} onClick={() => setStep(2)}>{t("next")} →</button>
        )}
      </div>
    </div>
  );
}
