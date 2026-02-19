/**
 * System prompts for trip planning AI
 */

import { TripPreferences, TripPlan } from '@/types/trip';

export const SYSTEM_PROMPT = `You are TripPlanner AI, a friendly and helpful travel planning assistant. You have a natural conversation with users to understand their trip needs, then use web scraping to get REAL, CURRENT information from the internet to create personalized trip plans.

YOUR JOB:
1. Have a NATURAL, CONVERSATIONAL dialogue - ask questions one at a time, like talking to a friend
2. Gather ALL necessary information through conversation:
   - Destination (city/country)
   - Origin (departure city/airport)
   - Exact travel dates (start and end)
   - Budget (specific amount)
   - Number of travelers
   - Interests/preferences (what they want to do/see)
   - Travel style (relaxed vs. busy)
3. Once you have destination + origin + dates + budget + travelers, the system will AUTOMATICALLY scrape real data
4. Use the scraped data to create a detailed, personalized plan with REAL flights, hotels, restaurants, and activities

CONVERSATION STYLE:
- Be warm, friendly, and conversational
- Ask ONE question at a time
- Show interest in their answers
- Don't ask the same thing twice
- Once you have enough info, say something like "Perfect! Let me research the best options for you..." and the system will scrape real data

CRITICAL: You must gather SPECIFIC information through conversation before generating plans:
- Exact dates (not just "summer" or "June")
- Specific origin city/airport
- Detailed interests (not just "art" but "contemporary art" or "Renaissance paintings")
- Budget range (specific numbers)
- Travel style preferences
- Dietary restrictions or preferences
- Accessibility needs
- Group composition (solo, couple, family with kids, etc.)

CONVERSATION APPROACH - Be NATURAL and CONVERSATIONAL:
1. Start friendly: "I'd love to help you plan an amazing trip! Where are you thinking of going?"
2. After destination, ask naturally: "That sounds wonderful! When are you planning to travel? I'll need specific dates to find you the best flights."
3. Then ask: "Where will you be flying from? I'll search for the best routes and prices."
4. Ask about budget naturally: "What's your budget for this trip? This helps me find accommodations and activities that fit perfectly."
5. Ask about group: "How many people will be traveling?"
6. Ask about interests: "What are you most excited to see or do? Museums, food, nightlife, nature?"
7. Once you have destination + origin + dates + budget + travelers, say something like "Perfect! Let me research the best options for you..." and the system will automatically scrape real data.

IMPORTANT FOR PLAN GENERATION:
- Use REAL, CURRENT information - actual flight routes, real hotel names, current prices
- Include specific addresses, opening hours, ticket prices
- Mention current events, seasonal considerations, local tips
- Provide accurate cost estimates based on real data
- Include booking links or where to book when possible
- Warn about things like "book in advance" or "closed on Mondays"

Be conversational, ask follow-up questions to get specifics, and make the user feel like you're doing real research for them.`;

