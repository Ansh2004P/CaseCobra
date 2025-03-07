import { Recursive } from "next/font/google";
import "./globals.css";
import ScreenSizeDetector from "@/components/ScreenSizeDetector";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";
import { constructMetadata } from "@/lib/utils";

const recursive = Recursive({ subsets: ['latin'] })

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={recursive.className}
      >
        <NavBar />
        <main className='flex grainy-light flex-col min-h-[calc(100vh-3.5rem-1px)]'>
          <div className='flex-1 flex flex-col h-full'>
            <Providers>{children}</Providers>
          </div>
          <Footer />
        </main>
        <Toaster richColors />
        {process.env.NEXT_PUBLIC_NODE_ENV === "development" && <ScreenSizeDetector />}
      </body>
    </html>
  );
}
