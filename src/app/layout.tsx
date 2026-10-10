import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Load Manrope font with multiple weights
const satoshi = Manrope({
  variable: "--font-satoshi",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
  preload: true,
});

// Load JetBrains Mono for code/technical text
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://louie.is-a.dev"),
  title: {
    default: "Louie Hansen | Backend engineer and builder",
    template: "%s | Louie Hansen",
  },
  description:
    "Louie Hansen Linadi is a backend engineer and Informatics student building reliable backend systems, full-stack products, and infrastructure.",
  keywords: [
    "Louie Hansen",
    "Louie Hansen Linadi",
    "Backend engineer",
    "Full-stack developer",
    "DevOps",
    "Informatics student",
    "Universitas Bunda Mulia",
  ],
  authors: [{ name: "Louie Hansen Linadi" }],
  creator: "Louie Hansen Linadi",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://louie.is-a.dev",
    siteName: "Louie Hansen",
    title: "Louie Hansen | Backend engineer and builder",
    description:
      "Backend engineer and Informatics student building reliable software across backend, full-stack, and infrastructure.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Louie Hansen | Backend engineer and builder",
    description:
      "Backend engineer and Informatics student building reliable software across backend, full-stack, and infrastructure.",
  },
  category: "technology",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://louie.is-a.dev/#person",
        name: "Louie Hansen Linadi",
        alternateName: "Louie Hansen",
        url: "https://louie.is-a.dev",
        email: "mailto:louiehansenlinadi@gmail.com",
        jobTitle: "Backend engineer",
        description:
          "Backend engineer and Informatics student building reliable backend systems, full-stack products, and infrastructure.",
        sameAs: [
          "https://github.com/aspectxlol",
          "https://linkedin.com/in/louiehansenlinadi",
        ],
        knowsAbout: [
          "Backend engineering",
          "Full-stack development",
          "DevOps",
          "Infrastructure",
          "TypeScript",
          "Next.js",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://louie.is-a.dev/#website",
        url: "https://louie.is-a.dev",
        name: "Louie Hansen",
        description:
          "Portfolio of Louie Hansen Linadi, a backend engineer and builder.",
        publisher: {
          "@id": "https://louie.is-a.dev/#person",
        },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${jetBrainsMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col">{children}</body>
    </html>
  );
}
