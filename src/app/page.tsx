export default function Home() {
  return (
    <div className="min-h-screen">
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
            <button 
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-gray-100"
              style={{ 
                color: '#2C3E2C',
                fontFamily: 'var(--font-open-sans)',
                fontWeight: '600'
              }}
            >
              Login
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
              style={{ 
                backgroundColor: '#FF6B35',
                color: 'white',
                fontFamily: 'var(--font-open-sans)',
                fontWeight: '600'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Top Section - 60% of screen */}
      <section className="subtle-wave-bg min-h-[60vh] flex flex-col items-center justify-center px-8 py-12" style={{ backgroundColor: '#FDFDF9' }}>
        <div className="text-center space-y-6 max-w-4xl relative z-10">
          {/* Main Headline */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
            style={{ 
              fontFamily: 'var(--font-poppins)', 
              color: '#2C3E2C',
              fontWeight: '700'
            }}
          >
            Plan Your Adventures Effortlessly
          </h1>
          
          {/* Sub-headline */}
          <p 
            className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto"
            style={{ 
              fontFamily: 'var(--font-open-sans)', 
              color: '#2C3E2C',
              fontWeight: '400'
            }}
          >
            Discover, map, and organize your trips in one intuitive platform.
          </p>
          
          {/* Main CTA Button */}
          <div className="pt-6">
            <button 
              className="main-cta-btn px-8 py-4 text-lg md:text-xl rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300/50 transform"
              style={{ 
                backgroundColor: '#FF6B35',
                color: 'white',
                fontFamily: 'var(--font-poppins)',
                fontWeight: '600'
              }}
            >
              Start Planning Your Getaway
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section - 40% of screen */}
      <section className="min-h-[40vh] flex flex-col items-center justify-center px-8 py-12" style={{ backgroundColor: '#F0F4F0' }}>
        <div className="text-center space-y-6 max-w-5xl w-full">
          {/* Demo Section Headline */}
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold"
            style={{ 
              fontFamily: 'var(--font-poppins)', 
              color: '#2C3E2C',
              fontWeight: '700'
            }}
          >
            See TripScript in Action
          </h2>
          
          {/* Demo Sub-headline */}
          <p 
            className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ 
              fontFamily: 'var(--font-open-sans)', 
              color: '#2C3E2C',
              fontWeight: '400'
            }}
          >
            A quick preview of how TripScript helps you plan your travels.
          </p>
          
          {/* Demo Placeholder */}
          <div className="w-full max-w-4xl mx-auto">
            <div 
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-medium shadow-sm"
              style={{ 
                aspectRatio: '16 / 9',
                fontFamily: 'var(--font-open-sans)'
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
          
          {/* Secondary CTA Button */}
          <div className="pt-5">
            <button 
              className="secondary-cta-btn px-6 py-3 text-base rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200/50"
              style={{ 
                backgroundColor: '#FF8A65',
                color: 'white',
                fontFamily: 'var(--font-open-sans)',
                fontWeight: '600'
              }}
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