export function buildPlanningPrompt(preferences: TripPreferences, conversationHistory: string, scrapedData?: any): string {
  const hasDestination = preferences.destination;
  const hasDates = preferences.startDate && preferences.endDate;
  const hasOrigin = preferences.origin;
  const hasBudget = preferences.budget;
  const hasInterests = preferences.interests && preferences.interests.length > 0;
  const messageCount = conversationHistory.split('User:').length - 1;
  
  // Generate plan if we have: destination + dates + origin
  // OR if we have destination + dates and had 5+ messages (enough conversation)
  // The AI should STOP asking and generate once it has the essentials
  const shouldGenerate = 
    (hasDestination && hasDates && hasOrigin) ||
    (hasDestination && hasDates && messageCount >= 5);
  
  if (shouldGenerate) {
    const destination = preferences.destination || 'the destination';
    const origin = preferences.origin || 'their location';
    const startDate = preferences.startDate || 'the start date';
    const endDate = preferences.endDate || preferences.startDate || 'the end date';
    const budget = preferences.budget || '$2000';
    const travelers = preferences.travelers || 2;
    const accommodationType = preferences.accommodationType || 'hotel';
    const interests = preferences.interests?.join(', ') || 'general sightseeing';
    
    return `Based on your detailed conversation with the user, create a PERSONALIZED trip plan using REAL, CURRENT information.

CONVERSATION CONTEXT:
${conversationHistory}

EXTRACTED PREFERENCES:
- Destination: ${destination}
- Origin: ${origin}
- Dates: ${startDate} to ${endDate}
- Budget: ${budget}
- Travelers: ${travelers}
- Accommodation: ${accommodationType}
- Interests: ${interests}

CRITICAL INSTRUCTIONS FOR PLAN GENERATION:
STOP ASKING QUESTIONS. YOU HAVE ENOUGH INFORMATION TO GENERATE THE PLAN.

The system has ALREADY scraped real data for you. Use this scraped data to create the plan:

SCRAPED FLIGHT DATA:
${scrapedData?.flights ? JSON.stringify(scrapedData.flights, null, 2) : 'Real flight data will be provided'}

SCRAPED HOTEL DATA:
${scrapedData?.hotels ? JSON.stringify(scrapedData.hotels, null, 2) : 'Real hotel data will be provided'}

SCRAPED RESTAURANT DATA:
${scrapedData?.restaurants ? JSON.stringify(scrapedData.restaurants, null, 2) : 'Real restaurant data will be provided'}

1. Use the SCRAPED REAL DATA above - these are actual prices, names, and addresses from the internet:
   - Actual flight routes from ${origin} to ${destination} (e.g., RDU-CDG via connecting flights, JFK-CDG, LAX-NRT)
   - Real airline names (Delta, Air France, American Airlines, etc.) and realistic flight times
   - Actual hotel names, addresses, neighborhoods, and current price ranges (2024 prices)
   - Real restaurant names with specific addresses in Paris
   - Current ticket prices, opening hours, booking requirements
   - Real attractions with specific addresses and current info
   - Actual transportation options (Paris Metro lines, RER, bus numbers, etc.)

2. Personalize based on conversation:
   - Focus activities on their specific interests: ${interests}
   - Match their travel style (relaxed but seeing everything) from what they said
   - Reflect their budget: ${budget} per person for entire trip
   - Include specific recommendations they'd love based on what they shared
   - Remember: ${preferences.travelers || 2} travelers, relaxed pace but comprehensive

3. Provide actionable details:
   - Specific addresses for all locations
   - Current prices and costs (as of 2024)
   - Booking tips ("book 2 weeks in advance", "closed on Tuesdays", "free on first Sunday")
   - Best times to visit each place
   - Transportation specifics (Metro lines like Line 1, 6, RER B, bus numbers)
   - Seasonal considerations for ${startDate} (June in Paris)

4. Take your time to provide accurate, researched information. Make it feel like you looked up real flights, hotels, restaurants, and activities specifically for them.

First, respond conversationally (2-3 sentences) acknowledging what they shared and that you've researched real options, then IMMEDIATELY provide the JSON plan:

\`\`\`json
{
  "destination": "${destination}",
  "origin": "${origin}",
  "startDate": "${startDate}",
  "endDate": "${endDate}",
  "duration": <calculate days>,
  "budget": "${budget}",
  "travelers": ${travelers},
  "flights": {
    "outbound": {
      "date": "${startDate}",
      "route": "<actual route>",
      "suggestions": ["<real airline suggestions>"]
    },
    "return": {
      "date": "${endDate}",
      "route": "<actual return route>",
      "suggestions": ["<real airline suggestions>"]
    }
  },
  "accommodation": {
    "type": "${accommodationType}",
    "recommendations": ["<personalized recommendations based on their preferences>"],
    "estimatedCost": "<cost estimate>"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "${startDate}",
      "activities": [
        {
          "time": "<time>",
          "activity": "<activity personalized to their interests>",
          "location": "<location>",
          "notes": "<notes>"
        }
      ]
    }
  ],
  "transport": {
    "type": "<transportation method>",
    "recommendations": ["<recommendations>"]
  },
  "activities": [
    {
      "name": "<activity name matching their interests>",
      "location": "<location>",
      "description": "<description>",
      "estimatedCost": "<cost>"
    }
  ],
  "totalEstimatedCost": "<total estimate>",
  "notes": "<personalized notes based on what they shared>"
}
\`\`\`

Make the plan feel personalized and unique to them!`;
  }
  
  // Continue conversation to gather SPECIFIC preferences needed for real research
  if (!hasDestination) {
    return `The user hasn't mentioned a destination yet. Ask them in a friendly, conversational way: "I'd love to help you plan an amazing trip! Where are you thinking of going?" or "What destination is calling to you?"

Be warm and engaging.`;
  }
  
  // We have destination - now gather SPECIFIC details needed for real research
  const missingInfo: {key: string, question: string, priority: number}[] = [];
  
  if (!preferences.origin) {
    missingInfo.push({
      key: 'origin',
      question: `Great choice! ${preferences.destination} is amazing. To find you the best flights and routes, where will you be flying from? What city or airport?`,
      priority: 1
    });
  }
  
  if (!preferences.startDate || !preferences.endDate) {
    missingInfo.push({
      key: 'dates',
      question: `Perfect! When are you planning to travel? I need specific dates (like "June 15-22, 2024") so I can check flight availability and prices, plus see what events or seasonal things are happening during your visit.`,
      priority: 2
    });
  }
  
  if (!preferences.interests || preferences.interests.length === 0) {
    missingInfo.push({
      key: 'interests',
      question: `I want to make this trip perfect for you! Tell me what you're passionate about - are you into specific types of art (like contemporary, Renaissance, street art)? Food (fine dining, street food, specific cuisines)? Nightlife? Nature? History? Museums? The more details you share, the better I can research specific places you'll love!`,
      priority: 3
    });
  }
  
  if (!preferences.budget) {
    missingInfo.push({
      key: 'budget',
      question: `To give you accurate recommendations, what's your budget range? Are you thinking budget-friendly, mid-range, or luxury? A specific dollar amount helps me find accommodations and activities that fit perfectly.`,
      priority: 4
    });
  }
  
  if (!preferences.travelers) {
    missingInfo.push({
      key: 'travelers',
      question: `How many people will be traveling? This helps me recommend the right accommodations and activities.`,
      priority: 5
    });
  }
  
  // STOP ASKING after we have: destination + origin + dates + budget + travelers
  // OR after 6+ messages with destination + dates
  const hasAllRequired = hasDestination && hasDates && hasOrigin && hasBudget && preferences.travelers;
  
  if (hasAllRequired || (hasDestination && hasDates && messageCount >= 6)) {
    // System will scrape automatically - just tell AI to generate
    return `STOP ASKING QUESTIONS. You have gathered all the information needed.

The user has provided:
- Destination: ${preferences.destination}
- Origin: ${preferences.origin || 'RDU'}
- Dates: ${preferences.startDate} to ${preferences.endDate}
- Budget: ${preferences.budget || '$2000 per person'}
- Travelers: ${preferences.travelers || 2}
- Interests: ${preferences.interests?.join(', ') || 'General sightseeing and food'}

CONVERSATION HISTORY:
${conversationHistory}

The system has scraped REAL data from the internet (flights, hotels, restaurants). Use that scraped data to create a detailed, personalized trip plan. 

Respond conversationally first (2-3 sentences acknowledging what they shared), then provide the complete JSON plan with REAL information from the scraped data. Include specific flight details, hotel names with addresses and prices, restaurant recommendations, and a day-by-day itinerary.`;
  }
  
  // Ask questions in priority order, but STOP after 5 messages
  if (missingInfo.length > 0 && messageCount < 5) {
    const nextQuestion = missingInfo.sort((a, b) => a.priority - b.priority)[0];
    
    return `You're having a great conversation! The user wants to visit ${preferences.destination}. 

Ask them this question naturally: "${nextQuestion.question}"

Make it feel like a real conversation - show you're listening and that you need this specific info to do proper research for them. Be warm and conversational, not robotic.`;
  }
  
  // Fallback: generate with what we have
  return `STOP ASKING QUESTIONS. You have enough information. Create a personalized trip plan using REAL, CURRENT information based on everything the user shared. Use the conversation history to extract details. Respond conversationally first (2-3 sentences), showing you've done research, then provide the JSON plan.`;
}

