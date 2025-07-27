import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus } from 'lucide-react'

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
                <MapPin className="w-6 h-6 text-blue-500 mr-2" />
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
                <Plus className="w-6 h-6 text-green-500 mr-2" />
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