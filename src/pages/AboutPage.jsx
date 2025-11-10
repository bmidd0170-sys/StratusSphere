import React from "react";
import { useNavigate } from 'react-router-dom';
import "../aboutpage.css";

export default function AboutPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/weather');
  };

  return (
    <div>
      {/* Navigation */}
      <nav>
        <div className="logo">StratusSphere</div>
      </nav>

      {/* Header */}
      <header className="header">
        <h1 className="title">About StratusSphere</h1>
        <p className="subtitle">The Weather App That Actually Makes Sense</p>
      </header>

      {/* Main Content */}
      <main>
        {/* What We Are Section */}
        <section>
          <h2>What is StratusSphere?</h2>
          <p className="about-description">
            StratusSphere reimagines the weather app experience with a clean design and dependable data. It's built for users who value clarity, accuracy, and simplicity—all in one forecast.
          </p>
        </section>

        <div className="divider"></div>

        {/* Why Choose Us Section */}
        <section>
          <h2>Why Choose StratusSphere?</h2>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">🎯</div>
              <h3>Intuitive Design</h3>
              <p>No confusing layouts or overwhelming information. StratusSphere presents weather data in a clean, easy-to-understand format that respects your time.</p>
            </div>

            <div className="card">
              <div className="card-icon">⚡</div>
              <h3>Real-Time Updates</h3>
              <p>Get live weather data updated throughout the day. Our system refreshes continuously so you're always looking at the most current forecast available.</p>
            </div>

            <div className="card">
              <div className="card-icon">📍</div>
              <h3>Location Smart</h3>
              <p>Instantly access weather for your current location, or save multiple cities for quick access. Travel smarter with location-based forecasts.</p>
            </div>

            <div className="card">
              <div className="card-icon">🎨</div>
              <h3>Beautiful Interface</h3>
              <p>A modern, sleek design that makes checking the weather enjoyable. Dark mode by default to reduce eye strain and look amazing on any device.</p>
            </div>

            <div className="card">
              <div className="card-icon">📊</div>
              <h3>Detailed Insights</h3>
              <p>Humidity, wind speed, UV index, and more. Get the details that matter without scrolling through pages of unnecessary information.</p>
            </div>

            <div className="card">
              <div className="card-icon">⚙️</div>
              <h3>No Ads, No Tracking</h3>
              <p>We respect your privacy. StratusSphere is built for you, not for advertisers. Pure weather data without the digital noise.</p>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        {/* Key Features List */}
        <section>
          <h2>Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h4>🌐 Hourly Forecasts</h4>
              <p>See what the weather will be like hour by hour. Plan your day with precision.</p>
            </div>

            <div className="feature-item">
              <h4>📅 7-Day Forecast</h4>
              <p>Get a week-long view of weather patterns to plan ahead with confidence.</p>
            </div>

            <div className="feature-item">
              <h4>🌡️ Multiple Units</h4>
              <p>Celsius, Fahrenheit, or both. Customize your weather display exactly how you want it.</p>
            </div>

            <div className="feature-item">
              <h4>⛈️ Severe Weather Alerts</h4>
              <p>Never be caught off guard. Get notified about dangerous weather conditions in real time.</p>
            </div>

            <div className="feature-item">
              <h4>🌍 Global Coverage</h4>
              <p>Check the weather anywhere in the world. From your hometown to your vacation destination.</p>
            </div>

            <div className="feature-item">
              <h4>📱 Responsive Design</h4>
              <p>Perfect on desktop, tablet, or mobile. Check the weather however you prefer.</p>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        {/* Comparison Section */}
        <section>
          <h2>How We Compare</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="stratussphere">StratusSphere</th>
                  <th>Other Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ad-Free Experience</td>
                  <td className="stratussphere">✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>User Privacy</td>
                  <td className="stratussphere">✓ No Tracking</td>
                  <td>✗ Heavy Tracking</td>
                </tr>
                <tr>
                  <td>Intuitive UI</td>
                  <td className="stratussphere">✓ Modern</td>
                  <td>✗ Cluttered</td>
                </tr>
                <tr>
                  <td>Real-Time Updates</td>
                  <td className="stratussphere">✓ Continuous</td>
                  <td>✓ Periodic</td>
                </tr>
                <tr>
                  <td>Weather Details</td>
                  <td className="stratussphere">✓ Relevant Only</td>
                  <td>✓ Overwhelming</td>
                </tr>
                <tr>
                  <td>Mobile Optimized</td>
                  <td className="stratussphere">✓</td>
                  <td>✗ Laggy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="divider"></div>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Experience Better Weather?</h2>
          <p className="cta-text">
            Stop wasting time with complicated weather apps. Join thousands of users who've switched to StratusSphere for accurate, beautiful, and simple weather forecasting.
          </p>
          <button className="cta-button" onClick={handleGetStarted}>Get Started Now</button>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 StratusSphere. All rights reserved.</p>
        <p>Powered by modern meteorology and thoughtful design.</p>
      </footer>
    </div>
  );
}
