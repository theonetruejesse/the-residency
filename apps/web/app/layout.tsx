import { Geist, Geist_Mono } from "next/font/google";

import "@residency/ui/globals.css";
import { Providers } from "@/components/providers";
import backgroundTexture from "@/public/background.png";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
        style={{
          backgroundImage: `url(${backgroundTexture.src})`,
          backgroundRepeat: "repeat",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
