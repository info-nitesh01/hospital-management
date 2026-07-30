import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/main.scss";
import { ReduxProvider } from "@/store/provider";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";
import { QueryProvider } from "@/contexts/QueryProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Professional client management portal",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "180x180" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <ThemeProviderWrapper>
            <QueryProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <Toaster position="top-center"/>
            </QueryProvider>
          </ThemeProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
