import type { Metadata } from "next";
import { Dela_Gothic_One, Chivo, Barlow, Exo_2, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import SmoothScroll from "@/components/SmoothScroll";
import CosmicBackground from "@/components/CosmicBackground";
import PageTransition from "@/components/animations/PageTransition";

// Neon Void Theme Fonts
// IMPORTANT: Always use font-* classes (font-display, font-heading, font-body, font-ui, font-mono)
// Never hardcode font family names in components - use the CSS variables instead

const delaGothic = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const exo2 = Exo_2({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const chivo = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Comets League Baseball | CLB Stats",
  description: "Official statistics and standings for Comets League Baseball",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${delaGothic.variable} ${exo2.variable} ${chivo.variable} ${barlow.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen flex flex-col font-body">
        <CosmicBackground />
        <SmoothScroll />
        <Header />
        <div className="flex flex-1">
          {/* Sidebar - Responsive */}
          <SidebarMobile>
            <Sidebar />
          </SidebarMobile>

          {/* Main Content */}
          <main id="main-content" className="flex-1 px-4 lg:px-8 py-6 lg:py-8 overflow-x-hidden lg:ml-80" role="main">
            <div className="max-w-7xl mx-auto">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
