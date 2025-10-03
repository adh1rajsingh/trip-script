"use client";

import { SignInButton } from "@clerk/nextjs";
import { Users, MapPin } from "lucide-react";

interface AcceptInviteClientProps {
  email: string;
  role: string;
  tripDestination: string;
  tripId: string;
}

export default function AcceptInviteClient({
  email,
  role,
  tripDestination,
}: AcceptInviteClientProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            You&apos;re Invited!
          </h1>
          <p className="text-center text-blue-100">
            Join this trip and start collaborating
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Trip Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Trip Destination</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tripDestination}
              </h2>
            </div>

            {/* Invitation Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Invited Email</span>
                <span className="font-semibold text-gray-900">{email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Your Role</span>
                <span className="font-semibold text-purple-900 capitalize">
                  {role}
                </span>
              </div>
            </div>

            {/* Role Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                As a {role}, you can:
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {role === "editor" ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>View all trip details and itinerary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Add and remove places from the itinerary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Edit trip details and dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Invite other collaborators</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>View all trip details and itinerary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>See real-time updates from collaborators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">✗</span>
                      <span className="text-gray-400">
                        Cannot edit (view-only access)
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <SignInButton mode="modal" forceRedirectUrl={window.location.href}>
                <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg">
                  Sign In to Accept Invitation
                </button>
              </SignInButton>

              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <SignInButton mode="modal" forceRedirectUrl={window.location.href}>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign up with {email}
                  </button>
                </SignInButton>
              </p>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure to sign up using the email address{" "}
                <strong>{email}</strong> to access this invitation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
