import type { Metadata } from "next";
import WelcomeExperience from "./WelcomeExperience";

export const metadata: Metadata = {
  title: "Parikrama",
  description: "Travel, together.",
};

export default function WelcomePage() {
  return <WelcomeExperience />;
}
