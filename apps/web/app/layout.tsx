import { Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import backgroundTexture from "@/public/background.png";
// import { ReactScan } from "@/components/react-scan";
import { Toaster } from "@residency/ui/components/sonner";
import localFont from "next/font/local";
import "@residency/ui/globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeadline = localFont({
  src: "../public/fonts/tiempos-headline-light.woff2",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontHeadline.variable} font-sans antialiased`}
        style={{
          backgroundImage: `url(${backgroundTexture.src})`,
          backgroundRepeat: "repeat",
        }}
      >
        {/* <ReactScan /> */}
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
