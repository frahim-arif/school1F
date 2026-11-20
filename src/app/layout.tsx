
import "./globals.css";
import type { ReactNode } from "react";

const schoolName = "Adarsha Markaz Academy";

export const metadata = {
  // Set NEXT_PUBLIC_SITE_URL (for example https://yourschool.com) in your .env file
  // so that share previews (WhatsApp, Facebook) use the correct full links.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: `${schoolName}, Laharighat`,
    template: `%s | ${schoolName}`,
  },

  description:
    "Adarsha Markaz Academy, Laharighat, Morigaon, Assam. Quality education from Nursery to Class XII, built on knowledge, character and values. Established 2014.",

  keywords: [
    "Adarsha Markaz Academy",
    "Adarsha Markaz Academy Laharighat",
    "School in Laharighat",
    "School in Morigaon",
    "School in Assam",
    "ASSEB school",
    "Nursery to Class XII",
    "Markazul Ma'arif",
    "School Admissions",
    "Academics",
    "School Facilities",
  ],

  applicationName: schoolName,

  openGraph: {
    type: "website",
    siteName: schoolName,
    title: `${schoolName}, Laharighat`,
    description:
      "Quality education from Nursery to Class XII in Laharighat, Morigaon, Assam.",
    locale: "en_IN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3e2218",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="
          min-h-screen
          bg-[#fffaf8]
          text-[#3e2218]
          antialiased
          selection:bg-pink-200
          selection:text-[#3e2218]
        "
      >
        {children}
      </body>
    </html>
  );
}
