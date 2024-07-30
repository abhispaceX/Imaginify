import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

import "./globals.css";

const IBMPlex = IBM_Plex_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});

export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI-powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: '#624cf5' }
    }}>
      <html lang="en">
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          
        <div className=' absolute right-3 top-3 ' >
         <SignedOut>
            <SignInButton>
              <button  className=" p-2 w-20 rounded-2xl text-white text-sm  m-2 bg-purple-gradient bg-cover" >
                Log In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton showName />
          </SignedIn>
       </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}