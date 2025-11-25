import React from "react";
import StatHighlight from "@/components/ui/StatHighlight";
import RetroTable from "@/components/ui/RetroTable";
import { Activity, History } from "lucide-react";

type GameLogEntry = {
  id: number;
  date: string;
  opp: string;
  ab: number;
  h: number;
  hr: number;
  rbi: number;
  pts: number;
};

export default async function PlayerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // In real app, fetch data based on params.slug

  const gameLog: GameLogEntry[] = [
    { id: 1, date: "MAY 12", opp: "BOW", ab: 4, h: 2, hr: 1, rbi: 3, pts: 120 },
    { id: 2, date: "MAY 10", opp: "DKW", ab: 3, h: 1, hr: 0, rbi: 0, pts: 45 },
    { id: 3, date: "MAY 08", opp: "PCH", ab: 5, h: 3, hr: 2, rbi: 5, pts: 210 },
  ];

  const logColumns = [
    { header: "Date", accessorKey: "date" as const, className: "text-white/60" },
    { header: "VS", accessorKey: "opp" as const, className: "text-comets-red font-bold" },
    { header: "AB", accessorKey: "ab" as const },
    { header: "H", accessorKey: "h" as const },
    { header: "HR", accessorKey: "hr" as const, className: "text-comets-yellow" },
    { header: "RBI", accessorKey: "rbi" as const },
    { header: "PTS", accessorKey: "pts" as const, className: "text-comets-cyan font-bold" },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      
      <StatHighlight />

      <div className="container mx-auto max-w-5xl px-4 -mt-12 relative z-20">
        
        <div className="flex gap-8 border-b border-white/10 mb-8">
            <button className="pb-4 text-comets-yellow border-b-2 border-comets-yellow font-ui uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity size={16} /> Recent Performance
            </button>
            <button className="pb-4 text-white/40 hover:text-white font-ui uppercase tracking-widest text-sm flex items-center gap-2 transition-colors">
                <History size={16} /> Season History
            </button>
        </div>

        <div className="space-y-4">
            <h3 className="font-display text-2xl text-white uppercase">Game Log</h3>
            <RetroTable data={gameLog} columns={logColumns} />
        </div>

      </div>
    </main>
  );
}