Weather Monitoring System
Overview
The Weather Monitoring System is a real-time data processing application that retrieves weather data from the OpenWeatherMap API.
It allows users to view current weather conditions for selected cities and provides daily summaries and alerts based on the temperature.

Features
1. Fetch and display weather data for all cities or a specific city.
2. User preference for temperature units (Celsius or Fahrenheit).
3. Daily weather summaries, including average, maximum, and minimum temperatures.
4. Alerts for extreme temperatures.

Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB (if applicable)
- API: OpenWeatherMap API
  
Installation
Prerequisites
- Node.js (version 14 or higher)
- MongoDB (if applicable)
- Docker or Podman (for containerization)
  
Setup Instructions
Clone the Repository:
git clone [your-github-repo-url]
cd [your-repo-directory]

Install Dependencies: Navigate to the backend directory and install the required Node.js packages.
cd backend
npm install

Set Up Environment Variables: Create a .env file in the root directory and add the following variables:
OPENWEATHER_API_KEY=your_api_key

Run the Application: You can run the application using the following command:
npm start
Access the Application: Open your browser and navigate to http://localhost:3000.

Running with Docker
If you prefer to run the application using Docker, follow these steps:

Build the Docker Image:
docker build -t weather-monitoring-system.

Run the Docker Container:
docker run -p 3000:3000 weather-monitoring-system.

Usage
1. Select the data view (All Cities or Specific City).
2. Choose the temperature unit (Celsius or Fahrenheit).
3. Click on the "Get Weather" button to fetch the weather data.
4. View the daily summary and any alerts generated based on the weather data.

Design Choices
- The application is designed to be user-friendly, with a clean and simple UI that allows easy interaction.
- Real-time data fetching ensures users always receive the latest weather information.
- The alert system provides immediate feedback on extreme weather conditions.
  
Dependencies
- Express
- Axios (for HTTP requests)
- dotenv (for environment variable management)
- MongoDB (if applicable)
  
License
This project is licensed under the MIT License - see the LICENSE file for details.
