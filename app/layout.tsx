import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";
import { AuthProvider } from "./components/auth/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContactWidgets from "./components/ContactWidgets";
import { CompareProvider } from "./components/CompareContext";
import CompareBar from "./components/CompareBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const headingFont = Baloo_2({ variable: "--font-heading-rounded", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: `${BRAND.name} — Tours, Treks & Pilgrimages`,
  description: BRAND.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LocaleProvider>
          <AuthProvider>
            <CompareProvider>
              <Header />
              <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
                {children}
              </main>
              <Footer />
              <ContactWidgets />
              <CompareBar />
            </CompareProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
