import Link from "next/link";
import { LEAGUE_CONFIG } from "@/config/league";

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{LEAGUE_CONFIG.shortName}</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link
              href="/standings"
              className="hover:text-gray-200 transition"
            >
              Standings
            </Link>
            <Link
              href="/leaders"
              className="hover:text-gray-200 transition"
            >
              Leaders
            </Link>
            <Link
              href="/schedule"
              className="hover:text-gray-200 transition"
            >
              Schedule
            </Link>
            <Link
              href="/playoffs"
              className="hover:text-gray-200 transition"
            >
              Playoffs
            </Link>
            <Link
              href="/teams"
              className="hover:text-gray-200 transition"
            >
              Teams
            </Link>
          </nav>

          {/* Mobile menu button - TODO: Add mobile menu */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
