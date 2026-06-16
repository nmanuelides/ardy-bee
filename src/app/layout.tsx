import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import BeeLab from "@/components/brand/BeeLab";
import CursorBee from "@/components/brand/CursorBee";
import CustomCursor from "@/components/brand/CustomCursor";
import Backdrop from "@/components/layout/Backdrop";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ThemeLab from "@/components/layout/ThemeLab";
import "../styles/main.scss";

// Display: characterful, contemporary, very readable. Body: clean geometric sans.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ardy Bee — Rate the performance, not the movie",
  description:
    "Ardy Bee (ARDB) is the Actors Ratings Data Base: rate actor performances from 1 to 10, build your taste profile, and discover films where your favorites share the screen.",
};

export const viewport: Viewport = {
  themeColor: "#0e0d0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="ardy"
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`}
        </Script>
        <Backdrop />
        <ScrollProgress />
        <div className="app-shell">{children}</div>
        <CustomCursor />
        <CursorBee />
        {process.env.NODE_ENV !== "production" && <ThemeLab />}
        {process.env.NODE_ENV !== "production" && <BeeLab />}
      </body>
    </html>
  );
}
