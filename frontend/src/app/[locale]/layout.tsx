import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css"; // Ensure this path is correct based on your structure
import { ReactNode } from "react";
import { I18nProviderClient } from "@/lib/i18n.client";
import { AuthProvider } from '@/contexts/AuthContext'; // Add this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Autochalak Suisse",
  description: "Buy and sell vehicles in Switzerland",
  // Consider adding viewport settings for responsiveness if not already handled
  // viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  return (
    <html lang={locale} className="h-full"> {/* Ensure html and body take full height for some layouts */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900`}> {/* Basic page background */}
        <I18nProviderClient locale={locale} fallback={<div>Loading translations...</div>}>
          <AuthProvider>
            {/*
              A common site structure would be:
              <Navbar /> // Navbar can use useAuth() to display user status/login/logout links
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
              For now, just children to keep it simple as per current structure.
            */}
            {children}
          </AuthProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
