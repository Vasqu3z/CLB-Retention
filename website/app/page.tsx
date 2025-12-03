import { getLeagueBranding } from "@/lib/sheets";
import HomeView from "./HomeView";

export const revalidate = 60;

export default async function Home() {
  const leagueBranding = await getLeagueBranding();

  return <HomeView leagueBranding={leagueBranding} />;
}
