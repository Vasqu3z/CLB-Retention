import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import nextDynamic from "next/dynamic";
import {
  Azeret_Mono,
  Chakra_Petch,
  JetBrains_Mono,
  Orbitron,
} from "next/font/google";

const headingFont = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Azeret_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const statFont = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-stat",
  display: "swap",
});

const SmoothScroll = nextDynamic(() => import("@/components/SmoothScroll"), {
  ssr: false,
  loading: () => null,
});

const AnimatedBackground = nextDynamic(
  () => import("@/components/AnimatedBackground"),
  {
    ssr: false,
    loading: () => null,
  }
);

export const metadata: Metadata = {
  title: "Comets League Baseball | CLB Stats",
  description: "Official statistics and standings for Comets League Baseball",
};

// Prevent build-time rendering to avoid Google Sheets API quota during build
// Pages will be generated on-demand and cached with ISR
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = `${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} ${statFont.variable}`;

  return (
    <html lang="en">
      <body className={`${fontVariables} min-h-screen flex flex-col`}>
        <AnimatedBackground />
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
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
