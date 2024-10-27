# Weather Monitoring System

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Data Structure](#data-structure)
5. [API Design](#api-design)
6. [Usage](#usage)
7. [Testing](#testing)
8. [Design Choices](#design-choices)
9. [Future Enhancements](#future-enhancements)
10. [Dependencies](#dependencies)
11. [Contributors](#contributors)
12. [License](#license)

## Project Overview
The Weather Monitoring System is a real-time application that retrieves weather data frothe OpenWeatherMap API. It allows users to view current weather conditions for selected cities and provides daily summaries and alerts based on temperature data.

## Features

1. Weather Data Retrieval: Fetches and displays weather data for all cities or a specific city.
2. User Preferences: Allows users to choose temperature units (Celsius or Fahrenheit).
3. Daily Summaries and Alerts: Displays average, maximum, and minimum temperatures, along with alerts for extreme weather conditions.

## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- API: OpenWeatherMap API

## Data Structure
The system uses a structured data model to store weather information:

1. WeatherModel:
- city: The city for which weather data is retrieved.
- temperature: Current temperature, stored based on user preference.
- summary: Daily average, minimum, and maximum temperatures.
- alerts: Notifies users about extreme temperatures.

## API Design
1. Fetch Weather Data (GET /weather): Retrieves weather data for all or a specified city.
2. Get Daily Summary (GET /weather/summary): Provides daily averages and alerts.
3. Set User Preferences (POST /preferences): Saves temperature unit preferences.

Project Setup
1. Clone the Repository:
git clone https://github.com/NeetuShaw/Weather-monitoring-system.git
cd Weather-monitoring-system

2. Backend Setup:
- Ensure Node.js is installed.
- In the root directory, install backend dependencies:
npm install

3. Frontend Setup:
- Navigate to the frontend folder and install dependencies:
cd frontend
npm install

4. Set Up Environment Variables:
- Create a .env file in the root directory and add your API key:
makefile

OPENWEATHER_API_KEY=your_api_key_here

5. Run the Application:

Start the backend server:
npm start

Start the frontend server:
npm start

6. Database:
Set up MongoDB if you wish to store data, and add the connection string in your backend configuration.

## Usage
1. Fetch Weather Data: Select data view options (all cities or specific city) and fetch the weather data.
2. User Preferences: Set temperature units in Celsius or Fahrenheit.
3. Daily Summaries and Alerts: View summaries and alerts based on extreme weather data.

Example API Requests
1. Fetch Weather Data
GET /weather?city=London

2. Set Preferences
POST /preferences
Body: { "unit": "Celsius" }

## Testing
1. Unit Testing: Test each feature with sample requests.
2. Functional Testing: Confirm API responses and frontend interactions.

## Design Choices
- Node.js and Express for Backend: Provides efficient real-time data fetching and processing.
- Modular Structure: Organized code for easy scalability and maintenance.
- User Preferences: Stored to customize the experience based on temperature units and location.

## Future Enhancements
- Expanded Weather Metrics: Add wind speed, humidity, and precipitation.
- Enhanced User Alerts: More detailed notifications for extreme weather conditions.
- Mobile Optimization: Refine the UI for better experience on mobile devices.

## Dependencies
- Backend: Express, Axios, dotenv
- Frontend: HTML, CSS, JavaScript
- Database: MongoDB (optional)
- API: OpenWeatherMap

## Contributors
Neetu Shaw

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

