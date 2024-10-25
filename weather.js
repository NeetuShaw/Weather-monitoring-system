const axios = require('axios');
const cron = require('node-cron');
const mongoose = require('mongoose');
const { Weather, DailySummary } = require('./models/weatherModel');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const express = require('express');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Check required environment variables
if (!process.env.API_KEY || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing environment variables. Please check your configuration.");
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static('frontend')); // Serve static files from the frontend folder

// Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb://localhost/weatherDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Load the API key from environment variables
const apiKey = process.env.API_KEY;  
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Indore', 'Pune', 'Gurgaon', 'Noida', 'Rajasthan', 'Bihar']; 

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Function to send email alerts
const sendWeatherAlert = async (city, message) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'nitushaw109@gmail.com', // Replace with recipient's email
        subject: `Weather Alert for ${city}`,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent for ${city}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
    }
};

// Set your temperature threshold
let temperatureThreshold = 30; // Default threshold

// Helper function to convert Kelvin to Celsius
const kelvinToCelsius = (kelvin) => {
    return kelvin - 273.15;
};

// Function to fetch weather data with retry logic
const getWeatherData = async (city, retries = 3) => {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.main) {  // Check if the 'main' key exists
            const temperature = kelvinToCelsius(data.main.temp);
            const feels_like = kelvinToCelsius(data.main.feels_like);
            const humidity = data.main.humidity; 
            const wind_speed = data.wind.speed; 
            const weatherCondition = data.weather[0].main;

            // Only save if temperature is above absolute zero
            if (temperature >= -273.15) {
                const weather = new Weather({
                    city: city,
                    temperature: temperature.toFixed(2),
                    feels_like: feels_like.toFixed(2),
                    humidity: humidity,
                    wind_speed: wind_speed,
                    weather_condition: weatherCondition,
                    timestamp: new Date()
                });

                await weather.save();
                console.log(`Weather data saved for ${city}`);

                // Check for alert conditions
                if (temperature > temperatureThreshold) {
                    const alertMessage = `Alert! The temperature in ${city} has exceeded ${temperatureThreshold}°C. Current temperature: ${temperature.toFixed(2)}°C.`;
                    await sendWeatherAlert(city, alertMessage);
                }
            } else {
                console.warn(`Temperature for ${city} is below absolute zero, not saving.`);
            }
        } else {
            console.error(`Invalid response structure for ${city}:`, data);
        }
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error.message);

        // Retry logic if error occurs
        if (retries > 0) {
            console.log(`Retrying to fetch weather data for ${city}... Attempts left: ${retries}`);
            await getWeatherData(city, retries - 1); 
        } else {
            console.log(`Failed to fetch weather data for ${city} after multiple attempts.`);
        }
    }
};

// Staggering requests to avoid overwhelming the API
const staggeredWeatherFetch = (cities, delay = 2000) => {
    cities.forEach((city, index) => {
        setTimeout(() => {
            getWeatherData(city);
        }, index * delay);
    });
};

// Schedule task to fetch weather data every 3 minutes
cron.schedule('*/3 * * * *', () => {
    console.log('Fetching weather data every 3 minutes...');
    staggeredWeatherFetch(cities, 2000); 
});

// Function to calculate daily weather summary
const calculateDailySummary = async () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    const summaries = await Weather.aggregate([
        {
            $match: {
                timestamp: { $gte: currentDate }
            }
        },
        {
            $group: {
                _id: "$city",
                avgTemperature: { $avg: "$temperature" },
                maxTemperature: { $max: "$temperature" },
                minTemperature: { $min: "$temperature" },
                dominantCondition: {
                    $push: "$weather_condition"
                }
            }
        }
    ]);

    // Save each summary to the database
    for (const summary of summaries) {
        const dominantCondition = _.head(_.chain(summary.dominantCondition)
                                          .countBy()
                                          .entries()
                                          .maxBy(_.last)
                                          .value());
        
        const dailySummary = new DailySummary({
            city: summary._id,
            date: new Date(),
            avg_temperature: summary.avgTemperature,
            max_temperature: summary.maxTemperature,
            min_temperature: summary.minTemperature,
            dominant_condition: dominantCondition
        });

        await dailySummary.save();
        console.log(`Daily summary saved for ${summary._id}`);
    }
};

// Schedule task to run daily summary at 11:59 PM
cron.schedule('59 23 * * *', () => {
    console.log('Calculating daily weather summary...');
    calculateDailySummary();
});

// Get weather data for a specific city
app.get('/weather/:city/:unit?', async (req, res) => {
    const city = req.params.city;
    const unit = req.params.unit || 'metric'; 

    if (!cities.includes(city)) {
        return res.status(400).json({ error: 'City not supported. Please choose from the available cities.' });
    }

    try {
        const existingWeather = await Weather.findOne({ city }).sort({ timestamp: -1 });

        if (existingWeather) {
            return res.json({
                city: existingWeather.city,
                temperature: existingWeather.temperature,
                feels_like: existingWeather.feels_like,
                humidity: existingWeather.humidity,
                wind_speed: existingWeather.wind_speed,
                weather_condition: existingWeather.weather_condition,
                unit: unit === 'metric' ? '°C' : '°F',
                timestamp: existingWeather.timestamp,
            });
        }

        const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=${unit}&appid=${apiKey}`;
        const response = await axios.get(apiUrl);

        // Check if the weather data is valid
        if (response.data.cod === 200 && response.data.main) {
            const temperature = unit === 'metric' ? response.data.main.temp : kelvinToCelsius(response.data.main.temp);
            const feels_like = unit === 'metric' ? response.data.main.feels_like : kelvinToCelsius(response.data.main.feels_like);

            const newWeather = new Weather({
                city: response.data.name,
                temperature: temperature.toFixed(2),
                feels_like: feels_like.toFixed(2),
                humidity: response.data.main.humidity,
                wind_speed: response.data.wind.speed,
                weather_condition: response.data.weather[0].main,
                timestamp: new Date(),
            });

            await newWeather.save();
            res.json({
                city: newWeather.city,
                temperature: newWeather.temperature,
                feels_like: newWeather.feels_like,
                humidity: newWeather.humidity,
                wind_speed: newWeather.wind_speed,
                weather_condition: newWeather.weather_condition,
                unit: unit === 'metric' ? '°C' : '°F',
                timestamp: newWeather.timestamp,
            });
        } else {
            res.status(404).json({ error: 'City not found. Please check the city name.' });
        }
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});


// Get most recent weather data for all cities
app.get('/weather', async (req, res) => {
    try {
        const weatherData = await Weather.aggregate([
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: "$city", 
                    latestWeather: { $first: "$$ROOT" } 
                }
            },
            {
                $replaceRoot: { newRoot: "$latestWeather" } 
            }
        ]);

        res.json(weatherData); 
    } catch (error) {
        console.error('Error retrieving weather data:', error.message);
        res.status(500).json({ error: 'An error occurred while retrieving weather data.' });
    }
});

// Endpoint to set temperature threshold
app.post('/set-threshold', (req, res) => {
    const { threshold } = req.body;

    if (typeof threshold !== 'number') {
        return res.status(400).json({ error: 'Threshold must be a number.' });
    }

    temperatureThreshold = threshold; // Update the global variable or save it to user settings
    res.json({ message: `Temperature threshold set to ${threshold}°C` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
