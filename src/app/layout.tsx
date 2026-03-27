import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { cookies } from "next/headers";
import Script from "next/script";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/layout/AppLayout";
import {
  defaultTheme,
  getThemeBootstrapScript,
  getThemeCssVariables,
  isDarkTheme,
  isValidTheme,
  THEME_COOKIE_KEY,
  themes,
} from "@/lib/theme";
import type { ThemeType } from "@/lib/types";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FcuK Academia",
  description: "the future of rebellious learning",
  themeColor: "#f5a24f",
  icons: {
    icon: [
      { url: "/icons/browser%20logo.jpeg", type: "image/jpeg" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/ios%20new%20logo.jpeg", type: "image/jpeg" },
    ],
    shortcut: [
      { url: "/icons/browser%20logo.jpeg", type: "image/jpeg" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FcuK Academia",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme: ThemeType = isValidTheme(cookieTheme) ? cookieTheme : defaultTheme;
  const initialThemeConfig = themes[initialTheme];
  const initialCssVariables = getThemeCssVariables(initialThemeConfig);
  const htmlStyle = Object.fromEntries(
    Object.entries(initialCssVariables).map(([key, value]) => [`--${key}`, value]),
  ) as CSSProperties;

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      data-theme-mode={initialThemeConfig.mode}
      className={isDarkTheme(initialTheme) ? "dark" : undefined}
      style={{ ...htmlStyle, colorScheme: initialThemeConfig.mode }}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(initialTheme),
          }}
        />
        <ThemeProvider initialTheme={initialTheme}>
          <DashboardDataProvider>
            <AppStateProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </AppStateProvider>
          </DashboardDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
