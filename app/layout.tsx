import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Conditioning Gym Art",
  description: "Conditioning Gym Art Member Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${cormorant.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{fontFamily:"var(--font-noto), sans-serif"}}>{children}</body>
    </html>
  );
}
