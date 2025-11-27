"use client";

import React from "react";
import { Users } from "lucide-react";
import RetroTooltip from "./RetroTooltip";

/**
 * H2HTooltip - Head-to-Head record tooltip
 *
 * Diegetic design: HUD-style popup showing team matchup records
 * Appears on hover to show head-to-head record details and tiebreaker info
 */

interface H2HTooltipProps {
  /** The head-to-head record text (e.g., "3-2 vs Monsters, 2-1 vs Knights") */
  record: string;
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Optional team color for accent */
  teamColor?: string;
}

export default function H2HTooltip({ record, children, teamColor = "#F4D03F" }: H2HTooltipProps) {
  // Don't show tooltip if there's no record
  if (!record || record.trim() === "") {
    return <>{children}</>;
  }

  return (
    <RetroTooltip
      title="Head-to-Head"
      content={record}
      accentColor={teamColor}
    >
      <div className="inline-flex items-center gap-1 cursor-help">
        {children}
        <Users size={12} className="text-white/20" />
      </div>
    </RetroTooltip>
  );
}
