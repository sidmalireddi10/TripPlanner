'use client';

/**
 * Component to display a detailed trip plan
 */

import { TripPlan } from '@/types/trip';

interface TripPlanViewProps {
  tripPlan: TripPlan;
}

export default function TripPlanView({ tripPlan }: TripPlanViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Trip Plan</h2>
        <p className="text-gray-600 mt-1">
          {tripPlan.destination} • {tripPlan.duration} days
        </p>
      </div>

      {/* Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Trip Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Origin:</span> {tripPlan.origin}
          </div>
          <div>
            <span className="text-gray-600">Destination:</span> {tripPlan.destination}
          </div>
          <div>
            <span className="text-gray-600">Start Date:</span> {tripPlan.startDate}
          </div>
          <div>
            <span className="text-gray-600">End Date:</span> {tripPlan.endDate}
          </div>
          <div>
            <span className="text-gray-600">Travelers:</span> {tripPlan.travelers}
          </div>
          {tripPlan.totalEstimatedCost && (
            <div>
              <span className="text-gray-600">Estimated Cost:</span> {tripPlan.totalEstimatedCost}
            </div>
          )}
        </div>
      </div>

      {/* Flights */}
      {tripPlan.flights && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Flight Suggestions</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">Outbound ({tripPlan.flights.outbound.date})</p>
              <p className="text-sm text-gray-600">{tripPlan.flights.outbound.route}</p>
              <ul className="text-sm mt-2 space-y-1">
                {tripPlan.flights.outbound.suggestions.map((suggestion, idx) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">Return ({tripPlan.flights.return.date})</p>
              <p className="text-sm text-gray-600">{tripPlan.flights.return.route}</p>
              <ul className="text-sm mt-2 space-y-1">
                {tripPlan.flights.return.suggestions.map((suggestion, idx) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Accommodation */}
      {tripPlan.accommodation && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Accommodation</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium">{tripPlan.accommodation.type}</p>
            {tripPlan.accommodation.estimatedCost && (
              <p className="text-sm text-gray-600">Estimated Cost: {tripPlan.accommodation.estimatedCost}</p>
            )}
            <ul className="text-sm mt-2 space-y-1">
              {tripPlan.accommodation.recommendations.map((rec, idx) => (
                <li key={idx}>• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Itinerary */}
      {tripPlan.itinerary && tripPlan.itinerary.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Day-by-Day Itinerary</h3>
          <div className="space-y-4">
            {tripPlan.itinerary.map((day, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">Day {day.day} - {day.date}</h4>
                <div className="mt-2 space-y-2">
                  {day.activities.map((activity, actIdx) => (
                    <div key={actIdx} className="text-sm">
                      <span className="font-medium text-gray-700">{activity.time}</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-800">{activity.activity}</span>
                      <span className="text-gray-600 ml-2">({activity.location})</span>
                      {activity.notes && (
                        <p className="text-gray-500 text-xs mt-1 ml-8">{activity.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {tripPlan.activities && tripPlan.activities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Recommended Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tripPlan.activities.map((activity, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{activity.name}</p>
                <p className="text-sm text-gray-600">{activity.location}</p>
                <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                {activity.estimatedCost && (
                  <p className="text-sm text-gray-500 mt-1">Cost: {activity.estimatedCost}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transport */}
      {tripPlan.transport && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Transportation</h3>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium">{tripPlan.transport.type}</p>
            <ul className="text-sm mt-2 space-y-1">
              {tripPlan.transport.recommendations.map((rec, idx) => (
                <li key={idx}>• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Notes */}
      {tripPlan.notes && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{tripPlan.notes}</p>
        </div>
      )}
    </div>
  );
}
