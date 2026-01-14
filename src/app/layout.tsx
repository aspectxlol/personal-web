import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Louie Hansen - Student, Developer, Creator',
    template: '%s | Louie Hansen'
  },
  description: 'Personal website and blog of Louie Hansen. Student, developer, and creator sharing projects, thoughts, and experiments.',
  keywords: ['Louie Hansen', 'Developer', 'Student', 'Blog', 'Programming', 'Web Development'],
  authors: [{ name: 'Louie Hansen' }],
  creator: 'Louie Hansen',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://louie.is-a.dev', // Replace with your actual domain
    siteName: 'Louie Hansen',
    title: 'Louie Hansen - Student, Developer, Creator',
    description: 'Personal website and blog of Louie Hansen. Student, developer, and creator sharing projects, thoughts, and experiments.',
    images: [
      {
        url: '/og-image.jpg', // Place this in your /public folder
        width: 1200,
        height: 630,
        alt: 'Louie Hansen',
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Louie Hansen - Student, Developer, Creator',
    description: 'Personal website and blog of Louie Hansen. Student, developer, and creator.',
    images: ['/og-image.jpg'],
    creator: '@gamernxt6', // Replace with your Twitter handle if you have one
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
