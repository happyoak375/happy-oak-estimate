import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Happy Oak ERP",
  description: "Command Center for Happy Oak Painting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* The AuthProvider now protects everything inside your app */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}