import type { Metadata } from "next";
import { Dela_Gothic_One, Chivo, Rajdhani, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import SmoothScroll from "@/components/SmoothScroll";
import CosmicBackground from "@/components/CosmicBackground";
import PageTransition from "@/components/animations/PageTransition";

// Neon Void Theme Fonts
const delaGothic = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const chivo = Chivo({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const rajdhani = Rajdhani({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
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
    <html lang="en" className={`${delaGothic.variable} ${chivo.variable} ${rajdhani.variable} ${spaceMono.variable}`}>
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
