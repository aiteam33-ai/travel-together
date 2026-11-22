import type { Metadata } from "next";
import { Suspense } from "react";
import { Hind, Geist_Mono } from "next/font/google";
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

const hind = Hind({ variable: "--font-hind", subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BRAND.name} — Tours, Treks & Pilgrimages`,
  description: BRAND.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hind.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LocaleProvider>
          <AuthProvider>
            <CompareProvider>
              <ToastProvider>
                <WishlistProvider>
                  <SocialsProvider>
                    <FloatingStackProvider>
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
