import type { Metadata } from "next";
import { Barlow, Syne, Azeret_Mono, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${syne.variable} ${azeretMono.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-white min-h-screen flex flex-col md:flex-row overflow-x-hidden font-body">
        {/* Mobile Sidebar Drawer */}
        <div className="md:hidden z-50">
          <SidebarMobile />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0 h-screen sticky top-0 border-r border-white/10 bg-surface-dark/50 backdrop-blur-md z-40">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <Header />
          <main id="main-content" className="flex-1 relative z-0" role="main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
