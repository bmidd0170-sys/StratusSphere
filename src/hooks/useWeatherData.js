/**
 * Custom hook to fetch real-time weather data from Tomorrow.io API
 */

export async function getWeatherByCoordinates(latitude, longitude) {
  const apiKey = import.meta.env.VITE_TOMORROW_IO_API_KEY;

  if (!apiKey) {
    throw new Error("Tomorrow.io API key not configured. Please add VITE_TOMORROW_IO_API_KEY to .env");
  }

  try {
    const url = `https://api.tomorrow.io/v4/weather/forecast?location=${latitude},${longitude}&apikey=${apiKey}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Tomorrow.io API error:`, response.status, response.statusText);
      throw new Error("Failed to fetch weather data");
    }

    const data = await response.json();
    console.log("Real-time weather from Tomorrow.io:", data);
    
    return formatTomorrowIOData(data);
  } catch (error) {
    console.error("Error fetching weather from Tomorrow.io:", error);
    throw error;
  }
}

/**
 * Geocode city name to coordinates using Open-Meteo (free, no key needed)
 */
export async function geocodeCity(city) {
  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.warn(`City not found: ${city}`);
      return null;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    console.log(`Geocoded: ${name}, ${country} (${latitude}, ${longitude})`);
    
    return { latitude, longitude, name, country };
  } catch (error) {
    console.error("Error geocoding city:", error);
    return null;
  }
}

/**
 * Get weather by city name
 */
export async function getWeatherByCity(city) {
  const location = await geocodeCity(city);
  if (!location) return null;

  const weather = await getWeatherByCoordinates(location.latitude, location.longitude);
  return { ...weather, location };
}

/**
 * Format Tomorrow.io response to match your existing data structure
 */
function formatTomorrowIOData(data) {
  const current = data.timelines.minutely[0];
  const daily = data.timelines.daily;
  const hourly = data.timelines.hourly;

  return {
    location: data.location,
    current: {
      temp_c: current.values.temperature,
      temp_f: (current.values.temperature * 9/5) + 32,
      humidity: current.values.humidity,
      wind_kph: current.values.windSpeed * 1.60934, // Convert mph to kph
      feelslike_c: current.values.temperatureApparent,
      condition: {
        text: current.values.weatherCode,
        icon: getWeatherIcon(current.values.weatherCode),
      },
    },
    forecast: {
      forecastday: daily.map((day, idx) => ({
        date: day.time.split('T')[0],
        day: {
          maxtemp_c: day.values.temperatureMax,
          mintemp_c: day.values.temperatureMin,
          condition: {
            text: day.values.weatherCode,
            icon: getWeatherIcon(day.values.weatherCode),
          },
        },
        hour: hourly
          .filter(hour => hour.time.startsWith(day.time.split('T')[0]))
          .map(hour => ({
            time: hour.time,
            temp_c: hour.values.temperature,
            condition: {
              text: hour.values.weatherCode,
              icon: getWeatherIcon(hour.values.weatherCode),
            },
          })),
      })),
    },
  };
}

/**
 * Map Tomorrow.io weather codes to readable text and icons
 */
function getWeatherIcon(weatherCode) {
  const weatherMap = {
    0: { text: "Clear", icon: "☀️" },
    1: { text: "Cloudy", icon: "☁️" },
    2: { text: "Mostly Cloudy", icon: "🌤️" },
    3: { text: "Partly Cloudy", icon: "⛅" },
    4: { text: "Overcast", icon: "☁️" },
    5: { text: "Drizzle", icon: "🌦️" },
    6: { text: "Rain", icon: "🌧️" },
    7: { text: "Snow", icon: "❄️" },
    8: { text: "Freezing Rain", icon: "🧊" },
    9: { text: "Thunderstorm", icon: "⛈️" },
  };
  
  const weather = weatherMap[weatherCode] || { text: "Unknown", icon: "🌍" };
  return weather.icon;
}
