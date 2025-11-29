import { LEAGUE_CONFIG } from "@/config/league";

export default function Footer() {
  return (
    <footer className="bg-surface-dark/80 backdrop-blur-sm border-t border-comets-cyan/20 mt-12 lg:ml-80">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-foreground/50 text-sm font-mono space-y-3">
          <p className="transition-colors duration-300 hover:text-foreground/80">
            <span className="text-comets-cyan">©</span> {new Date().getFullYear()} {LEAGUE_CONFIG.name}
          </p>
          <p className="transition-colors duration-300 hover:text-foreground/80">
            Season <span className="text-comets-yellow font-semibold">{LEAGUE_CONFIG.currentSeason}</span>
            <span className="mx-2 text-comets-purple">•</span>
            Powered by <span className="text-comets-cyan">Google Sheets</span>
          </p>
          <p className="text-xs text-foreground/30 transition-colors duration-300 hover:text-foreground/50">
            Built with Next.js 15 & React Server Components
          </p>
        </div>
      </div>
    </footer>
  );
}
