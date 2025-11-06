# 🌟 Copilot Code Generation Guidelines
These instructions help GitHub Copilot understand how to generate code that fits my preferred style and structure across all projects.

---

# Core React Concepts

Before contributing to StratusSphere, ensure you’re familiar with these key React topics:

Component creation & structure

React Hooks (useState, useEffect)

Data flow — passing props & lifting state

Context API for shared state

Handling API requests and responses

Conditional rendering and error handling

Managing asynchronous data

UI reactivity and interactivity

Component reusability & modular design

## Step One – Setup & Collaboration

Update the README.md to reflect StratusSphere’s goals, features, and project structure.

Divide into teams of 2–3 members.

Collaboratively design and build interactive, data-driven weather interfaces using ReactJS only (no backend server).

Each team’s version should demonstrate creativity, functionality, and clean UI design.

🌍 Step Two – Weather App Development

Build a working weather app using a free weather API (such as Open-Meteo or WeatherAPI).

Display current conditions and location-based forecasts (city, region, or ZIP code).

Focus on accuracy, interactivity, and performance.

Avoid Node.js servers — keep all logic client-side.

# Naming Conventions

PascalCase → Components (WeatherCard, AppHeader)

camelCase → Variables & functions (getWeatherData, cityInput)

ALL_CAPS → Constants (API_BASE_URL, MAX_RESULTS)

Avoid abbreviations unless they’re obvious and improve readability.

# Error Handling

Use try/catch blocks for all API calls and asynchronous operations.

Provide user feedback for errors (e.g., "City not found" messages).

Log contextually relevant errors to the console (remove before final commit).

Consider implementing a fallback UI or React Error Boundary to prevent full app crashes.

# React Coding Practices

Prefer functional components and React Hooks over class components.

Keep each component focused on a single responsibility.

Follow Hook Rules — never call hooks inside loops or conditions.

Use React.FC when passing children or typed props.

Use clean, readable JSX with proper indentation and grouping.

Avoid inline styles — use CSS modules or separate .css files for styling.

# Styling Guidelines

Maintain consistent and visually cohesive design — modern, minimalist, and weather-themed.

Store all styles in /styles or component-specific CSS files.

Use descriptive class names (forecast-card-active, navbar-title).

Organize colors, fonts, and layout metrics into CSS variables or a global theme file.

Incorporate dynamic styling (e.g., icons or color changes based on weather conditions).

# Code Quality & Readability

Write clear, self-documenting code — names should reflect purpose.

Comment when logic isn’t immediately obvious.

Avoid repetition: extract reusable logic into custom hooks or shared components.

Keep files small and grouped logically.

Remove all console.log() calls before committing production code.

Prefer async/await for API logic readability.

# Testing & Debugging

Test components with mock data before integrating APIs.

Handle null, undefined, or empty states gracefully.

Use browser dev tools to track performance, API calls, and rendering behavior.

Confirm that UI responds correctly to loading, error, and success states.

# File & Folder Structure

Keep the project organized and consistent:

/src
 ├── /components    → Reusable UI parts (WeatherCard, SearchBar)
 ├── /pages         → Main layout screens (Home, Forecast)
 ├── /hooks         → Custom React hooks (useWeatherData)
 ├── /styles        → CSS modules or global theme files
 ├── /assets        → Images, icons, and media
 └── App.jsx        → Root component


Each major component should have its own folder if it includes multiple files (e.g., WeatherCard.jsx, WeatherCard.css).

# Comments & Documentation

Add short descriptive headers to complex files explaining their purpose.

Use inline comments for clarity — why the code is written that way, not just what it does.

Mark unfinished features with // TODO: or // FIXME:.

Keep documentation clear, concise, and consistent.

# Bonus Tips for StratusSphere

Use weather-themed animations or icons to make data more engaging.

Optimize for responsive layouts — mobile and desktop should both look clean.

Highlight usability and real-time interaction, not just data accuracy.

Make sure the app feels like a polished, professional product ready to present.