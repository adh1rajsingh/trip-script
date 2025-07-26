import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 
          className="text-3xl font-bold mb-8"
          style={{ 
            fontFamily: 'var(--font-poppins)', 
            color: '#2C3E2C' 
          }}
        >
          Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/trips" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group-hover:scale-105">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-semibold">My Trips</h3>
              </div>
              <p className="text-gray-600">View and manage your trips</p>
              <div className="mt-4 text-blue-500 text-sm font-medium group-hover:text-blue-600">
                View trips →
              </div>
            </div>
          </Link>
          
          <Link href="/trips/newtrip" className="group">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group-hover:scale-105">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-lg font-semibold">Create a trip</h3>
              </div>
              <p className="text-gray-600">Create new trip or itinerary</p>
              <div className="mt-4 text-green-500 text-sm font-medium group-hover:text-green-600">
                Start planning →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}