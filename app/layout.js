import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./CartContext";
import Nav from "./Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Masala Lane",
  description: "Order food from Masala Lane",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <CartProvider>
          <Nav />
          <main className="mx-auto w-full max-w-md flex-1 p-4">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
