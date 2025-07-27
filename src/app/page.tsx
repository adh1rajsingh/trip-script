import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section
        className="subtle-wave-bg min-h-[60vh] flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: "#FDFDF9" }}
      >
        <div className="text-center space-y-6 max-w-4xl relative z-10">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "#2C3E2C",
              fontWeight: "700",
            }}
          >
            Plan Your Adventures Effortlessly
          </h1>

          <p
            className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto"
            style={{
              fontFamily: "var(--font-open-sans)",
              color: "#2C3E2C",
              fontWeight: "400",
            }}
          >
            Discover, map, and organize your trips in one intuitive platform.
          </p>

          <div className="pt-6">
            <SignedIn>
              <Link href="/dashboard">
                <button
                  className="main-cta-btn px-8 py-4 text-lg md:text-xl rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300/50 transform"
                  style={{
                    backgroundColor: "#FF6B35",
                    color: "white",
                    fontFamily: "var(--font-poppins)",
                    fontWeight: "600",
                  }}
                >
                  Start Planning Your Getaway
                </button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <button
                  className="main-cta-btn px-8 py-4 text-lg md:text-xl rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300/50 transform"
                  style={{
                    backgroundColor: "#FF6B35",
                    color: "white",
                    fontFamily: "var(--font-poppins)",
                    fontWeight: "600",
                  }}
                >
                  Start Planning Your Getaway
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>

      <section
        className="min-h-[40vh] flex flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: "#F0F4F0" }}
      >
        <div className="text-center space-y-6 max-w-5xl w-full">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "#2C3E2C",
              fontWeight: "700",
            }}
          >
            See TripScript in Action
          </h2>

          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{
              fontFamily: "var(--font-open-sans)",
              color: "#2C3E2C",
              fontWeight: "400",
            }}
          >
            A quick preview of how TripScript helps you plan your travels.
          </p>

          <div className="w-full max-w-4xl mx-auto">
            <div
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-medium shadow-sm"
              style={{
                aspectRatio: "16 / 9",
                fontFamily: "var(--font-open-sans)",
              }}
            >
              <div className="text-center">
                <div className="text-lg md:text-xl mb-2">🎬</div>
                <div className="text-sm md:text-base">
                  [DEMO VIDEO/INTERACTIVE AREA - 16:9 Aspect Ratio]
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <SignedIn>
              <Link href="/dashboard">
                <button
                  className="secondary-cta-btn px-6 py-3 text-base rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200/50"
                  style={{
                    backgroundColor: "#FF8A65",
                    color: "white",
                    fontFamily: "var(--font-open-sans)",
                    fontWeight: "600",
                  }}
                >
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <button
                  className="secondary-cta-btn px-6 py-3 text-base rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200/50"
                  style={{
                    backgroundColor: "#FF8A65",
                    color: "white",
                    fontFamily: "var(--font-open-sans)",
                    fontWeight: "600",
                  }}
                >
                  Explore Features
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>
    </div>
  );
}
