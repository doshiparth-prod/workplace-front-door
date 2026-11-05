"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

// Desktop: "Prefer to talk to a person?" footer. Mobile: thumb-reach bottom nav with Home · My plan · Call.
export function HelpBar() {
  const { t, lang, saved, rsvps, lastReferralId } = useStore();
  const path = usePathname();
  if (path.startsWith("/staff") || path.startsWith("/how-it-works")) return null;
  const planCount = saved.length + rsvps.length + (lastReferralId ? 1 : 0);
  const item = (href: string, icon: string, label: string, active: boolean, badge?: number) => (
    <Link href={href} className={`flex-1 flex flex-col items-center py-2 text-xs font-semibold ${active ? "text-brand" : "text-muted"}`}>
      <span aria-hidden className="text-xl relative">
        {icon}
        {!!badge && <span className="absolute -top-1 -right-3 chip bg-brand text-white !px-1.5 !text-[10px]">{badge}</span>}
      </span>
      {label}
    </Link>
  );
  if (path.startsWith("/resume")) return null;
  return (
    <>
      <aside className="hidden sm:block border-t border-line bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <span aria-hidden className="text-2xl">☎</span>
          <div className="mr-auto">
            <p className="font-semibold">{t("talkHuman")}</p>
            <p className="text-sm text-muted">{t("hours")}</p>
          </div>
          <a href="tel:+12035550142" className="btn-secondary">{t("callOrText")}</a>
        </div>
      </aside>
      <nav aria-label="Mobile" className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line flex pb-[env(safe-area-inset-bottom)]">
        {item("/", "⌂", "Home", path === "/")}
        {item("/plan", "★", t("planTitle"), path === "/plan", planCount)}
        <a href="tel:+12035550142" className="flex-1 flex flex-col items-center py-2 text-xs font-semibold text-muted">
          <span aria-hidden className="text-xl">☎</span>
          {lang === "es" ? "Llamar" : "Call us"}
        </a>
      </nav>
      <div className="sm:hidden h-16" aria-hidden />
    </>
  );
}
