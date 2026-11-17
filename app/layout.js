import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";
import Nav from "./Nav";
import HelpButton from "./HelpButton";
import ScrollProgressBar from "./ScrollProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const headingFont = Baloo_2({
  variable: "--font-heading-rounded",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata = {
  title: "Masala Lane",
  description: "Order food from Masala Lane",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <CartProvider>
          <ScrollProgressBar />
          <Nav />
          <main className="mx-auto w-full max-w-2xl flex-1 p-4">{children}</main>
          <HelpButton />
        </CartProvider>
      </body>
    </html>
  );
}
