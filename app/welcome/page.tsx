import type { Metadata } from "next";
import { getTourCounts } from "@/lib/data/tours";
import WelcomeExperience from "./WelcomeExperience";

export const metadata: Metadata = {
  title: "Welcome | Parikrama Holidays",
  description: "Travel, together — tell us who's travelling and where from, and we'll show you the right tours.",
};

export default async function WelcomePage() {
  const { tourCount, departureCount, travellersServed } = await getTourCounts();
  return <WelcomeExperience tourCount={tourCount} departureCount={departureCount} travellersServed={travellersServed} />;
}
