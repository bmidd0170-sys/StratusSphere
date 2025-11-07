import React from 'react';

function WeatherHighlights({ data }) {
  if (!data || !data.current) {
    return null;
  }

  const { current } = data;

  const highlights = [
    { label: '💧 Humidity', value: `${current.humidity}%` },
    { label: '💨 Wind Speed', value: `${Math.round(current.wind_kph)} km/h` },
    { label: '🌡️ Feels Like', value: `${Math.round(current.feelslike_c)}°C` },
    { label: '👁️ Visibility', value: 'Good' },
  ];

  return (
    <section className="weather-highlights">
      <h3>Today's Highlights</h3>
      <div className="highlights-grid">
        {highlights.map((item, idx) => (
          <div key={idx} className="highlight-card">
            <p className="highlight-label">{item.label}</p>
            <p className="highlight-value">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeatherHighlights;
