import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StorkMail // A special delivery",
  description: "A special delivery from Kim & Jim.",
  openGraph: { title: "StorkMail // A special delivery", description: "A special delivery from Kim & Jim.", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "StorkMail // A special delivery", description: "A special delivery from Kim & Jim.", images: ["/og.png"] },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
