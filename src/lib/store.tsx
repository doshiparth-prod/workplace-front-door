"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { OPPORTUNITIES, SEED_MESSAGES, SEED_REFERRALS } from "@/data/seed";
import { dict, type TKey } from "./i18n";
import type { AnalyticsEvent, AnalyticsName, Intake, Lang, Message, Opportunity, Referral } from "./types";

interface State {
  lang: Lang;
  largeText: boolean;
  opportunities: Opportunity[];
  referrals: Referral[];
  messages: Message[];
  saved: string[];
  rsvps: string[];
  events: AnalyticsEvent[];
  intake: Partial<Intake>;
  lastReferralId?: string;
}

const KEY = "wp-front-door-demo-v3";

const initial = (): State => ({
  lang: "en",
  largeText: false,
  opportunities: OPPORTUNITIES,
  referrals: SEED_REFERRALS,
  messages: SEED_MESSAGES,
  saved: [],
  rsvps: [],
  events: [],
  intake: {},
});

interface Ctx extends State {
  ready: boolean;
  t: (k: TKey) => string;
  setLang: (l: Lang) => void;
  toggleLargeText: () => void;
  setIntake: (p: Partial<Intake>) => void;
  track: (name: AnalyticsName, extra?: Partial<AnalyticsEvent>) => void;
  toggleSaved: (id: string) => void;
  toggleRsvp: (id: string) => void;
  addReferral: (r: Referral) => void;
  updateReferral: (id: string, patch: Partial<Referral>) => void;
  addMessage: (m: Omit<Message, "id" | "sentAt">) => void;
  addOpportunity: (o: Opportunity) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  // Load from browser storage (shared across all "View as" personas in this browser).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial(), ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
    document.documentElement.lang = state.lang;
  }, [state, ready]);

  // Keep tabs in sync (e.g., resident on one tab, counselor on another).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState({ ...initial(), ...JSON.parse(e.newValue) });
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const t = useCallback((k: TKey) => dict[state.lang][k] ?? dict.en[k] ?? k, [state.lang]);

  const api = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      t,
      setLang: (lang) => setState((s) => ({ ...s, lang })),
      toggleLargeText: () => setState((s) => ({ ...s, largeText: !s.largeText })),
      setIntake: (p) => setState((s) => ({ ...s, intake: { ...s.intake, ...p } })),
      track: (name, extra) =>
        setState((s) => ({ ...s, events: [...s.events, { name, at: new Date().toISOString(), lang: s.lang, ...extra }] })),
      toggleSaved: (id) =>
        setState((s) => {
          const has = s.saved.includes(id);
          return {
            ...s,
            saved: has ? s.saved.filter((x) => x !== id) : [...s.saved, id],
            events: has ? s.events : [...s.events, { name: "saved_item", at: new Date().toISOString(), lang: s.lang }],
          };
        }),
      toggleRsvp: (id) =>
        setState((s) => ({ ...s, rsvps: s.rsvps.includes(id) ? s.rsvps.filter((x) => x !== id) : [...s.rsvps, id] })),
      addReferral: (r) => setState((s) => ({ ...s, referrals: [r, ...s.referrals], lastReferralId: r.id })),
      updateReferral: (id, patch) =>
        setState((s) => ({ ...s, referrals: s.referrals.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      addMessage: (m) =>
        setState((s) => {
          const msg: Message = { ...m, id: uid("m"), sentAt: new Date().toISOString() };
          let referrals = s.referrals;
          let events = s.events;
          // Inbound STOP = opt-out (TCPA / carrier requirement).
          if (m.direction === "in" && /^\s*(stop|alto|parar)\s*$/i.test(m.body)) {
            referrals = referrals.map((r) =>
              r.id === m.referralId ? { ...r, smsConsent: { ...r.smsConsent, optedIn: false, optedOutAt: msg.sentAt } } : r,
            );
            events = [...events, { name: "sms_opt_out", at: msg.sentAt }];
            const confirm: Message = {
              id: uid("m"),
              referralId: m.referralId,
              direction: "out",
              body: "You're unsubscribed from The WorkPlace texts. No more messages will be sent. Reply START to resubscribe.",
              sentAt: msg.sentAt,
            };
            return { ...s, referrals, events, messages: [...s.messages, msg, confirm] };
          }
          return { ...s, messages: [...s.messages, msg] };
        }),
      addOpportunity: (o) => setState((s) => ({ ...s, opportunities: [o, ...s.opportunities] })),
      updateOpportunity: (id, patch) =>
        setState((s) => ({ ...s, opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      reset: () => {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        setState(initial());
      },
    }),
    [state, ready, t],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
