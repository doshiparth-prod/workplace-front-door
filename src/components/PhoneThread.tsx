"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

/**
 * Simulated two-way SMS thread. In production this is backed by an SMS provider
 * (inbound webhook + outbound API) with consent records; here it reads/writes the shared demo store.
 * side="resident" renders like a phone; side="staff" renders like a counselor inbox.
 */
export function PhoneThread({ referralId, side }: { referralId: string; side: "resident" | "staff" }) {
  const { t, messages, addMessage, referrals } = useStore();
  const [draft, setDraft] = useState("");
  const thread = messages.filter((m) => m.referralId === referralId).sort((a, b) => a.sentAt.localeCompare(b.sentAt));
  const ref = referrals.find((r) => r.id === referralId);
  const optedIn = !!ref?.smsConsent.optedIn;
  const mine = (dir: "in" | "out") => (side === "resident" ? dir === "in" : dir === "out");

  const send = (body: string) => {
    if (!body.trim()) return;
    addMessage({ referralId, direction: side === "resident" ? "in" : "out", body: body.trim() });
    setDraft("");
  };

  return (
    <div className={side === "resident" ? "mx-auto w-full max-w-sm rounded-[2rem] border-8 border-foreground bg-surface shadow-lg overflow-hidden" : "card overflow-hidden"}>
      <div className={`px-4 py-3 text-center text-sm font-semibold ${side === "resident" ? "bg-foreground text-white" : "bg-brand-soft"}`}>
        {side === "resident" ? "The WorkPlace · (203) 555-0142" : `SMS · ${ref?.phone ?? "no phone"} · ${optedIn ? "✅ opted in" : "⛔ not opted in / opted out"}`}
      </div>
      <ol className="p-3 space-y-2 min-h-40 max-h-80 overflow-y-auto bg-background" aria-live="polite">
        {thread.length === 0 && <li className="text-center text-sm text-muted py-6">No messages yet</li>}
        {thread.map((m) => (
          <li key={m.id} className={`flex ${mine(m.direction) ? "justify-end" : "justify-start"}`}>
            <span className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine(m.direction) ? "bg-brand text-white rounded-br-sm" : "bg-surface border border-line rounded-bl-sm"}`}>
              {m.body}
              <span className={`block text-[10px] mt-1 ${mine(m.direction) ? "text-white/70" : "text-muted"}`}>
                {new Date(m.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <form className="flex gap-2 p-2 border-t border-line" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
        <label className="sr-only" htmlFor={`reply-${side}-${referralId}`}>{t("replyPlaceholder")}</label>
        <input
          id={`reply-${side}-${referralId}`}
          className="input !py-2"
          placeholder={side === "staff" && !optedIn ? "Resident has not opted in to texts" : t("replyPlaceholder")}
          value={draft}
          disabled={side === "staff" && !optedIn}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn-primary !py-2 !min-h-10" disabled={side === "staff" && !optedIn}>{t("send")}</button>
      </form>
    </div>
  );
}
