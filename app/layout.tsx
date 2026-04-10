import "./globals.css";
import "./styles/app.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

// Google Analytics 4 measurement ID. Set NEXT_PUBLIC_GA_MEASUREMENT_ID
// in .env (e.g. G-XXXXXXXXXX) to enable tracking — leave it unset in
// dev to avoid polluting prod metrics with local page refreshes.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "Joel's Portfolio | Software Developer",
  description: `
    Discover my portfolio featuring my professional journey with various web frameworks alongside highlights from my personal projects.
  `,
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Secure Privacy consent manager. Loaded in <head> with a
            plain script tag so it's blocking and runs before any
            tracking-adjacent code (e.g. GA4 below) — that's how a
            consent manager is expected to integrate. */}
        <script
          src="https://app.secureprivacy.ai/script/69d92b7eec43ec9a8266b4e7.js"
          async
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        {/* Google Analytics 4 — loaded only when the measurement ID is
            set, so dev builds without the env var don't ship empty
            gtag calls. `afterInteractive` keeps the script out of the
            critical rendering path. */}
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        ) : null}
        
      </body>
    </html>
  );
}
