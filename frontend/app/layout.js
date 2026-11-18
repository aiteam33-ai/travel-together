import { Cormorant_Garamond, Inter, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "../lib/AppStateContext";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});
const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});
const headingHi = Noto_Serif_Devanagari({
  variable: "--font-heading-hi",
  subsets: ["devanagari"],
  weight: ["600", "700"],
});
const bodyHi = Noto_Sans_Devanagari({
  variable: "--font-body-hi",
  subsets: ["devanagari"],
});

export const metadata = {
  title: "AstroGuide",
  description: "Private, consistent astrology answers to the questions you can't ask anyone.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = {
  themeColor: "#11122b",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full ${heading.variable} ${body.variable} ${headingHi.variable} ${bodyHi.variable}`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <div className="starfield" aria-hidden="true" />
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
