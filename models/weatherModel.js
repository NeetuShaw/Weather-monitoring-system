const mongoose = require('mongoose');

// Define the weather data schema
const weatherSchema = new mongoose.Schema({
    city: { type: String, required: true },
    temperature: { type: Number, required: true },
    feels_like: { type: Number, required: true },
    humidity: { type: Number, required: true },
    wind_speed: { type: Number, required: true },
    weather_condition: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create the model for weather data
const Weather = mongoose.model('Weather', weatherSchema);

// Daily summary schema (add this if it exists)
const dailySummarySchema = new mongoose.Schema({
    city: { type: String, required: true },
    date: { type: Date, required: true },
    avg_temperature: { type: Number, required: true },
    max_temperature: { type: Number, required: true },
    min_temperature: { type: Number, required: true },
    dominant_condition: { type: String, required: true }
});

// Create the model for daily summaries
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

// Export both models
module.exports = { Weather, DailySummary };
