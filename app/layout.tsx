import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Portal",
  description: "Organization Membership & PVC ID Card Portal",

  openGraph: {
    title: "Membership Portal",
    description: "Organization Membership & PVC ID Card Portal",
    type: "website",
    url: "https://membership-portal-zeta.vercel.app",
    siteName: "Membership Portal",
  },

  twitter: {
    card: "summary",
    title: "Membership Portal",
    description: "Organization Membership & PVC ID Card Portal",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kn">
      <body>{children}</body>
    </html>
  );
}
