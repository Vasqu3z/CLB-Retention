import React from "react";
import {
  getCalculatedBattingLeaders,
  getCalculatedPitchingLeaders,
  getCalculatedFieldingLeaders,
} from "@/lib/sheets";
import LeadersClient from "./LeadersClient";

export default async function LeadersPage() {
  // Fetch regular season and playoff leaders for all categories
  const [
    regularBattingLeaders,
    regularPitchingLeaders,
    regularFieldingLeaders,
    playoffBattingLeaders,
    playoffPitchingLeaders,
    playoffFieldingLeaders,
  ] = await Promise.all([
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getCalculatedFieldingLeaders(false),
    getCalculatedBattingLeaders(true),
    getCalculatedPitchingLeaders(true),
    getCalculatedFieldingLeaders(true),
  ]);

  return (
    <LeadersClient
      regularBattingLeaders={regularBattingLeaders}
      regularPitchingLeaders={regularPitchingLeaders}
      regularFieldingLeaders={regularFieldingLeaders}
      playoffBattingLeaders={playoffBattingLeaders}
      playoffPitchingLeaders={playoffPitchingLeaders}
      playoffFieldingLeaders={playoffFieldingLeaders}
    />
  );
}

export const metadata = {
  title: "League Leaders - Comets League Baseball",
  description: "Top players in batting, pitching, and fielding statistics",
};
