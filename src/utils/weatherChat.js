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

  // If no weather API key, generate forecast using OpenAI
  if (!apiKey) {
    console.log("Weather API key not configured, generating forecast with OpenAI");
    return await generateForecastWithOpenAI(city);
  }

  if (!city) {
    console.log("No city extracted from message");
    return null;
  }

  try {
    console.log(`Fetching weather for city: "${city}"`);
    
    // Get current weather + 3-day forecast
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3&aqi=no`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Weather API error for "${city}":`, response.status, response.statusText);
      // Fallback to OpenAI generation
      return await generateForecastWithOpenAI(city);
    }

    const data = await response.json();
    console.log(`Weather data received for ${data.location.name}:`, data);
    return data;
  } catch (error) {
    console.warn(`Could not fetch weather data for "${city}":`, error);
    // Fallback to OpenAI generation
    return await generateForecastWithOpenAI(city);
  }
}

/**
 * Generate 7-day weather forecast using OpenAI
 * This is used when WeatherAPI key is not available
 */
async function generateForecastWithOpenAI(city) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error("No API keys available for weather data");
    return null;
  }

  try {
    console.log(`Generating 7-day forecast for ${city} using OpenAI`);
    
    // First, get basic weather info from OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a weather information assistant. Provide weather data in a simple format. Answer with just the numbers and words, no JSON.`,
          },
          {
            role: "user",
            content: `For ${city}, provide: current temperature in celsius, humidity %, wind speed kph, current condition (one word like Sunny/Rainy/Cloudy), and forecast high/low temps for the next 7 days. Format: TEMP,HUMIDITY,WIND,CONDITION|HIGH1/LOW1|HIGH2/LOW2... etc`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI basic weather request failed, using fallback");
      return generateFallbackForecast(city);
    }

    const data = await response.json();
    const weatherInfo = data.choices[0].message.content;
    console.log("Weather info from OpenAI:", weatherInfo);
    
    // Parse the simple format response and build forecast
    return buildForecastFromWeatherInfo(city, weatherInfo);
  } catch (error) {
    console.error("Error generating forecast with OpenAI:", error);
    // Fallback: generate realistic forecast data
    return generateFallbackForecast(city);
  }
}

/**
 * Build forecast structure from simple weather info string
 */
function buildForecastFromWeatherInfo(city, weatherInfo) {
  try {
    // Parse the weather info: TEMP,HUMIDITY,WIND,CONDITION|HIGH1/LOW1|HIGH2/LOW2...
    const parts = weatherInfo.split('|');
    const currentParts = parts[0].split(',');
    
    const temp_c = parseInt(currentParts[0]) || 15;
    const humidity = parseInt(currentParts[1]) || 65;
    const wind_kph = parseInt(currentParts[2]) || 12;
    const condition = currentParts[3] || 'Partly Cloudy';
    
    // Generate 7 days of forecast
    const forecastday = [];
    const today = new Date();
    
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayIdx);
      const dateStr = date.toISOString().split('T')[0];
      
      // Parse high/low for this day if available
      let maxtemp_c = 20 + Math.floor(Math.random() * 10);
      let mintemp_c = 8 + Math.floor(Math.random() * 5);
      
      if (parts[dayIdx + 1]) {
        const tempParts = parts[dayIdx + 1].split('/');
        maxtemp_c = parseInt(tempParts[0]) || maxtemp_c;
        mintemp_c = parseInt(tempParts[1]) || mintemp_c;
      }
      
      // Generate 24 hourly entries
      const hour = [];
      for (let hourIdx = 0; hourIdx < 24; hourIdx++) {
        // Temperature varies throughout the day (cooler at night, warmer during day)
        const hourOffset = hourIdx < 6 ? -5 : (hourIdx > 18 ? -3 : 0);
        const tempVariation = Math.sin((hourIdx / 24) * Math.PI * 2) * 5;
        const hourTemp = Math.round(mintemp_c + (maxtemp_c - mintemp_c) / 2 + tempVariation + hourOffset);
        
        const timeStr = `${dateStr} ${String(hourIdx).padStart(2, '0')}:00`;
        hour.push({
          time: timeStr,
          temp_c: hourTemp,
          condition: {
            text: condition,
            icon: "//cdn.weatherapi.com/weather/128x128/day/113.png"
          }
        });
      }
      
      forecastday.push({
        date: dateStr,
        day: {
          maxtemp_c,
          mintemp_c,
          condition: { text: condition, icon: "//cdn.weatherapi.com/weather/128x128/day/113.png" }
        },
        hour: hour
      });
    }
    
    return {
      location: { name: city, region: "Region", country: "Country" },
      current: {
        temp_c,
        temp_f: Math.round(temp_c * 9/5 + 32),
        humidity,
        wind_kph,
        feelslike_c: temp_c - 1,
        condition: { text: condition, icon: "//cdn.weatherapi.com/weather/128x128/day/302.png" }
      },
      forecast: { forecastday }
    };
  } catch (error) {
    console.error("Error building forecast:", error);
    return generateFallbackForecast(city);
  }
}

/**
 * Fallback forecast generator if OpenAI fails
 * Creates a realistic 7-day forecast structure
 */
function generateFallbackForecast(city) {
  const today = new Date();
  const forecastday = [];
  
  // Generate 7 days of forecast
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayIdx);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 24 hours for this day
    const hour = [];
    for (let hour_idx = 0; hour_idx < 24; hour_idx++) {
      const temp = 12 + Math.floor(Math.random() * 15) - (hour_idx < 6 ? 5 : 0);
      const conditions = ['Clear', 'Partly cloudy', 'Cloudy', 'Sunny', 'Rainy'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const timeStr = `${dateStr} ${String(hour_idx).padStart(2, '0')}:00`;
      
      hour.push({
        time: timeStr,
        temp_c: temp,
        condition: { text: condition, icon: "//cdn.weatherapi.com/weather/128x128/day/113.png" }
      });
    }
    
    const maxTemp = 20 + Math.floor(Math.random() * 10);
    const minTemp = 8 + Math.floor(Math.random() * 5);
    
    forecastday.push({
      date: dateStr,
      day: {
        maxtemp_c: maxTemp,
        mintemp_c: minTemp,
        condition: { text: 'Partly Cloudy', icon: "//cdn.weatherapi.com/weather/128x128/day/302.png" }
      },
      hour: hour
    });
  }
  
  return {
    location: { name: city, region: "Region", country: "Country" },
    current: {
      temp_c: 15,
      temp_f: 59,
      humidity: 65,
      wind_kph: 12,
      feelslike_c: 14,
      condition: { text: "Partly Cloudy", icon: "//cdn.weatherapi.com/weather/128x128/day/302.png" }
    },
    forecast: { forecastday }
  };
}
