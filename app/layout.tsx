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
    images: [
      {
        url: "/og-image.png",
        width: 1008,
        height: 1536,
        alt: "Organization Membership Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Membership Portal",
    description: "Organization Membership & PVC ID Card Portal",
    images: ["/og-image.png"],
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
