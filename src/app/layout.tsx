import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Pulse - Training That Fits Your Life",
  description: "Pulse is your personal AI running partner. It designs a truly dynamic training plan that syncs with your workouts, your data, and your real-time feedback to help you reach your goals without burnout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
