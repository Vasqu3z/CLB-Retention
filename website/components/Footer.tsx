import { LEAGUE_CONFIG } from "@/config/league";

export default function Footer() {
  return (
    <footer className="bg-space-navy/60 border-t border-cosmic-border mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-star-gray text-sm font-mono">
          <p className="mb-2">
            <span className="text-nebula-orange">©</span> {new Date().getFullYear()} {LEAGUE_CONFIG.name}
          </p>
          <p>
            Season <span className="text-comet-yellow font-semibold">{LEAGUE_CONFIG.currentSeason}</span> • Powered by Google Sheets
          </p>
        </div>
      </div>
    </footer>
  );
}
