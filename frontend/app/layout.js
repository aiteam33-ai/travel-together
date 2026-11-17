import "./globals.css";
import { AppStateProvider } from "../lib/AppStateContext";

export const metadata = {
  title: "AstroGuide",
  description: "Private, consistent astrology answers to the questions you can't ask anyone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-black">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
