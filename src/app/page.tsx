"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { NEEDS, needLabel } from "@/lib/needs";
import { understand } from "@/lib/understand";
import { TOWNS } from "@/data/seed";
import type { TKey } from "@/lib/i18n";
import type { NeedId } from "@/lib/types";

export default function Home() {
  const { t, lang, ready, track, setIntake, opportunities } = useStore();
  const router = useRouter();
  const [text, setText] = useState("");
  const [shown, setShown] = useState(false);
  const [need, setNeed] = useState<NeedId>();
  const [town, setTown] = useState<string>();
  const [barriers, setBarriers] = useState<string[]>([]);
  const tracked = useRef(false);

  useEffect(() => {
    if (ready && !tracked.current) {
      tracked.current = true;
      track("visit");
    }
  }, [ready, track]);

  const understood = useMemo(() => understand(text), [text]);
  const interpret = (value = text) => {
    const u = understand(value);
    setNeed(u.need);
    setTown(u.town);
    setBarriers(u.barriers);
    setShown(true);
  };

  const go = () => {
    const n = need ?? "career";
    track("need_selected", { need: n });
    setIntake({ need: n, town, barriers, freeText: text, eligibility: undefined, focusOppId: undefined });
    if (n === "employer") return router.push("/employer");
    if (town) {
      track("intake_completed", { need: n, town });
      router.push("/results");
    } else router.push(`/start/${n}`);
  };

  const upcoming = opportunities
    .filter((o) => o.published && o.type === "event" && o.date)
    .sort((a, b) => a.date!.localeCompare(b.date!))
    .slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero + "own words" intake */}
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark text-white p-6 sm:p-10 shadow-lg">
        {/* What this is → who it's for → the ask. */}
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">🏛 {t("eyebrow")}</p>
        <h1 className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-tight font-bold tracking-tight max-w-3xl">{t("heroTitle")}</h1>
        <p className="mt-3 text-lg text-white/90 max-w-2xl">{t("heroSub")}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Promises">
          {(["trustFree", "trustPrivate", "trustNoAccount", "trustLang"] as TKey[]).map((k) => (
            <li key={k} className="rounded-full bg-white/15 px-3 py-1">✓ {t(k)}</li>
          ))}
        </ul>

        <form
          className="mt-6 rounded-2xl bg-surface text-foreground p-4 sm:p-5 shadow"
          onSubmit={(e) => {
            e.preventDefault();
            if (shown) go();
            else interpret();
          }}
        >
          <label htmlFor="own" className="block">
            <span className="block text-2xl font-bold">{t("homeTitle")}</span>
            <span className="block text-muted">💬 {t("ownWordsLabel")}</span>
          </label>
          <textarea
            id="own"
            rows={2}
            className="input mt-2 text-lg resize-none"
            placeholder={t("ownWordsPlaceholder")}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setShown(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                interpret();
              }
            }}
          />
          {!shown && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">{t("tryExamples")}</span>
              {(["ex1", "ex2", "ex3"] as TKey[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  className="chip !text-sm !px-3 !py-1.5 bg-brand-soft text-brand-dark hover:bg-brand hover:text-white text-left"
                  onClick={() => {
                    setText(t(k));
                    interpret(t(k));
                  }}
                >
                  “{t(k)}”
                </button>
              ))}
            </div>
          )}

          {shown && (
            <div className="mt-4 rise" aria-live="polite">
              {understood.need || understood.town || understood.barriers.length ? (
                <>
                  <p className="font-bold">✨ {t("understoodTitle")}</p>
                  <p className="text-sm text-muted">{t("understoodEdit")}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="text-sm font-semibold">
                      {lang === "es" ? "Necesita" : "You need"}
                      <select className="input !py-2 mt-1" value={need ?? ""} onChange={(e) => setNeed(e.target.value as NeedId)}>
                        <option value="" disabled>—</option>
                        {NEEDS.map((n) => <option key={n.id} value={n.id}>{t(needLabel[n.id])}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-semibold">
                      {lang === "es" ? "Ciudad" : "Town"}
                      <select className="input !py-2 mt-1" value={town ?? ""} onChange={(e) => setTown(e.target.value)}>
                        <option value="">{lang === "es" ? "Preguntar después" : "Ask me next"}</option>
                        {TOWNS.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </label>
                    <div className="text-sm font-semibold">
                      {lang === "es" ? "Tener en cuenta" : "Plan around"}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {barriers.length === 0 && <span className="text-muted font-normal">—</span>}
                        {barriers.map((b) => (
                          <button type="button" key={b} onClick={() => setBarriers(barriers.filter((x) => x !== b))}
                            className="chip !text-sm !px-2.5 !py-1 bg-brand-soft text-brand-dark" aria-label={`Remove ${t(b as TKey)}`}>
                            {t(b as TKey)} ✕
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="btn-primary w-full mt-4 text-lg" disabled={!need}>{t("showMatches")} →</button>
                </>
              ) : (
                <p className="text-muted">{t("understoodNone")}</p>
              )}
            </div>
          )}
          {!shown && (
            <button className="btn-primary w-full mt-4 text-lg" disabled={!text.trim()}>{t("next")} →</button>
          )}
        </form>
      </section>

      {/* How it works: sets expectations in three beats */}
      <section aria-labelledby="how" className="grid gap-4 md:grid-cols-[1fr_auto] items-center">
        <div>
          <h2 id="how" className="sr-only">{t("howTitle")}</h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {([["how1", "how1d", "💬"], ["how2", "how2d", "🎯"], ["how3", "how3d", "🤝"]] as [TKey, TKey, string][]).map(([a, b, icon], i) => (
              <li key={a} className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full bg-brand text-white font-bold">{i + 1}</span>
                <span>
                  <span className="block font-bold">{icon} {t(a)}</span>
                  <span className="block text-sm text-muted">{t(b)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <ul className="flex md:flex-col gap-x-4 gap-y-1 text-sm font-semibold text-brand-dark md:border-l md:border-line md:pl-5">
          {(["stat1", "stat2", "stat3"] as TKey[]).map((k) => <li key={k}>✓ {t(k)}</li>)}
        </ul>
      </section>

      {/* Need tiles */}
      <section aria-labelledby="pick">
        <h2 id="pick" className="text-xl font-bold mb-3">{t("orPick")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NEEDS.map((n) => (
            <li key={n.id}>
              <Link
                href={n.id === "employer" ? "/employer" : `/start/${n.id}`}
                onClick={() => {
                  track("need_selected", { need: n.id });
                  setIntake({ need: n.id, town: undefined, barriers: [], freeText: undefined, eligibility: undefined, focusOppId: undefined });
                }}
                className="card flex items-center gap-4 p-5 h-full hover:border-brand hover:shadow-md transition group"
              >
                <span aria-hidden className="grid place-items-center h-14 w-14 shrink-0 rounded-2xl bg-brand-soft text-3xl">{n.icon}</span>
                <span>
                  <span className="block text-xl font-bold group-hover:text-brand">{t(n.label)}</span>
                  <span className="block text-muted">{t(n.desc)}</span>
                </span>
                <span aria-hidden className="ml-auto text-2xl text-brand transition group-hover:translate-x-1">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Upcoming events — low-commitment first step */}
      <section aria-labelledby="soon">
        <h2 id="soon" className="text-xl font-bold mb-3">🗓 {t("soon")}</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {upcoming.map((o) => (
            <li key={o.id} className="card p-4">
              <p className="text-sm font-semibold text-brand">
                {new Date(o.date!).toLocaleString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
              <p className="font-bold mt-1">{o.title[lang]}</p>
              <p className="text-sm text-muted">📍 {o.town}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
