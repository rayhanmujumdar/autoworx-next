import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import TopLoader from "../components/TopLoader";
import { auth } from "./auth";
import { TooltipProvider } from "@/components/Tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: `%s | AutoWorx`,
    default: "AutoWorx",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <TopLoader />
        <TooltipProvider delayDuration={150}>
          <Layout session={session}>{children}</Layout>
        </TooltipProvider>
      </body>
    </html>
  );
}
