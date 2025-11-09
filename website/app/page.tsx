import Link from "next/link";
import { LEAGUE_CONFIG } from "@/config/league";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          {LEAGUE_CONFIG.name}
        </h1>
        <p className="text-xl text-gray-600">
          Official Stats & Standings
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/standings"
          className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-primary"
        >
          <h2 className="text-2xl font-bold mb-2">🏆 Standings</h2>
          <p className="text-gray-600">
            View current league standings and team records
          </p>
        </Link>

        <Link
          href="/leaders"
          className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-success"
        >
          <h2 className="text-2xl font-bold mb-2">📊 League Leaders</h2>
          <p className="text-gray-600">
            Top performers in batting, pitching, and fielding
          </p>
        </Link>

        <Link
          href="/schedule"
          className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-warning"
        >
          <h2 className="text-2xl font-bold mb-2">📅 Schedule</h2>
          <p className="text-gray-600">
            View game schedule and results
          </p>
        </Link>

        <Link
          href="/teams"
          className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition border-l-4 border-secondary"
        >
          <h2 className="text-2xl font-bold mb-2">🧢 Teams</h2>
          <p className="text-gray-600">
            Browse team rosters and statistics
          </p>
        </Link>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Current Season: {LEAGUE_CONFIG.currentSeason}</p>
        <p className="mt-2">
          Data powered by Google Sheets • Built with Next.js
        </p>
      </div>
    </div>
  );
}
