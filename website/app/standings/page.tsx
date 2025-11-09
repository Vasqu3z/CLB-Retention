import { getStandings } from "@/lib/sheets";
import Link from "next/link";
import { getTeamByName } from "@/config/league";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function StandingsPage() {
  const standings = await getStandings();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">League Standings</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Team
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  W
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  L
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Win %
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  RS
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  RA
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Diff
                </th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => {
                const teamConfig = getTeamByName(team.team);
                return (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {team.rank}
                    </td>
                    <td className="px-4 py-3">
                      {teamConfig ? (
                        <Link
                          href={`/teams/${teamConfig.slug}`}
                          className="text-primary hover:underline font-semibold"
                          style={{ color: teamConfig.primaryColor }}
                        >
                          {team.team}
                        </Link>
                      ) : (
                        <span className="font-semibold">{team.team}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {team.wins}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {team.losses}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 font-medium">
                      {team.winPct}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {team.runsScored}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {team.runsAllowed}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-medium ${
                        team.runDiff > 0
                          ? "text-success"
                          : team.runDiff < 0
                          ? "text-danger"
                          : "text-gray-900"
                      }`}
                    >
                      {team.runDiff > 0 ? "+" : ""}
                      {team.runDiff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>W</strong> = Wins • <strong>L</strong> = Losses •{" "}
          <strong>Win %</strong> = Winning Percentage
        </p>
        <p>
          <strong>RS</strong> = Runs Scored • <strong>RA</strong> = Runs
          Allowed • <strong>Diff</strong> = Run Differential
        </p>
      </div>
    </div>
  );
}
