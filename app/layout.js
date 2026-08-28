import { Fraunces, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-worksans",
  weight: ["400", "500", "600", "700"]
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500"]
});

export const metadata = {
  title: "Desa Wisata Sukorejo | WebGIS UMKM & Wisata",
  description:
    "WebGIS Desa Wisata Sukorejo, Sambirejo, Sragen — peta interaktif UMKM & wisata desa lengkap dengan analisis isokron dan multimoda.",
  keywords: [
    "Desa Wisata Sukorejo",
    "Sambirejo",
    "Sragen",
    "WebGIS",
    "UMKM Desa",
    "Wisata Desa",
    "Isokron"
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${workSans.variable} ${jbMono.variable}`}>
      <body className="font-body bg-paper text-ink antialiased flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
