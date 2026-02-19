# Web Scraping Integration Guide

## Overview

This guide explains how to add web scraping functionality to get real-time travel information from the internet and integrate it into your conversational trip planning AI.

## Architecture

### 1. Scraper Service (`lib/scraper.ts`)

The `TravelScraper` class handles web scraping using Puppeteer:

- **Flights**: Scrapes Google Flights for real-time flight prices and routes
- **Hotels**: Scrapes Booking.com for hotel availability and prices
- **Restaurants**: Scrapes Google Maps/TripAdvisor for restaurant recommendations

### 2. Integration Flow

```
User Message
    ↓
Extract Preferences
    ↓
LLM Generates Response
    ↓
Check if "SCRAPE_NOW" in response OR has enough info
    ↓
Scrape Real Data (Flights, Hotels, Restaurants)
    ↓
Pass Scraped Data to LLM
    ↓
LLM Generates Plan with Real Data
    ↓
Return to User
```

## Setup

### 1. Install Dependencies

```bash
npm install puppeteer cheerio
npm install --save-dev @types/puppeteer
```

### 2. Environment Variables

Add to `.env.local`:

```env
# Optional: Scraping configuration
ENABLE_SCRAPING=true
SCRAPING_TIMEOUT=30000
```

### 3. Usage in API Route

The scraping is automatically triggered when:
- The AI response contains "SCRAPE_NOW"
- OR when you have destination + origin + dates (enough info to scrape)

## How It Works

### Conversational Flow

1. **User**: "I want to visit Paris"
2. **AI**: "Great! Where will you be flying from?"
3. **User**: "RDU from June 5-13"
4. **AI**: "Perfect! What's your budget?"
5. **User**: "$2000 per person"
6. **AI**: [Detects enough info] → **SCRAPES** flights, hotels, restaurants
7. **AI**: [Uses scraped data] → Generates plan with REAL prices and options

### Scraping Process

```typescript
// In app/api/chat/route.ts
if (shouldScrape) {
  const scraper = new TravelScraper();
  
  const [flights, hotels, restaurants] = await Promise.all([
    scraper.scrapeFlights(options),
    scraper.scrapeHotels(options),
    scraper.scrapeRestaurants(options),
  ]);
  
  // Pass to LLM to generate plan
}
```

## Alternative: Using APIs Instead

For production, consider using APIs instead of scraping:

### Flight APIs
- **Amadeus API**: https://developers.amadeus.com
- **Skyscanner API**: https://developers.skyscanner.net
- **Google Flights API**: (Limited access)

### Hotel APIs
- **Booking.com API**: https://developers.booking.com
- **Hotels.com API**: https://developer.hotels.com
- **Amadeus Hotel API**

### Restaurant APIs
- **Google Places API**: https://developers.google.com/maps/documentation/places
- **Yelp Fusion API**: https://www.yelp.com/developers
- **TripAdvisor API**: https://developer.tripadvisor.com

### Example API Integration

```typescript
// lib/api-services.ts
export async function fetchFlightsViaAPI(origin: string, dest: string, date: string) {
  const response = await fetch(
    `https://api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${dest}&departureDate=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.AMADEUS_API_KEY}`,
      },
    }
  );
  return await response.json();
}
```

## Customization

### 1. Add More Scraping Sources

Edit `lib/scraper.ts` to add more sources:

```typescript
async scrapeActivities(options: ScrapeOptions): Promise<ActivityInfo[]> {
  // Scrape TripAdvisor, Viator, etc.
}
```

### 2. Adjust Scraping Selectors

Update selectors in `scraper.ts` if websites change:

```typescript
await page.waitForSelector('[data-testid="flight-card"]', { timeout: 10000 });
```

### 3. Add Caching

Cache scraped data to avoid repeated requests:

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({ max: 100, ttl: 3600000 });

async scrapeFlights(options: ScrapeOptions) {
  const cacheKey = `flights-${options.origin}-${options.destination}-${options.startDate}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  // ... scrape ...
  cache.set(cacheKey, flights);
  return flights;
}
```

## Error Handling

The scraper includes fallback data if scraping fails:

```typescript
try {
  return await this.scrapeFlights(options);
} catch (error) {
  console.error('Scraping error:', error);
  return this.getFallbackFlights(options);
}
```

## Best Practices

1. **Rate Limiting**: Add delays between requests to avoid being blocked
2. **User-Agent**: Set realistic user agents
3. **Error Handling**: Always have fallback data
4. **Caching**: Cache results to reduce scraping
5. **APIs First**: Use APIs when available, scraping as fallback
6. **Respect robots.txt**: Check robots.txt before scraping

## Testing

Test scraping in isolation:

```typescript
// test-scraper.ts
import { TravelScraper } from './lib/scraper';

async function test() {
  const scraper = new TravelScraper();
  const flights = await scraper.scrapeFlights({
    destination: 'Paris',
    origin: 'RDU',
    startDate: 'June 5, 2024',
  });
  console.log(flights);
  await scraper.close();
}
```

## Production Considerations

1. **Use Headless Browser**: Puppeteer runs headless by default
2. **Resource Limits**: Scraping is resource-intensive, consider queueing
3. **Legal Compliance**: Ensure scraping is legal for your use case
4. **API Alternatives**: Prefer APIs over scraping for reliability
5. **Monitoring**: Monitor scraping success rates and errors

## Next Steps

1. Install dependencies: `npm install puppeteer cheerio`
2. Test scraping: Run the scraper on a test case
3. Integrate with API: The code is already integrated in `app/api/chat/route.ts`
4. Add more sources: Extend scraper for more data sources
5. Consider APIs: Evaluate API options for production
