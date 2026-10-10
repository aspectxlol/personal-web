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
  title: {
    default: "Louie Hansen | Backend engineer and builder",
    template: "%s | Louie Hansen",
  },
  description:
    "Louie Hansen Linadi is a backend engineer and builder working across full-stack products and infrastructure.",
  keywords: [
    "Louie Hansen",
    "Backend engineer",
    "Full-stack developer",
    "DevOps",
    "UBM Ancol",
  ],
  authors: [{ name: "Louie Hansen Linadi" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://louiehansen.vercel.app",
    siteName: "Louie Hansen",
    title: "Louie Hansen | Backend Engineer & Builder",
    description:
      "Informatics student at UBM Ancol. Building real software with backend, full-stack, and DevOps.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Louie Hansen | Backend Engineer & Builder",
    description:
      "Informatics student at UBM Ancol. Building real software with backend, full-stack, and DevOps.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${satoshi.variable} ${jetBrainsMono.variable} h-full`}
    >
      <body className="min-h-[100dvh] flex flex-col">{children}</body>
    </html>
  );
}
