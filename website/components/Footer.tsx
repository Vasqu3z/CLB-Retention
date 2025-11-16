import { LEAGUE_CONFIG } from "@/config/league";

export default function Footer() {
  return (
    <footer className="bg-space-navy/60 border-t border-cosmic-border mt-12 transition-colors duration-300 hover:bg-space-navy/80">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-star-gray text-sm font-mono space-y-3">
          <p className="transition-colors duration-300 hover:text-star-white">
            <span className="text-nebula-orange">©</span> {new Date().getFullYear()} {LEAGUE_CONFIG.name}
          </p>
          <p className="transition-colors duration-300 hover:text-star-white">
            Season <span className="text-comet-yellow font-semibold">{LEAGUE_CONFIG.currentSeason}</span>
            <span className="mx-2">•</span>
            Powered by <span className="text-solar-gold">Google Sheets</span>
          </p>
          <p className="text-xs text-star-gray/60 transition-colors duration-300 hover:text-star-gray">
            Built with Next.js 15 & React Server Components
          </p>
        </div>
      </div>
    </footer>
  );
}
