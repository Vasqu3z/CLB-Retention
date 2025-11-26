import React from "react";
import { getCalculatedBattingLeaders, getCalculatedPitchingLeaders } from "@/lib/sheets";
import LeadersClient from "./LeadersClient";

export default async function LeadersPage() {
  // Fetch both regular season and playoff leaders data
  const [
    regularBattingLeaders,
    regularPitchingLeaders,
    playoffBattingLeaders,
    playoffPitchingLeaders,
  ] = await Promise.all([
    getCalculatedBattingLeaders(false),
    getCalculatedPitchingLeaders(false),
    getCalculatedBattingLeaders(true),
    getCalculatedPitchingLeaders(true),
  ]);

  return (
    <LeadersClient
      regularBattingLeaders={regularBattingLeaders}
      regularPitchingLeaders={regularPitchingLeaders}
      playoffBattingLeaders={playoffBattingLeaders}
      playoffPitchingLeaders={playoffPitchingLeaders}
    />
  );
}
