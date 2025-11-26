import { getAllPlayers } from "@/lib/sheets";
import { PLAYER_STATS_SHEET } from "@/config/sheets";

export default async function DebugStatsPage() {
  const players = await getAllPlayers(false);

  // Get first player for debugging
  const samplePlayer = players[0];

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Stats Debug Page</h1>

        <div className="bg-surface-dark p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-comets-cyan mb-4">Column Index Reference</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
            <div className="text-white/60">
              <div className="font-bold text-comets-yellow">BASIC INFO</div>
              <div>0 (A): NAME</div>
              <div>1 (B): TEAM</div>
              <div>2 (C): GP</div>
            </div>
            <div className="text-white/60">
              <div className="font-bold text-comets-yellow">HITTING</div>
              <div>3 (D): AB</div>
              <div>4 (E): H</div>
              <div>5 (F): HR</div>
              <div>6 (G): RBI</div>
              <div>7 (H): BB</div>
              <div>8 (I): K</div>
              <div>9 (J): ROB</div>
              <div>10 (K): DP</div>
              <div>11 (L): TB</div>
            </div>
            <div className="text-white/60">
              <div className="font-bold text-comets-yellow">W/L/S</div>
              <div>12 (M): W</div>
              <div>13 (N): L</div>
              <div>14 (O): SV</div>
              <div className="font-bold text-comets-yellow mt-2">PITCHING</div>
              <div>15 (P): IP</div>
              <div>16 (Q): BF</div>
              <div>17 (R): H_ALLOWED</div>
              <div>18 (S): HR_ALLOWED</div>
              <div>19 (T): R</div>
              <div>20 (U): BB_ALLOWED</div>
              <div>21 (V): K_PITCHED</div>
            </div>
            <div className="text-white/60">
              <div className="font-bold text-comets-yellow">FIELDING</div>
              <div>22 (W): NP</div>
              <div>23 (X): E</div>
              <div>24 (Y): SB</div>
              <div>25 (Z): CS</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark p-6 rounded-lg">
          <h2 className="text-xl font-bold text-comets-cyan mb-4">Sample Player Data</h2>
          {samplePlayer && (
            <div className="space-y-4">
              <div className="text-white">
                <div className="font-bold text-comets-yellow text-lg mb-2">{samplePlayer.name} ({samplePlayer.team})</div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="font-bold text-comets-cyan mb-2">Basic Info</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>GP: <span className="text-white/60">{samplePlayer.gp}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-comets-cyan mb-2">Hitting Stats</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>AB: <span className="text-white/60">{samplePlayer.ab}</span></div>
                      <div>H: <span className="text-white/60">{samplePlayer.h}</span></div>
                      <div>HR: <span className="text-white/60">{samplePlayer.hr}</span></div>
                      <div>RBI: <span className="text-white/60">{samplePlayer.rbi}</span></div>
                      <div>DP: <span className="text-white/60">{samplePlayer.dp}</span></div>
                      <div>ROB: <span className="text-white/60">{samplePlayer.rob}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-comets-cyan mb-2">Calculated Stats</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>AVG: <span className="text-white/60">{samplePlayer.avg}</span></div>
                      <div>OBP: <span className="text-white/60">{samplePlayer.obp}</span></div>
                      <div>SLG: <span className="text-white/60">{samplePlayer.slg}</span></div>
                      <div>OPS: <span className="text-white/60">{samplePlayer.ops}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-comets-cyan mb-2">Pitching Stats</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>IP: <span className="text-white/60">{samplePlayer.ip}</span></div>
                      <div>W: <span className="text-white/60">{samplePlayer.w}</span></div>
                      <div>L: <span className="text-white/60">{samplePlayer.l}</span></div>
                      <div>SV: <span className="text-white/60">{samplePlayer.sv}</span></div>
                      <div>H Allowed: <span className="text-white/60">{samplePlayer.hAllowed}</span></div>
                      <div>HR Allowed: <span className="text-white/60">{samplePlayer.hrAllowed}</span></div>
                      <div>ERA: <span className="text-white/60">{samplePlayer.era}</span></div>
                      <div>WHIP: <span className="text-white/60">{samplePlayer.whip}</span></div>
                      <div>BAA: <span className="text-white/60">{samplePlayer.baa}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-comets-cyan mb-2">Fielding Stats</div>
                    <div className="font-mono text-sm space-y-1">
                      <div>NP: <span className="text-white/60">{samplePlayer.np}</span></div>
                      <div>E: <span className="text-white/60">{samplePlayer.e}</span></div>
                      <div>SB: <span className="text-white/60">{samplePlayer.sb}</span></div>
                      <div>CS: <span className="text-white/60">{samplePlayer.cs}</span></div>
                      <div>OAA: <span className="text-white/60">{samplePlayer.oaa}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-black/30 rounded border border-comets-yellow/30">
                  <div className="text-comets-yellow font-bold mb-2">🔍 Check These Values Against Your Spreadsheet:</div>
                  <div className="text-sm text-white/80">
                    Open your Google Sheet for "{samplePlayer.name}" and verify:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Does H ({samplePlayer.h}) match column E in the spreadsheet?</li>
                      <li>Does HR ({samplePlayer.hr}) match column F in the spreadsheet?</li>
                      <li>Does AB ({samplePlayer.ab}) match column D in the spreadsheet?</li>
                      <li>If these don't match, the column indices in config/sheets.ts are incorrect</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-surface-dark p-6 rounded-lg">
          <h2 className="text-xl font-bold text-comets-cyan mb-4">All Players Quick View</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-comets-yellow border-b border-white/10">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2">AB</th>
                  <th className="p-2">H</th>
                  <th className="p-2">HR</th>
                  <th className="p-2">RBI</th>
                  <th className="p-2">AVG</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {players.slice(0, 10).map((player, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="p-2">{player.name}</td>
                    <td className="p-2">{player.team}</td>
                    <td className="p-2 text-center">{player.ab}</td>
                    <td className="p-2 text-center">{player.h}</td>
                    <td className="p-2 text-center">{player.hr}</td>
                    <td className="p-2 text-center">{player.rbi}</td>
                    <td className="p-2 text-center">{player.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
