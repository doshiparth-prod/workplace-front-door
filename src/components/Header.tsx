"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

const ROLES = [
  { id: "resident", label: "Resident", href: "/" },
  { id: "counselor", label: "Counselor", href: "/staff" },
  { id: "content", label: "Content staff", href: "/staff/content" },
  { id: "leadership", label: "Leadership", href: "/staff/insights" },
];

export function Header() {
  const { t, lang, setLang, saved, rsvps, lastReferralId, reset } = useStore();
  const path = usePathname();
  const router = useRouter();
  const isStaff = path.startsWith("/staff");
  const current =
    path === "/staff/content" ? "content" : path === "/staff/insights" ? "leadership" : isStaff ? "counselor" : "resident";
  const planCount = saved.length + rsvps.length + (lastReferralId ? 1 : 0);

  return (
    <header className="bg-surface border-b border-line sticky top-0 z-30 print:hidden">
      {/* Evaluator bar: persona switcher + disclaimer. Not part of the resident product. */}
      <div className="bg-foreground text-white text-xs sm:text-sm">
        <div className="max-w-5xl mx-auto px-4 py-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold tracking-wide text-[#ffb4c4]">PROTOTYPE</span>
          <span className="hidden md:inline opacity-90">{t("demoBanner")}</span>
          <label className="flex items-center gap-2 ml-auto">
            <span className="opacity-90">{t("viewAs")}</span>
            <select
              aria-label="View as persona"
              className="rounded-md bg-white/10 border border-white/30 px-2 py-0.5 text-white"
              value={current}
              onChange={(e) => router.push(ROLES.find((r) => r.id === e.target.value)!.href)}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id} className="text-black">{r.label}</option>
              ))}
            </select>
          </label>
          <Link href="/how-it-works" className="underline underline-offset-2 hover:text-[#ffb4c4]">{t("howItWorks")}</Link>
          <button onClick={() => { reset(); router.push("/"); }} className="underline underline-offset-2 hover:text-[#ffb4c4]">Reset</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Link href={isStaff ? "/staff" : "/"} className="flex items-center gap-3 mr-auto min-w-0" aria-label="The WorkPlace Front Door home">
          <Image src="/brand/workplace-logo.png" alt="The WorkPlace" width={150} height={50} priority className="h-10 w-auto sm:h-12" />
          <span className="hidden sm:block border-l border-line pl-3 leading-tight">
            <span className="block font-bold">{isStaff ? "Staff Console" : t("appName")}</span>
            <span className="block text-xs text-muted">{isStaff ? "Front Door" : t("appTagline")}</span>
          </span>
        </Link>

        {!isStaff ? (
          <nav className="flex items-center gap-2" aria-label="Main">
            <Link href="/plan" className={`btn-ghost !px-3 !py-2 !min-h-10 hidden sm:inline-flex ${path === "/plan" ? "bg-brand-soft" : ""}`}>
              {t("planTitle")}
              {planCount > 0 && <span className="chip bg-brand text-white">{planCount}</span>}
            </Link>
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="btn-secondary !px-3 !py-2 !min-h-10"
              lang={lang === "en" ? "es" : "en"}
              aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
            >
              🌐 {t("language")}
            </button>
          </nav>
        ) : (
          <nav className="flex gap-1 text-sm" aria-label="Staff">
            {[["/staff", "Queue"], ["/staff/content", "Content"], ["/staff/insights", "Insights"]].map(([h, l]) => (
              <Link key={h} className={`btn-ghost !min-h-10 !py-2 !px-3 ${path === h ? "bg-brand-soft" : ""}`} href={h}>{l}</Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
