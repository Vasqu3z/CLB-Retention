'use client';

import { BracketRound } from "@/lib/sheets";
import Link from "next/link";

interface BracketViewProps {
  bracket: BracketRound[];
}

export default function BracketView({ bracket }: BracketViewProps) {
  if (bracket.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
        <p className="text-lg">No playoff games scheduled yet.</p>
        <p className="mt-2">Check back when the playoffs begin!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {bracket.map((round, roundIdx) => (
        <div key={roundIdx} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Round Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{round.name}</h2>
          </div>

          {/* Series Cards */}
          <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {round.series.map((series, seriesIdx) => (
              <div
                key={seriesIdx}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors"
              >
                {/* Series Header */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      Series {series.seriesId}
                    </span>
                    {series.winner && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        COMPLETE
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Matchup */}
                <div className="p-4 space-y-3">
                  {/* Team A */}
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      series.winner === series.teamA
                        ? 'bg-green-50 border-2 border-green-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-semibold ${
                      series.winner === series.teamA ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {series.teamA}
                    </span>
                    <span className={`text-xl font-bold ${
                      series.winner === series.teamA ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {series.winsA}
                    </span>
                  </div>

                  {/* Team B */}
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      series.winner === series.teamB
                        ? 'bg-green-50 border-2 border-green-400'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-semibold ${
                      series.winner === series.teamB ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {series.teamB}
                    </span>
                    <span className={`text-xl font-bold ${
                      series.winner === series.teamB ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {series.winsB}
                    </span>
                  </div>

                  {/* Games List */}
                  {series.games.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Games
                      </p>
                      <div className="space-y-1">
                        {series.games.map((game, gameIdx) => (
                          <div
                            key={gameIdx}
                            className="text-sm flex justify-between items-center py-1"
                          >
                            <span className="text-gray-600">
                              Game {gameIdx + 1}
                            </span>
                            {game.played ? (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {game.homeTeam} {game.homeScore}, {game.awayTeam} {game.awayScore}
                                </span>
                                {game.boxScoreUrl && (
                                  <a
                                    href={game.boxScoreUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                    title="View Box Score"
                                  >
                                    📊
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {game.awayTeam} @ {game.homeTeam}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-2">How to Read the Bracket</p>
        <ul className="space-y-1">
          <li>• Numbers next to team names show wins in the series</li>
          <li>• Green highlight indicates series winner</li>
          <li>• Click 📊 to view individual game box scores</li>
          <li>• TBD teams will be filled in as previous rounds complete</li>
        </ul>
      </div>
    </div>
  );
}
