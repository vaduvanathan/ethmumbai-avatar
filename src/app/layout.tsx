import type { Metadata } from "next";
import { Inter_Tight, M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const headline = M_PLUS_Rounded_1c({
  variable: "--font-headline",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const body = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ETHMumbai Avatar Studio",
  description: "Transform any photo into an ETHMumbai-styled avatar. Make it fun. Make it Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headline.variable} ${body.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
