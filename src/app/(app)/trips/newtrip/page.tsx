import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import NewTripClient from './NewTripClient'

export default async function NewTrip() {
    const { userId } = await auth()

    if(!userId){
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
                    Plan a new trip
                </h1>
                <NewTripClient />
            </div>
        </div>
    )
}