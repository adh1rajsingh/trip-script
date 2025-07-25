import type { Metadata } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
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
      <html lang="en">
        <body
          className={`${poppins.variable} ${openSans.variable} antialiased`}
        >
          {/* Navigation Bar */}
          <nav className="navbar px-6 py-4 sticky top-0 z-50" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <h1 
                  className="text-xl md:text-2xl font-bold"
                  style={{ 
                    fontFamily: 'var(--font-poppins)', 
                    color: '#2C3E2C',
                    fontWeight: '700'
                  }}
                >
                  TripScript
                </h1>
              </div>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                <SignedOut>
                  <SignInButton 
                    mode="redirect"
                    forceRedirectUrl="/dashboard"
                  >
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100"
                      style={{
                        color: "#2C3E2C",
                        fontFamily: "var(--font-open-sans)",
                        fontWeight: "600",
                      }}
                    >
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton 
                    mode="redirect"
                    forceRedirectUrl="/dashboard"
                  >
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
                      style={{
                        backgroundColor: "#FF6B35",
                        color: "white",
                        fontFamily: "var(--font-open-sans)",
                        fontWeight: "600",
                      }}
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
