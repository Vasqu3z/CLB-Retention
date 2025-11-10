import Link from 'next/link';
import { getActiveTeams } from '@/config/league';

export default function TeamsPage() {
  const teams = getActiveTeams();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Teams</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link
            key={team.slug}
            href={`/teams/${team.slug}`}
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition"
            style={{ borderLeft: `4px solid ${team.primaryColor}` }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: team.primaryColor }}
            >
              {team.name}
            </h2>
            <p className="text-gray-600">{team.mascot}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
