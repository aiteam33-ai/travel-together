import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { Hind, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { AuthProvider } from "./components/auth/AuthContext";
import { CompareProvider } from "./components/CompareContext";
import { ToastProvider } from "./components/ToastContext";
import { WishlistProvider } from "./components/WishlistContext";
import { SocialsProvider } from "./components/SocialsContext";
import Header from "./components/nav/Header";
import Footer from "./components/Footer";
import BottomTabBar from "./components/nav/BottomTabBar";
import HelpButton from "./components/floating/HelpButton";
import CompareTray from "./components/floating/CompareTray";
import BackToTop from "./components/floating/BackToTop";
import TopLoadingBar from "./components/nav/TopLoadingBar";
import PageTransition from "./components/PageTransition";
import { FloatingStackProvider } from "./components/floating/FloatingStackContext";
import LenisProvider from "./components/motion/LenisProvider";

const hind = Hind({ variable: "--font-hind", subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Bold display font for headings (Phase 2 visual identity) — falls back to
// Hind glyph-by-glyph for any Devanagari text, since Bricolage Grotesque has
// no Hindi character set.
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["600", "700", "800"] });

// Applies the user's saved theme before paint (no flash of the wrong theme).
// Defaults to light — dark mode is opt-in via the toggle, not automatic from
// the OS preference, per the site's "parents/senior travellers too" audience.
const NO_FLASH_THEME_SCRIPT = `
(function() {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: `${BRAND.name} — Tours, Treks & Pilgrimages`,
  description: BRAND.tagline,
};

// Full-screen, chromeless routes (their own onboarding/landing experience,
// not the normal site shell) list their path prefixes here. The pathname
// comes from middleware.ts, which is the only way a Server Component layout
// can know the current path (there's no server-side usePathname).
const CHROMELESS_PREFIXES = ["/welcome"];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const chromeless = CHROMELESS_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <html lang="en" className={`${hind.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LocaleProvider>
          <AuthProvider>
            <CompareProvider>
              <ToastProvider>
                <WishlistProvider>
                  <SocialsProvider>
                    <FloatingStackProvider>
                      <LenisProvider />
                      {chromeless ? (
                        children
                      ) : (
                        <>
                          <TopLoadingBar />
                          <Suspense fallback={null}>
                            <Header />
                          </Suspense>
                          <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 pb-24 md:pb-8">
                            <PageTransition>{children}</PageTransition>
                          </main>
                          <Footer />
                          <HelpButton />
                          <CompareTray />
                          <BackToTop />
                          <BottomTabBar />
                        </>
                      )}
                    </FloatingStackProvider>
                  </SocialsProvider>
                </WishlistProvider>
              </ToastProvider>
            </CompareProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
