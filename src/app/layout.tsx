
import "./globals.css";
import type { ReactNode } from "react";

const schoolName = "Niz Dhing GyanDeep Jatiya Bidyalaya";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: `${schoolName}, Niz Dhing, Nagaon`,
    template: `%s | ${schoolName}`,
  },

  description:
    "Niz Dhing GyanDeep Jatiya Bidyalaya, Niz Dhing, Nagaon, Assam - Providing quality education and building knowledge, character and values.",

  keywords: [
    "Niz Dhing GyanDeep Jatiya Bidyalaya",
    "Niz Dhing GyanDeep School",
    "Niz Dhing School",
    "School in Niz Dhing",
    "School in Nagaon",
    "School in Assam",
    "Assam School",
    "UDISE 18100102011",
    "School Admission",
    "School Education",
    "Academics",
    "School Facilities",
  ],

  applicationName: schoolName,

  openGraph: {
    type: "website",
    siteName: schoolName,
    title: `${schoolName}, Nagaon, Assam`,
    description:
      "Welcome to Niz Dhing GyanDeep Jatiya Bidyalaya, Niz Dhing, Nagaon, Assam.",
    locale: "en_IN",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173b32",
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
          text-[#173b32]
          antialiased
          selection:bg-emerald-200
          selection:text-[#173b32]
        "
      >
        {children}
      </body>
    </html>
  );
}
