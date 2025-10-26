import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دایرکتوری کسب‌وکارهای بتن و مایه گیلان",
  description: "جستجوی خودکار کسب‌وکارها در حوزه بتن، مایه و محصولات مرتبط در استان گیلان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
