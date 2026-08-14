import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಪೋರ್ಟಲ್",
  description: "Organization Membership & PVC ID Card Portal"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="kn"><body>{children}</body></html>;
}