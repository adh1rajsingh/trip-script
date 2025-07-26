import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createTrip } from '@/app/actions/trip-actions'

export default async function CreateTrip() {
    const { userId } = await auth()

    if(!userId){
        redirect("/")
    }

    return(
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
                    Plan a new trip
                </h1>
                
                <form action={createTrip} className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <label htmlFor="destination" className="block text-lg font-semibold text-gray-900 mb-2">
                            Where to?
                        </label>
                        <input
                            type="text"
                            id="destination"
                            name="destination"
                            required
                            placeholder="e.g. Paris, Hawaii, Japan"
                            className="w-full text-lg text-gray-700 placeholder-gray-400 border-none outline-none bg-transparent"
                        />
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Dates (optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        className="text-gray-600 border-none outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        className="text-gray-600 border-none outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center pt-8">
                        <button
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-12 rounded-full text-lg transition-colors duration-200"
                        >
                            Start planning
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}