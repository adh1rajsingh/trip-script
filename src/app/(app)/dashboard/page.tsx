import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

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
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">My Trips</h3>
            <p className="text-gray-600">View and manage your trips</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Create a trip</h3>
            <p className="text-gray-600">Create new trip or itinerary</p>
          </div>
        </div>
      </div>
    </div>
  )
}