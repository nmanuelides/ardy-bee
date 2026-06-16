import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import CursorBee from "@/components/brand/CursorBee";
import Backdrop from "@/components/layout/Backdrop";
import ScrollProgress from "@/components/layout/ScrollProgress";
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
  themeColor: "#13121e",
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        <Backdrop />
        <ScrollProgress />
        <div className="app-shell">{children}</div>
        <CursorBee />
      </body>
    </html>
  );
}
