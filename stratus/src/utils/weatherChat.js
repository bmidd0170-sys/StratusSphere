/**
 * Utility to handle OpenAI chat integration for weather queries
 * OpenAI provides context, optional weather API provides real-time data
 */

export async function sendChatMessage(userMessage, conversationHistory) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to .env");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful weather assistant. You have knowledge of climate patterns, historical weather data, and general weather information for locations worldwide. When users ask about current/real-time weather, acknowledge that you don't have live data access and suggest they check weather websites. But you can provide: seasonal information, climate facts, historical averages, and general weather patterns. Be helpful, concise, and friendly.",
          },
          ...conversationHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Extract city name from user message
    const city = extractCityName(userMessage);

    return { assistantMessage, city };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

/**
 * Extract city name from user message using multiple strategies
 */
function extractCityName(message) {
  // Clean message
  const msg = message.toLowerCase();

  // Common weather-related keywords to help identify city references
  const weatherKeywords = ['weather', 'climate', 'forecast', 'temperature', 'conditions', 'rain', 'snow', 'hot', 'cold', 'is it', 'what', 'how'];

  // Strategy 1: Direct patterns like "weather in [City]", "weather for [City]"
  const directPatterns = [
    /(?:weather|forecast|climate|conditions?)\s+(?:in|for|at|near)\s+([A-Za-z\s]+?)(?:\s+(?:weather|forecast|climate|now|today|today's|is|has|\?|\.)|$)/i,
    /in\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?:weather|forecast|climate|conditions?)/i,
    /(?:weather|forecast|climate)\s+for\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
  ];

  for (const pattern of directPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const city = match[1].trim();
      // Validate it's a real city (has letters, not too short, not a keyword)
      if (city.length > 2 && !weatherKeywords.includes(city.toLowerCase())) {
        return city.split(/,\s*/)[0]; // Take first part if comma-separated
      }
    }
  }

  // Strategy 2: Look for capitalized words (proper nouns) not at start of message
  const capitalizedWords = message.match(/(?:in|for|at|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
  if (capitalizedWords && capitalizedWords.length > 0) {
    const lastCapitalized = capitalizedWords[capitalizedWords.length - 1];
    const city = lastCapitalized.replace(/^(?:in|for|at|near)\s+/, '').trim();
    if (city.length > 2 && !weatherKeywords.includes(city.toLowerCase())) {
      return city;
    }
  }

  // Strategy 3: Extract city from end of question (common pattern: "How's the weather in [City]?")
  const endPattern = /(?:in|for|at)\s+([A-Za-z\s]+?)[\?\.]?$/i;
  const endMatch = message.match(endPattern);
  if (endMatch && endMatch[1]) {
    const city = endMatch[1].trim();
    if (city.length > 2 && !weatherKeywords.includes(city.toLowerCase())) {
      return city.split(/,\s*/)[0];
    }
  }

  return null;
}

/**
 * Fetch real-time weather data for a city
 */
export async function getWeatherForCity(city) {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // If no weather API key, silently fail (OpenAI response is enough)
  if (!apiKey) {
    console.log("Weather API key not configured, skipping real-time weather");
    return null;
  }

  if (!city) {
    console.log("No city extracted from message");
    return null;
  }

  try {
    console.log(`Fetching weather for city: "${city}"`);
    
    // Get current weather + 10-day forecast
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3&aqi=no`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Weather API error for "${city}":`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log(`Weather data received for ${data.location.name}:`, data);
    return data;
  } catch (error) {
    console.warn(`Could not fetch weather data for "${city}":`, error);
    return null; // Fail gracefully
  }
}
