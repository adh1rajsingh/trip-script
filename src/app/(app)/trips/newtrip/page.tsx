import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createTrip } from '@/app/actions/tripActions'
import { Calendar } from 'lucide-react'

export default async function NewTrip() {
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
                                    <Calendar className="w-5 h-5 text-gray-400" />
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
                                    <Calendar className="w-5 h-5 text-gray-400" />
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