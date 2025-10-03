import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/toast";
import NavigationBehavior from "@/components/NavigationBehavior";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TripScript - Plan Your Adventures Effortlessly",
  description:
    "Discover, map, and organize your trips in one intuitive platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${crimsonText.variable} antialiased`} 
          suppressHydrationWarning
        >
          <ToastProvider>
            <NavigationBehavior />
            {/* Navigation Bar */}
            <nav className="navbar">
              <div className="container">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center">
                    <Link href="/dashboard" className="focus-ring">
                      <h1 className="text-h3 hover:opacity-80 transition-opacity cursor-pointer">
                        TripScript
                      </h1>
                    </Link>
                  </div>
                  
                  {/* Navigation and Auth Buttons */}
                  <div className="flex items-center gap-4">
                    <SignedIn>
                      <Link href="/dashboard">
                        <button className="btn-secondary text-sm">
                          Dashboard
                        </button>
                      </Link>
                    </SignedIn>
                    
                    <SignedOut>
                      <SignInButton 
                        mode="redirect"
                        forceRedirectUrl="/dashboard"
                      >
                        <button className="btn-secondary text-sm">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton 
                        mode="redirect"
                        forceRedirectUrl="/dashboard"
                      >
                        <button className="btn-primary text-sm">
                          Get Started
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    
                    <SignedIn>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8 rounded-full"
                          }
                        }}
                      />
                    </SignedIn>
                  </div>
                </div>
              </div>
            </nav>
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
