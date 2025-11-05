import React from "react";

function WeatherCard({ data }) {
  // Handle both weatherapi.com and openweathermap formats
  const isWeatherAPI = data.current; // weatherapi.com format
  
  if (isWeatherAPI) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast; // 3-day forecast
    
    return (
      <section className="card weather-card">
        <section className="current-weather">
          <h2 className="city">{location.name}, {location.region}</h2>
          <p className="temperature">{Math.round(current.temp_c)}°C</p>
          <p className="temperature-f">{Math.round(current.temp_f)}°F</p>
          <p className="condition">{current.condition.text}</p>
          <img
            className="icon"
            src={`https:${current.condition.icon}`}
            alt={current.condition.text}
          />
        </section>

        <section className="weather-details">
          <p>💧 Humidity: {current.humidity}%</p>
          <p>💨 Wind: {Math.round(current.wind_kph)} km/h</p>
          <p>🌡️ Feels like: {Math.round(current.feelslike_c)}°C</p>
        </section>
      </section>
    );
  }

  // OpenWeatherMap format (fallback)
  const code = Number(data?.cod);
  if (code !== 200) {
    const apiMessage = data?.message
      ? String(data.message)
      : "City not found. Try again!";
    const friendly = apiMessage.charAt(0).toUpperCase() + apiMessage.slice(1);
    return <p>{friendly}</p>;
  }

  return (
    <section className="card weather-card">
      <h2 className="city">{data.name}</h2>
      <p className="temperature">{Math.round(data.main.temp)}°C</p>
      <p className="condition">{data.weather[0].description}</p>
      <img
        className="icon"
        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
        alt={data.weather[0].description}
      />
    </section>
  );
}

export default WeatherCard;