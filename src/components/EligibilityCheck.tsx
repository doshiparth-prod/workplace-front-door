"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { TKey } from "@/lib/i18n";
import type { Opportunity } from "@/lib/types";

type A = "yes" | "no" | "unsure";
const QS: TKey[] = ["eq1", "eq2", "eq3", "eq4"];

/** Quick WIOA-style pre-screen. Not a determination — always routes to a counselor to confirm. */
export function EligibilityCheck({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const { t, lang, setIntake } = useStore();
  const router = useRouter();
  const [ans, setAns] = useState<A[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const done = ans.length === QS.length;
  const likely = done && ans.every((a) => a === "yes");

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(32rem,92vw)] rounded-2xl p-0 backdrop:bg-black/50" aria-labelledby="elig-title">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mr-auto">
            <h2 id="elig-title" className="text-xl font-bold">{t("eligTitle")}</h2>
            <p className="text-sm text-muted">{opp.title[lang]}</p>
          </div>
          <button className="btn-ghost !min-h-9 !p-2" onClick={() => ref.current?.close()} aria-label={t("close")}>✕</button>
        </div>
        {!done ? (
          <div key={ans.length} className="rise space-y-4">
            <p className="text-sm text-muted">{t("eligSub")} · {ans.length + 1}/{QS.length}</p>
            <p className="text-lg font-semibold">{t(QS[ans.length])}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["yes", "no", "unsure"] as A[]).map((a) => (
                <button key={a} className={a === "yes" ? "btn-primary" : "btn-secondary"} onClick={() => setAns([...ans, a])}>
                  {t(a === "unsure" ? "notSure" : a)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rise space-y-3">
            <p className="text-4xl" aria-hidden>{likely ? "🎉" : "🤝"}</p>
            <p className="text-lg font-bold">{likely ? t("eligYes") : t("eligMaybe")}</p>
            <p className="text-muted">{likely ? t("eligYesSub") : t("eligMaybeSub")}</p>
            <button
              className="btn-primary w-full"
              onClick={() => {
                setIntake({ eligibility: likely ? "likely" : "maybe", focusOppId: opp.id });
                router.push("/book");
              }}
            >
              {t("bookToConfirm")} →
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
