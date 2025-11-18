import type { Metadata } from "next";
import { Barlow, Syne, Azeret_Mono, JetBrains_Mono } from 'next/font/google';
import dynamicImport from 'next/dynamic';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";
import SmoothScroll from "@/components/SmoothScroll";

// Dynamically import AnimatedBackground to reduce initial bundle size (~100 KB savings)
const AnimatedBackground = dynamicImport(() => import('@/components/AnimatedBackground'), {
  ssr: false, // Only render on client
  loading: () => null,
});

// Optimize font loading with display: 'swap' and limited weights
const barlow = Barlow({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-barlow',
  preload: true,
});

const syne = Syne({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  preload: true,
});

const azeretMono = Azeret_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-azeret-mono',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
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
    <html lang="en" className={`${barlow.variable} ${syne.variable} ${azeretMono.variable} ${jetbrainsMono.variable}`}>
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
