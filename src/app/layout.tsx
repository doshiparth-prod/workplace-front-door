import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { HelpBar } from "@/components/HelpBar";

const inter = Inter({ variable: "--font-sans-app", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Front Door · Workforce prototype",
  description:
    "Prototype digital workforce front door for Southwestern Connecticut, prepared in response to The WorkPlace RFP. Sample data.",
  manifest: "/manifest.json",
  robots: { index: false, follow: false }, // prototype: keep out of search so it isn't mistaken for the official site
  appleWebApp: { capable: true, title: "Front Door" },
};

export const viewport: Viewport = { themeColor: "#a3123a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 btn-primary">
            Skip to content
          </a>
          <Suspense>
            <Header />
          </Suspense>
          <main id="main" className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
            <Suspense>{children}</Suspense>
          </main>
          <Suspense>
            <HelpBar />
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
