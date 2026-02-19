'use client';

/**
 * Main page component for TripPlanner AI
 */

import { useState } from 'react';
import Chat from './components/Chat';
import TripPlanView from './components/TripPlanView';
import { TripPlan } from '@/types/trip';

export default function Home() {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">TripPlanner AI</h1>
          <p className="text-gray-600 mt-1">Your intelligent travel planning assistant</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Panel */}
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex flex-col">
            <div className="border-b border-gray-300 p-4">
              <h2 className="text-xl font-semibold">Chat with TripPlanner</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat onTripPlanUpdate={(plan, isComplete) => {
                setTripPlan(plan);
                if (isComplete && plan) {
                  setShowPlan(true);
                }
              }} />
            </div>
          </div>

          {/* Trip Plan Panel */}
          <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] flex flex-col">
            <div className="border-b border-gray-300 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Trip Plan</h2>
              {tripPlan && (
                <button
                  onClick={() => setShowPlan(!showPlan)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showPlan ? 'Hide' : 'Show'} Plan
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {tripPlan && showPlan ? (
                <TripPlanView tripPlan={tripPlan} />
              ) : tripPlan ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Your trip plan is ready! Click &quot;Show Plan&quot; to view details.</p>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Complete your conversation to generate a trip plan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-300 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>TripPlanner AI MVP • Planning only, no bookings</p>
        </div>
      </footer>
    </div>
  );
}
