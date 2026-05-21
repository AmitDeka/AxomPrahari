import { PT_Serif, Lato } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata = {
  title: "Axom Prahari - Admin Portal",
  description:
    "Administrative console for Axom Prahari police reporting network",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${ptSerif.variable} ${lato.variable} h-full antialiased`}
      suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
