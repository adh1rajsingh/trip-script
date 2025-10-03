import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="text-center vertical-rhythm-lg max-w-4xl mx-auto">
            <h1 className="text-display">
              Plan Your Adventures Effortlessly
            </h1>

            <p className="text-body-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Discover, map, and organize your trips in one intuitive platform. 
              Create detailed itineraries, share your adventures, and never miss a moment.
            </p>

            <div className="pt-8">
              <SignedIn>
                <Link href="/dashboard" className="btn-primary btn-lg">
                  Start Planning Your Adventure
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button className="btn-primary" style={{ 
                    padding: 'var(--space-4) var(--space-8)',
                    fontSize: 'var(--text-lg)'
                  }}>
                    Start Planning Your Adventure
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="section-spacing" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div className="text-center vertical-rhythm max-w-5xl mx-auto">
            <h2 className="text-h2">
              See TripScript in Action
            </h2>

            <p className="text-body mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Watch how TripScript transforms travel planning from overwhelming to effortless.
            </p>

            <div className="w-full max-w-4xl mx-auto mt-12">
              <div className="image-rounded image-aspect-16-9 surface-elevated overflow-hidden">
                <video
                  width="100%"
                  height="100%"
                  controls
                  preload="metadata"
                  poster="https://res.cloudinary.com/dskj7wqn8/image/upload/v1753674969/Your_Trips_mbg999.png"
                  className="w-full h-full object-cover"
                >
                  <source
                    src="https://res.cloudinary.com/dskj7wqn8/video/upload/v1753674790/My_Movie_bk8b2n.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="pt-8">
              <SignedIn>
                <Link href="/dashboard" className="btn-secondary">
                  Go to Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <button className="btn-secondary">
                    Explore Features
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-6">
              Everything You Need for Perfect Trips
            </h2>
            <p className="text-body mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              From initial planning to sharing memories, TripScript covers every aspect of your journey.
            </p>
          </div>

          <div className="grid-responsive">
            <div className="card hover-lift">
              <div className="vertical-rhythm">
                <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: 'var(--color-accent-light)' }}>
                  <svg className="w-8 h-8 mx-auto mt-2" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h3 className="text-h3">Interactive Planning</h3>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  Create day-by-day itineraries with our intuitive interface. Add places, set dates, and organize your perfect trip.
                </p>
              </div>
            </div>

            <div className="card hover-lift">
              <div className="vertical-rhythm">
                <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: 'var(--color-accent-light)' }}>
                  <svg className="w-8 h-8 mx-auto mt-2" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                  </svg>
                </div>
                <h3 className="text-h3">Easy Sharing</h3>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  Share your trip plans with friends and family. Collaborate on itineraries and get everyone excited about the adventure.
                </p>
              </div>
            </div>

            <div className="card hover-lift">
              <div className="vertical-rhythm">
                <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: 'var(--color-accent-light)' }}>
                  <svg className="w-8 h-8 mx-auto mt-2" style={{ color: 'var(--color-accent)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H18V0h-2v2H8V0H6v2H3.5C2.67 2 2 2.67 2 3.5v16C2 20.33 2.67 21 3.5 21h17c.83 0 1.5-.67 1.5-1.5v-16C22 2.67 21.33 2 20.5 2zm0 18h-17V7h17v11z"/>
                  </svg>
                </div>
                <h3 className="text-h3">Smart Organization</h3>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                  Keep all your trips organized in one place. Track dates, manage itineraries, and never lose track of your plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
