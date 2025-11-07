import React from 'react';

/**
 * Utility to handle OpenAI chat integration for weather queries
 * OpenAI provides context, real-time weather API provides live data
 */

/**
 * Fetch REAL-TIME weather data using Open-Meteo (free, no API key needed)
 */
async function fetchRealTimeWeather(city) {
  try {
    console.log(`Starting weather fetch for: "${city}"`);
    
    // Geocode the city to get coordinates
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;
    console.log(`Geocoding URL: ${geoUrl}`);
    
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    console.log(`Geocoding results:`, geoData);

    if (!geoData.results || geoData.results.length === 0) {
      console.warn(`❌ City not found: ${city}`);
      return null;
    }

    // Use the first result (most relevant)
    const location = geoData.results[0];
    const { latitude, longitude, name, country, admin1, admin2 } = location;
    
    console.log(`✅ Found: ${name}, ${admin1 || admin2 || ""} ${country} (${latitude}, ${longitude})`);

    // Fetch real-time weather for the coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&forecast_days=7&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    console.log(`Weather URL: ${weatherUrl}`);
    
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      console.warn(`❌ Open-Meteo API error: ${weatherResponse.status}`);
      return null;
    }

    const weatherData = await weatherResponse.json();
    console.log(`✅ Real-time weather data:`, weatherData);

    return {
      location: { name, region: admin1 || admin2, country, latitude, longitude },
      current: {
        temp_c: weatherData.current.temperature_2m,
        temp_f: Math.round(weatherData.current.temperature_2m * 9/5 + 32),
        humidity: weatherData.current.relative_humidity_2m,
        wind_kph: Math.round(weatherData.current.wind_speed_10m * 100) / 100,
        feelslike_c: Math.round(weatherData.current.temperature_2m - (weatherData.current.wind_speed_10m / 10)),
        condition: {
          text: getWeatherCondition(weatherData.current.weather_code),
          icon: "//cdn.weatherapi.com/weather/128x128/day/302.png",
        },
      },
      forecast: {
        forecastday: weatherData.daily.time.map((date, idx) => ({
          date,
          day: {
            maxtemp_c: weatherData.daily.temperature_2m_max[idx],
            mintemp_c: weatherData.daily.temperature_2m_min[idx],
            condition: {
              text: getWeatherCondition(weatherData.daily.weather_code[idx]),
              icon: "//cdn.weatherapi.com/weather/128x128/day/302.png",
            },
          },
          hour: weatherData.hourly.time
            .map((time, hourIdx) => ({
              time,
              temp_c: weatherData.hourly.temperature_2m[hourIdx],
              condition: {
                text: getWeatherCondition(weatherData.hourly.weather_code[hourIdx]),
                icon: "//cdn.weatherapi.com/weather/128x128/day/302.png",
              },
            }))
            .filter(h => h.time.startsWith(date)),
        })),
      },
    };
  } catch (error) {
    console.error(`❌ Error fetching real-time weather:`, error);
    return null;
  }
}

/**
 * Convert WMO weather code to readable condition
 */
function getWeatherCondition(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}

/**
 * Enhanced sendChatMessage with REAL-TIME weather context
 */
export async function sendChatMessage(userMessage, conversationHistory) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to .env");
  }

  try {
    // Extract city/location from user message
    const city = extractCityName(userMessage);
    let weatherContext = "";

    // If a location is found, fetch REAL-TIME weather
    if (city) {
      try {
        console.log(`Fetching real-time weather for: ${city}`);
        const realWeather = await fetchRealTimeWeather(city);
        if (realWeather) {
          weatherContext = `
[REAL-TIME WEATHER DATA for ${realWeather.location.name}, ${realWeather.location.region || ""} ${realWeather.location.country}]
Current: ${Math.round(realWeather.current.temp_c)}°C (${realWeather.current.temp_f}°F), ${realWeather.current.condition.text}
Humidity: ${realWeather.current.humidity}%
Wind: ${Math.round(realWeather.current.wind_kph)} kph
Feels like: ${Math.round(realWeather.current.feelslike_c)}°C
`;
        }
      } catch (weatherError) {
        console.warn("Could not fetch real-time weather:", weatherError);
        // Continue without real-time data
      }
    }

    // Send to OpenAI with real-time data context
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
            content: `You are Storm, a helpful and friendly weather assistant. ${weatherContext ? "You have been provided with REAL-TIME weather data. Use this accurate current data in your response." : "Provide helpful weather information based on typical climate patterns."} Be conversational, accurate, and engaging. If you have real-time data, reference it specifically.${weatherContext ? "\n" + weatherContext : ""}`,
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

    return { assistantMessage, city };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

/**
 * Extract city/location name from user message (supports city names and ZIP codes)
 */
function extractCityName(message) {
  const msg = message.toLowerCase();
  const weatherKeywords = ['weather', 'climate', 'forecast', 'temperature', 'conditions', 'rain', 'snow', 'hot', 'cold', 'is it', 'what', 'how'];

  // Strategy 0: Check for 5-digit ZIP codes
  const zipMatch = message.match(/\b(\d{5})\b/);
  if (zipMatch) {
    console.log(`🔍 Detected ZIP code: ${zipMatch[1]}`);
    return zipMatch[1];
  }

  // Strategy 1: Direct patterns like "weather in [City]", "weather for [City]"
  const directPatterns = [
    /(?:weather|forecast|climate|conditions?)\s+(?:in|for|at|near)\s+([A-Za-z\s]+?)(?:\s+(?:weather|forecast|climate|now|today|today's|is|has|\?|\.)|$)/i,
    /in\s+([A-Za-z\s]+?)\s+(?:weather|forecast|climate|conditions?)/i,
    /(?:weather|forecast|climate)\s+(?:in|for)\s+([A-Za-z\s]+?)[\?\.]?$/i,
  ];

    for (const pattern of directPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const city = match[1].trim();
        if (city.length > 1 && !weatherKeywords.includes(city)) {
          console.log(`🔍 Extracted city (direct pattern): ${city}`);
          return city;
        }
      }
    }
  
    // Strategy 2: Capitalized words (likely city names)
    const words = message.split(/\s+/);
    for (const word of words) {
      if (word.match(/^[A-Z][a-z]+$/) && !weatherKeywords.includes(word.toLowerCase())) {
        console.log(`🔍 Extracted city (capitalized word): ${word}`);
        return word;
      }
    }
  
    console.log(`❌ No city found in message`);
    return null;
  }

/**
 * Fetch real-time weather data for a city
 */
export async function getWeatherForCity(city) {
  if (!city) {
    console.log("No city provided");
    return null;
  }

  try {
    console.log(`Fetching weather for: "${city}"`);
    const weather = await fetchRealTimeWeather(city);
    return weather;
  } catch (error) {
    console.warn(`Could not fetch weather data for "${city}":`, error);
    return null;
  }
}
