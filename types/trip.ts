/**
 * Type definitions for trip planning data structures
 */

export interface TripPreferences {
  destination?: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  travelers?: number;
  accommodationType?: string;
  interests?: string[];
  transportPreferences?: string;
  specialRequirements?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface TripPlan {
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: string;
  travelers: number;
  flights?: {
    outbound: {
      date: string;
      route: string;
      suggestions: string[];
    };
    return: {
      date: string;
      route: string;
      suggestions: string[];
    };
  };
  accommodation?: {
    type: string;
    recommendations: string[];
    estimatedCost: string;
  };
  itinerary?: {
    day: number;
    date: string;
    activities: {
      time: string;
      activity: string;
      location: string;
      notes?: string;
    }[];
  }[];
  transport?: {
    type: string;
    recommendations: string[];
  };
  activities?: {
    name: string;
    location: string;
    description: string;
    estimatedCost?: string;
  }[];
  totalEstimatedCost?: string;
  notes?: string;
}

export interface ChatState {
  messages: Message[];
  preferences: TripPreferences;
  isPlanningComplete: boolean;
  tripPlan?: TripPlan;
}
