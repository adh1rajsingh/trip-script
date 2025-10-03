import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus, Calendar, Compass } from 'lucide-react'

export default async function Dashboard() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <main className="min-h-screen section-spacing-sm">
      <div className="container">
        <div className="vertical-rhythm-lg">
          <div>
            <h1 className="text-h1 mb-4">Dashboard</h1>
            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
              Welcome back! Ready to plan your next adventure?
            </p>
          </div>
          
          <div className="grid-responsive">
            <Link href="/trips" className="focus-ring">
              <div className="card-featured hover-lift">
                <div className="vertical-rhythm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: 'var(--color-accent-light)' }}>
                      <MapPin className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <h3 className="text-h3">My Trips</h3>
                  </div>
                  <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                    View, edit, and manage all your existing trips. Continue planning or revisit past adventures.
                  </p>
                  <div className="mt-6 flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
                    <span className="text-sm font-medium">View all trips</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/trips/newtrip" className="focus-ring">
              <div className="card hover-lift">
                <div className="vertical-rhythm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}>
                      <Plus className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <h3 className="text-h3">Create New Trip</h3>
                  </div>
                  <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                    Start planning a brand new adventure. Set your destination and begin building your perfect itinerary.
                  </p>
                  <div className="mt-6 flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                    <span className="text-sm font-medium">Start planning</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats Section */}
          <div className="surface" style={{ padding: 'var(--space-8)' }}>
            <div className="vertical-rhythm">
              <h2 className="text-h3 mb-6">Quick Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--color-bg)' }}>
                    <Calendar className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    0
                  </div>
                  <div className="text-meta">Upcoming Trips</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--color-bg)' }}>
                    <MapPin className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    0
                  </div>
                  <div className="text-meta">Total Destinations</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center" 
                       style={{ backgroundColor: 'var(--color-bg)' }}>
                    <Compass className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    0
                  </div>
                  <div className="text-meta">Places Explored</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}