/**
 * API route for chat interactions with the trip planning AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from '@/lib/llm';
import { SYSTEM_PROMPT, buildPlanningPrompt, extractPreferences } from '@/lib/prompts';
import { TripPreferences, Message } from '@/types/trip';
import { TravelScraper } from '@/lib/scraper';

// In-memory state storage (per session)
// RESET: Each conversation starts fresh - no persistence between requests
const sessionState = new Map<string, {
  messages: Message[];
  preferences: TripPreferences;
  createdAt: number;
}>();

// Clean up old sessions (older than 1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, state] of sessionState.entries()) {
    if (state.createdAt && (now - state.createdAt) > SESSION_TIMEOUT) {
      sessionState.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // RESET: Always start fresh - generate new session ID each time
    // This ensures the AI always asks questions from the beginning
    const sessionIdToUse = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create fresh state for this conversation
    const state: {
      messages: Message[];
      preferences: TripPreferences;
      createdAt: number;
    } = {
      messages: [],
      preferences: {},
      createdAt: Date.now(),
    };
    sessionState.set(sessionIdToUse, state);

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    state.messages.push(userMessage);

    // Extract preferences from user message
    state.preferences = extractPreferences(message, state.preferences);

    // Get API key from environment (supports GITHUB_TOKEN for Azure endpoint)
    const apiKey = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set GITHUB_TOKEN or OPENAI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    // Use Azure OpenAI-compatible endpoint (can be overridden via env var)
    const baseURL = process.env.OPENAI_BASE_URL || 'https://models.inference.ai.azure.com';

    // Initialize LLM client
    const llmClient = new LLMClient({
      apiKey,
      baseURL,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    });

    // Build conversation history
    const conversationHistory = state.messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    // Check if we have enough info to scrape (destination + origin + dates + budget + travelers)
    const hasEnoughToScrape = 
      state.preferences.destination &&
      state.preferences.origin &&
      state.preferences.startDate &&
      state.preferences.endDate &&
      state.preferences.budget &&
      state.preferences.travelers;

    // Scrape data FIRST if we have enough info
    let scrapedData = null;
    if (hasEnoughToScrape) {
      try {
        // Scrape real data from the internet
        const scraper = new TravelScraper();
        
        const [flights, hotels, restaurants] = await Promise.all([
          scraper.scrapeFlights({
            destination: state.preferences.destination || '',
            origin: state.preferences.origin || '',
            startDate: state.preferences.startDate || '',
            endDate: state.preferences.endDate || '',
            budget: state.preferences.budget || '',
            travelers: state.preferences.travelers || 2,
            interests: state.preferences.interests || [],
          }),
          scraper.scrapeHotels({
            destination: state.preferences.destination || '',
            startDate: state.preferences.startDate || '',
            endDate: state.preferences.endDate || '',
            travelers: state.preferences.travelers || 2,
            budget: state.preferences.budget || '',
          }),
          scraper.scrapeRestaurants({
            destination: state.preferences.destination || '',
            interests: state.preferences.interests || [],
          }),
        ]);

        scrapedData = { flights, hotels, restaurants };
        await scraper.close();
      } catch (scrapeError) {
        console.error('Scraping error:', scrapeError);
        // Continue even if scraping fails - will use fallback data
      }
    }

    // Build planning prompt (with scraped data if available)
    const planningPrompt = buildPlanningPrompt(state.preferences, conversationHistory, scrapedData);

    // Prepare messages for LLM
    const llmMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...state.messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: planningPrompt },
    ];

    // Get response from LLM (with scraped data in the prompt)
    let assistantResponse = await llmClient.chat(llmMessages);

    // Add assistant message
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
    };
    state.messages.push(assistantMessage);

    // Check if response contains JSON trip plan
    let tripPlan = null;
    const jsonMatch = assistantResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                     assistantResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        tripPlan = JSON.parse(jsonStr);
      } catch (e) {
        // JSON parsing failed, that's okay - it's just a conversational response
      }
    }

    // Determine if planning is complete - more lenient: just need destination and a plan
    const hasEnoughInfo = 
      state.preferences.destination &&
      tripPlan;

    // RESET: Clear session state after generating a plan so next conversation starts fresh
    if (hasEnoughInfo && tripPlan) {
      // Optionally keep it for a short time, then delete
      setTimeout(() => {
        sessionState.delete(sessionIdToUse);
      }, 60000); // Delete after 1 minute
    }

    return NextResponse.json({
      sessionId: sessionIdToUse,
      message: assistantMessage,
      preferences: state.preferences,
      isPlanningComplete: hasEnoughInfo,
      tripPlan: tripPlan || undefined,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
