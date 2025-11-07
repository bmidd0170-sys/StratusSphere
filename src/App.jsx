import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import WeatherHighlights from "./components/WeatherHighlights";
import ChatBox from "./components/ChatBox";
import AboutPage from "./pages/AboutPage";
import { sendChatMessage, getWeatherForCity } from "./hooks/useWeatherChat";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Ask me about the weather in any location, climate information, or anything else!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMoreHourly, setShowMoreHourly] = useState(false);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const handleSendMessage = async (userMessage) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Get response from OpenAI
      const { assistantMessage, city } = await sendChatMessage(userMessage, messages);

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);

      // If a city was mentioned, try to fetch weather data
      if (city) {
        const weather = await getWeatherForCity(city);
        if (weather) {
          setWeatherData(weather);
        }
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to process your request. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* About Page - Landing Page */}
        <Route path="/" element={<AboutPage />} />
        
        {/* Weather App - Main App */}
        <Route path="/weather" element={
          <div className="app">
            {/* Header Section */}
            <header className="header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '1rem' }}>
                <h1 className="title glow">
                  <span className="glow-icon">☁️</span> StratusSphere
                </h1>
                <Link 
                  to="/" 
                  className="nav-link-about"
                >
                  About
                </Link>
              </div>
              <p className="subtitle glow-soft">Chasing storms. Perfecting precision. ⚡</p>
            </header>

            {/* Main Content Wrapper */}
            <div className="main-content-wrapper">
              {/* Left Side - Weather Content */}
              <div className="weather-content">
                {/* AI Search Bar */}
                <section className="search-container">
                  <SearchBar onSendMessage={handleSendMessage} isLoading={isLoading} />
                </section>

                <div className="divider"></div>

                {/* Current Weather Card */}
                {weatherData && <WeatherCard data={weatherData} />}

                {/* Today's Highlights */}
                {weatherData && <WeatherHighlights data={weatherData} />}

                <div className="divider"></div>

                {/* Hourly Forecast */}
                {weatherData && weatherData.forecast && weatherData.forecast.forecastday && weatherData.forecast.forecastday.length > 0 && (
                  <section className="hourly-forecast">
                    <button 
                      className="forecast-header-btn"
                      onClick={() => setShowHourlyForecast(!showHourlyForecast)}
                    >
                      <span>📅 Weekly Forecast</span>
                      <span className="toggle-icon">{showHourlyForecast ? '▼' : '▶'}</span>
                    </button>
                    
                    {showHourlyForecast && (
                      <>
                        {/* Day Selection Tabs - Show all available days with full weekday names */}
                        <div className="day-selector">
                          {weatherData.forecast.forecastday.map((day, idx) => {
                            const dayDate = new Date(day.date);
                            const weekday = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                            return (
                              <button
                                key={idx}
                                className={`day-tab ${selectedDay === idx ? 'active' : ''}`}
                                onClick={() => setSelectedDay(idx)}
                                title={dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                              >
                                {weekday}
                              </button>
                            );
                          })}
                        </div>

                        {/* Hourly Data for Selected Day */}
                        {(() => {
                          const selectedDayData = weatherData.forecast.forecastday[selectedDay];
                          if (!selectedDayData) return null;
                          
                          // Always show all 24 hours for the selected day
                          const allHourlyData = selectedDayData.hour || [];
                          const hourlyData = allHourlyData.filter((_, idx) => idx % 3 === 0);
                          
                          return (
                            <>
                              <div className="hourly-scroll">
                                {(showMoreHourly ? allHourlyData : hourlyData).map((hour, idx) => (
                                  <article key={idx} className="hourly-item-forecast">
                                    <p className="time">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                                    <img src={`https:${hour.condition.icon}`} alt={hour.condition.text} />
                                    <p className="temp">{Math.round(hour.temp_c)}°</p>
                                  </article>
                                ))}
                              </div>
                              <button className="see-more-btn" onClick={() => setShowMoreHourly(!showMoreHourly)}>
                                {showMoreHourly ? '▼ Less' : '▲ More'}
                              </button>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </section>
                )}
              </div>

              {/* Right Side - Chat Sidebar */}
              <button 
                className="chat-toggle-btn"
                onClick={() => setShowChat(!showChat)}
                title={showChat ? "Close Chat" : "Open Chat"}
              >
                {showChat ? '✕' : '💬'}
              </button>
              
              {showChat && <ChatBox messages={messages} isLoading={isLoading} />}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', padding: '2rem', marginTop: '2rem' }}>
              <p style={{ color: "#B3B7C4", fontSize: "1.1rem", fontWeight: "500", letterSpacing: "0.5px", margin: 0 }}>
                Designed with React & Vite ⚡ by the StormStream Team
              </p>
            </footer>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
