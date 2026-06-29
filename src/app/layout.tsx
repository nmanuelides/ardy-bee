import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import BeeLab from "@/components/brand/BeeLab";
import CursorBee from "@/components/brand/CursorBee";
import CustomCursor from "@/components/brand/CustomCursor";
import Backdrop from "@/components/layout/Backdrop";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ThemeLab from "@/components/layout/ThemeLab";
import { I18nProvider } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      data-theme="ardy"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`}
        </Script>
        <Backdrop />
        <ScrollProgress />
        <I18nProvider locale={locale} dict={dict}>
          <div className="app-shell">{children}</div>
        </I18nProvider>
        <CustomCursor />
        <CursorBee />
        {process.env.NODE_ENV !== "production" && <ThemeLab />}
        {process.env.NODE_ENV !== "production" && <BeeLab />}
      </body>
    </html>
  );
}
