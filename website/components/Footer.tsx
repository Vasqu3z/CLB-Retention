import { LEAGUE_CONFIG } from "@/config/league";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">
            © {new Date().getFullYear()} {LEAGUE_CONFIG.name}
          </p>
          <p>
            Season {LEAGUE_CONFIG.currentSeason} • Powered by Google Sheets
          </p>
        </div>
      </div>
    </footer>
  );
}