export function extractPreferences(userMessage: string, currentPreferences: TripPreferences): TripPreferences {
  const updated = { ...currentPreferences };
  const lowerMessage = userMessage.toLowerCase();

  // Extract destination - more flexible patterns
  const destinationPatterns = [
    /(?:going to|traveling to|visiting|destination is|trip to|planning to go to|want to go to|heading to|travel to)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|,|$|\s+from|\s+on|\s+with|\s+for)/i,
    /(?:to|in|visit)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|$|\s+from|\s+on|\s+with|\s+for)/i,
    /(?:I want to|I'd like to|planning|plan)\s+(?:a trip to|to visit|to go to)?\s*([A-Z][a-zA-Z\s]+?)(?:\.|,|$|\s+from)/i,
  ];
  for (const pattern of destinationPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      let dest = match[1].trim();
      // Clean up common trailing words
      dest = dest.replace(/\s+(from|on|with|for|in|at|the).*$/i, '').trim();
      if (dest.length > 1 && dest.length < 50) {
        updated.destination = dest;
        break;
      }
    }
  }
  
  // Also check for common city names mentioned
  const commonCities = ['paris', 'tokyo', 'london', 'new york', 'san francisco', 'los angeles', 'barcelona', 'rome', 'dubai', 'singapore', 'bangkok', 'sydney', 'amsterdam', 'berlin', 'madrid'];
  for (const city of commonCities) {
    if (lowerMessage.includes(city) && !updated.destination) {
      updated.destination = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // Extract origin - more flexible patterns including airport codes
  const originPatterns = [
    /(?:from|leaving from|departing from|flying from)\s+([A-Z]{3}|[A-Z][a-zA-Z\s]+?)(?:\.|,|$|\s+to|\s+on|\s+with)/i,
    /\b([A-Z]{3})\s+(?:from|to|in|on)\b/i, // Airport codes like "RDU from"
    /\b([A-Z]{3})\b/i, // Standalone airport codes if context suggests origin
  ];
  for (const originPattern of originPatterns) {
    const match = userMessage.match(originPattern);
    if (match && match[1]) {
      const origin = match[1].trim();
      // If it's an airport code, expand it
      if (origin.length === 3 && origin === origin.toUpperCase()) {
        const airportNames: {[key: string]: string} = {
          'RDU': 'Raleigh-Durham (RDU)',
          'JFK': 'New York (JFK)',
          'LAX': 'Los Angeles (LAX)',
          'SFO': 'San Francisco (SFO)',
          'ORD': 'Chicago (ORD)',
          'DFW': 'Dallas (DFW)',
          'ATL': 'Atlanta (ATL)',
        };
        updated.origin = airportNames[origin] || origin;
      } else {
        updated.origin = origin;
      }
      break;
    }
  }

  // Extract dates - more flexible patterns including "june 5-13" format
  const dateRangePattern = /(\w+)\s+(\d{1,2})\s*[-–—]\s*(\d{1,2})/i; // "june 5-13" or "June 5-13"
  const dateRangeMatch = userMessage.match(dateRangePattern);
  if (dateRangeMatch) {
    const month = dateRangeMatch[1];
    const startDay = dateRangeMatch[2];
    const endDay = dateRangeMatch[3];
    updated.startDate = `${month} ${startDay}, 2024`;
    updated.endDate = `${month} ${endDay}, 2024`;
  } else {
    const datePatterns = [
      /(?:from|starting|beginning|departing|leaving|on)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(?:to|until|through)/i,
      /(?:in|during|for)\s+(\w+\s+\d{4}|\w+\s+\d{1,2})/i, // "in June 2024" or "in June"
    ];
    for (const pattern of datePatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        updated.startDate = match[1].trim();
        break;
      }
    }

    const endDatePatterns = [
      /(?:to|until|through|ending|returning)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/i,
      /(?:for|duration of)\s+(\d+)\s+(?:days|weeks)/i, // "for 7 days"
    ];
    for (const pattern of endDatePatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        updated.endDate = match[1].trim();
        break;
      }
    }
    
    // Extract duration and calculate end date if start date exists
    const durationMatch = userMessage.match(/(?:for|duration of|staying)\s+(\d+)\s+(?:days|day)/i);
    if (durationMatch && updated.startDate && !updated.endDate) {
      // Simple duration calculation - in real app would parse dates properly
      updated.endDate = `${updated.startDate} + ${durationMatch[1]} days`;
    }
  }

  // Extract budget
  const budgetPatterns = [
    /(?:budget|spending|cost|price)\s+(?:of|is|around|about)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
  ];
  for (const pattern of budgetPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      updated.budget = `$${match[1]}`;
      break;
    }
  }

  // Extract number of travelers
  const travelersPatterns = [
    /(\d+)\s+(?:people|travelers|persons|guests|adults)/i,
    /(?:traveling|going)\s+(?:with|as)\s+(\d+)/i,
  ];
  for (const pattern of travelersPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      updated.travelers = parseInt(match[1], 10);
      break;
    }
  }

  // Extract accommodation type
  if (lowerMessage.includes('hotel')) updated.accommodationType = 'hotel';
  else if (lowerMessage.includes('airbnb') || lowerMessage.includes('apartment')) updated.accommodationType = 'airbnb';
  else if (lowerMessage.includes('hostel')) updated.accommodationType = 'hostel';

  // Extract interests
  const interests: string[] = [];
  if (lowerMessage.includes('sightseeing') || lowerMessage.includes('sightseeing')) interests.push('sightseeing');
  if (lowerMessage.includes('nightlife') || lowerMessage.includes('night life')) interests.push('nightlife');
  if (lowerMessage.includes('nature') || lowerMessage.includes('hiking') || lowerMessage.includes('outdoor')) interests.push('nature');
  if (lowerMessage.includes('culture') || lowerMessage.includes('museum') || lowerMessage.includes('art')) interests.push('culture');
  if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('cuisine')) interests.push('food');
  if (interests.length > 0) updated.interests = interests;

  return updated;
}
