import type { Metadata } from "next";
import { Space_Grotesk, Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-label",
});

export const metadata: Metadata = {
  title: "fcuk academia",
  description: "the future of rebellious learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${beVietnamPro.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
