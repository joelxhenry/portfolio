import "./globals.css";
import "./styles/app.scss";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { buildPersonJsonLd, SITE_URL } from "./lib/seo/structuredData";

const inter = Inter({ subsets: ["latin"] });

// Google Analytics 4 measurement ID. Set NEXT_PUBLIC_GA_MEASUREMENT_ID
// in .env (e.g. G-XXXXXXXXXX) to enable tracking — leave it unset in
// dev to avoid polluting prod metrics with local page refreshes.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const SITE_DESCRIPTION =
  "Joel Henry is a software engineer and technical lead in Kingston, Jamaica, who designs, builds, documents, and maintains web applications and digital platforms end to end — including work delivered for the Government of Jamaica. Skilled across Laravel, .NET, Node.js, Next.js, React, and Vue.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Joel Henry | Software Engineer & Technical Lead",
    template: "%s | Joel Henry",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Joel Henry — Portfolio",
  authors: [{ name: "Joel Henry", url: SITE_URL }],
  creator: "Joel Henry",
  publisher: "Joel Henry",
  keywords: [
    "Joel Henry",
    "Software Engineer",
    "Technical Lead",
    "Full-Stack Developer",
    "Kingston Jamaica",
    "Government of Jamaica",
    "Laravel",
    ".NET",
    "Next.js",
    "React",
    "Vue",
    "Node.js",
    "AWS",
    "CI/CD",
    "Web Development",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    firstName: "Joel",
    lastName: "Henry",
    title: "Joel Henry | Software Engineer & Technical Lead",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Joel Henry — Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joel Henry | Software Engineer & Technical Lead",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        {/* schema.org Person graph (JSON-LD). Gives search engines and AI
            crawlers a structured, machine-readable description of Joel —
            derived from the same content files as the page, so it never
            drifts. See app/lib/seo/structuredData.ts. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildPersonJsonLd()),
          }}
        />
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
