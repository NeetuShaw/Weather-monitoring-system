async function fetchWeatherData() {
    const citySelect = document.getElementById('city-select');
    const selectedCity = citySelect.value;

    const weatherContainer = document.getElementById('weather-data');
    weatherContainer.innerHTML = ''; // Clear previous data

    // Show loading indicator
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Loading weather data...';
    weatherContainer.appendChild(loadingMessage);

    const dataView = document.querySelector('input[name="data-view"]:checked').value;
    const tempUnit = document.querySelector('input[name="temperature-unit"]:checked').value;

    try {
        const fetchUrl = dataView === 'all'
            ? `http://localhost:3000/weather?unit=${tempUnit === 'celsius' ? 'metric' : 'imperial'}`
            : `http://localhost:3000/weather/${encodeURIComponent(selectedCity)}/${tempUnit === 'celsius' ? 'metric' : 'imperial'}`;

        const response = await fetch(fetchUrl);

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        localStorage.setItem('dataView', dataView);
        localStorage.setItem('temperatureUnit', tempUnit);

        weatherContainer.removeChild(loadingMessage);

        const weatherArray = dataView === 'all' ? data : [data];
        let totalTemp = 0;
        let maxTemp = -Infinity;
        let minTemp = Infinity;
        let dominantConditionCount = {};
        
        weatherArray.forEach(weather => {
            const temperature = tempUnit === 'celsius' ? weather.temperature : (weather.temperature * 9 / 5) + 32;
            const feelsLike = tempUnit === 'celsius' ? weather.feels_like : (weather.feels_like * 9 / 5) + 32;
            const timestamp = new Date(weather.timestamp).toLocaleString();

            const card = document.createElement('div');
            card.classList.add('weather-card');
            card.innerHTML = `
                <h2>${weather.city}</h2>
                <p>Temperature: ${temperature.toFixed(2)} °${tempUnit === 'celsius' ? 'C' : 'F'}</p>
                <p>Feels Like: ${feelsLike.toFixed(2)} °${tempUnit === 'celsius' ? 'C' : 'F'}</p>
                <p>Humidity: ${weather.humidity}%</p>
                <p>Wind Speed: ${weather.wind_speed} m/s</p>
                <p>Condition: ${weather.weather_condition}</p>
                <p>Updated At: ${timestamp}</p>
            `;
            weatherContainer.appendChild(card);

            // Calculate daily summary
            totalTemp += temperature;
            if (temperature > maxTemp) maxTemp = temperature;
            if (temperature < minTemp) minTemp = temperature;

            // Count occurrences of weather conditions
            if (!dominantConditionCount[weather.weather_condition]) {
                dominantConditionCount[weather.weather_condition] = 0;
            }
            dominantConditionCount[weather.weather_condition]++;
        });

        // Display Daily Weather Summary
        const avgTemp = (totalTemp / weatherArray.length).toFixed(2);
        const dominantCondition = Object.keys(dominantConditionCount).reduce((a, b) => dominantConditionCount[a] > dominantConditionCount[b] ? a : b);
        
        document.getElementById('avg-temperature').textContent = `${avgTemp} °${tempUnit === 'celsius' ? 'C' : 'F'}`;
        document.getElementById('max-temperature').textContent = `${maxTemp.toFixed(2)} °${tempUnit === 'celsius' ? 'C' : 'F'}`;
        document.getElementById('min-temperature').textContent = `${minTemp.toFixed(2)} °${tempUnit === 'celsius' ? 'C' : 'F'}`;
        document.getElementById('dominant-condition').textContent = dominantCondition;

      
        // Check for alerts based on Fahrenheit threshold
        const alertThreshold = tempUnit === 'celsius' ? 35 : (35 * 9/5) + 32; // Convert to Fahrenheit if necessary
        const alertMessage = document.getElementById('alert-message');
        if (maxTemp > alertThreshold) {
           alertMessage.textContent = `Alert: Maximum temperature exceeded ${tempUnit === 'celsius' ? '35 °C' : '95 °F'}!`;
           alertMessage.style.color = 'red';
        } else {
           alertMessage.textContent = 'No alerts.';
           alertMessage.style.color = 'green';
        }

    } catch (error) {
      weatherContainer.innerHTML = ''; // Clear loading message
      const errorMessage = document.createElement('p');
      errorMessage.textContent = `Error fetching weather data: ${error.message}`;
      errorMessage.style.color = 'red';
      weatherContainer.appendChild(errorMessage);
    }
}

document.getElementById('fetch-weather').addEventListener('click', fetchWeatherData);

document.addEventListener('DOMContentLoaded', () => {
    const savedDataView = localStorage.getItem('dataView') || 'all';
    const savedTempUnit = localStorage.getItem('temperatureUnit') || 'celsius';

    document.querySelector(`input[name="data-view"][value="${savedDataView}"]`).checked = true;
    document.querySelector(`input[name="temperature-unit"][value="${savedTempUnit}"]`).checked = true;

    fetchWeatherData();

    document.querySelectorAll('input[name="data-view"]').forEach(option => {
        option.addEventListener('change', () => {
            fetchWeatherData();
        });
    });

    document.querySelectorAll('input[name="temperature-unit"]').forEach(unitOption => {
        unitOption.addEventListener('change', fetchWeatherData);
    });
});
