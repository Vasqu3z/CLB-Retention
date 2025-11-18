import type { Metadata } from "next";
import dynamic from "next/dynamic";
import {
  Azeret_Mono,
  Chakra_Petch,
  JetBrains_Mono,
  Orbitron,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";

const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), {
  ssr: false,
});

const AnimatedBackground = dynamic(
  () => import("@/components/AnimatedBackground"),
  {
    ssr: false,
    loading: () => null,
  }
);

const headingFont = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

const bodyFont = Azeret_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
});

const statFont = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-stat",
});

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
  return (
    <html
      lang="en"
      className={`
        ${headingFont.variable}
        ${bodyFont.variable}
        ${monoFont.variable}
        ${statFont.variable}
      `}
    >
      <body className="min-h-screen flex flex-col">
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
