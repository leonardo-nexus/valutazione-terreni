import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { getLang, getDict } from "@/lib/i18n";
import LanguageSwitch from "@/app/LanguageSwitch";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const brand = Cormorant_Garamond({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLang());
  return { title: `Proenesys · ${t.nav.app}`, description: "Proenesys · due diligence" };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const lang = await getLang();
  const t = getDict(lang);
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${brand.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="app-chrome sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(10,10,11,0.8)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/proenesys.png" alt="Proenesys" width={34} height={37} priority />
              <span className="brand-font text-xl font-semibold tracking-wide text-[var(--gold)]">
                PRO<span className="text-[var(--muted)]">|</span>ENESYS
              </span>
            </Link>
            <span className="ml-2 hidden text-sm text-[var(--muted)] sm:inline">
              · {t.nav.app}
            </span>
            <div className="ml-auto flex items-center gap-4 text-sm">
              {user && (
                <nav className="flex items-center gap-4">
                  <Link href="/valutazioni" className="text-[var(--muted)] hover:text-[var(--gold)]">{t.nav.valutazioni}</Link>
                  <Link href="/valuta" className="text-[var(--muted)] hover:text-[var(--gold)]">{t.nav.nuova}</Link>
                  <form action={logout}>
                    <button className="text-[var(--muted)] hover:text-[var(--gold)]">{t.nav.esci}</button>
                  </form>
                </nav>
              )}
              <LanguageSwitch current={lang} />
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="app-chrome border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
          {t.footer}
        </footer>
      </body>
    </html>
  );
}
