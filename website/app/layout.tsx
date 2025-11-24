import type { Metadata } from "next";
import { Dela_Gothic_One, Chivo, Rajdhani, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SidebarMobile from "@/components/SidebarMobile";

const delaGothic = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const syne = Syne({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
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
    <html
      lang="en"
      className={`${delaGothic.variable} ${chivo.variable} ${rajdhani.variable} ${spaceMono.variable} ${syne.variable}`}
    >
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
