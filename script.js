// API Configuration
window.weatherApiKey = 'd2c660ba612a0974146ecb5a65af7d5c'; // Make API key available globally

const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const searchBox = document.querySelector('.search-box input');
const searchBtn = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
let currentUnit = 'celsius';

// Temperature conversion functions
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Format time from timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format hour for hourly forecast
function formatHour(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
}

// Get wind direction from degrees
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
    const icons = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Snow': 'fa-snowflake',
        'Thunderstorm': 'fa-bolt',
        'Drizzle': 'fa-cloud-rain',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-smog',
        'Fog': 'fa-smog',
        'Sand': 'fa-smog',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-wind'
    };
    return icons[condition] || 'fa-cloud';
}

// Update weather icon
function updateWeatherIcon(condition) {
    const weatherIcon = document.querySelector('.weather-icon i');
    const iconClass = getWeatherIcon(condition);
    weatherIcon.className = `fas ${iconClass}`;
}

// Update temperature display
function updateTemperature(tempCelsius) {
    const tempValue = document.querySelector('.temp-value');
    if (currentUnit === 'celsius') {
        tempValue.textContent = `${Math.round(tempCelsius)}°C`;
    } else {
        tempValue.textContent = `${Math.round(celsiusToFahrenheit(tempCelsius))}°F`;
    }
}

// Update hourly forecast
function updateHourlyForecast(hourlyData) {
    const hourlyContainer = document.querySelector('.hourly-container');
    hourlyContainer.innerHTML = '';
    
    // Show next 12 hours
    hourlyData.slice(0, 12).forEach(hour => {
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        
        const time = document.createElement('div');
        time.className = 'hourly-time';
        time.textContent = formatHour(hour.dt);
        
        const icon = document.createElement('i');
        icon.className = `fas ${getWeatherIcon(hour.weather[0].main)} hourly-icon`;
        
        const temp = document.createElement('div');
        temp.className = 'hourly-temp';
        temp.textContent = currentUnit === 'celsius' ? 
            `${Math.round(hour.main.temp)}°C` : 
            `${Math.round(celsiusToFahrenheit(hour.main.temp))}°F`;
        
        hourlyItem.appendChild(time);
        hourlyItem.appendChild(icon);
        hourlyItem.appendChild(temp);
        hourlyContainer.appendChild(hourlyItem);
    });
}

// Temperature unit toggle
document.querySelectorAll('.temp-toggle button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.temp-toggle button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentUnit = button.dataset.unit;
        // Re-fetch weather data to update all temperatures
        if (searchBox.value) {
            checkWeather(searchBox.value);
        }
    });
});

// Get UV protection advice
function getUVAdvice(uvIndex) {
    const advice = {
        low: {
            level: 'Low',
            advice: 'No protection needed. Enjoy the outdoors!',
            sunscreen: 'SPF 15+ recommended for extended exposure'
        },
        moderate: {
            level: 'Moderate',
            advice: 'Take precautions - wear sunglasses and use sunscreen.',
            sunscreen: 'SPF 30+ recommended'
        },
        high: {
            level: 'High',
            advice: 'Protection essential - limit time in the sun during peak hours.',
            sunscreen: 'SPF 30+ required, reapply every 2 hours'
        },
        veryHigh: {
            level: 'Very High',
            advice: 'Take extra precautions - seek shade during midday hours.',
            sunscreen: 'SPF 50+ required, reapply every 2 hours'
        },
        extreme: {
            level: 'Extreme',
            advice: 'Avoid sun exposure during peak hours if possible.',
            sunscreen: 'SPF 50+ required, reapply every 1-2 hours'
        }
    };

    if (uvIndex <= 2) return advice.low;
    if (uvIndex <= 5) return advice.moderate;
    if (uvIndex <= 7) return advice.high;
    if (uvIndex <= 10) return advice.veryHigh;
    return advice.extreme;
}

// Get air quality advice
function getAirQualityAdvice(aqi) {
    const advice = {
        good: {
            level: 'Good',
            advice: 'Air quality is satisfactory and poses little or no risk.',
            allergy: 'Low pollen levels. Good conditions for outdoor activities.'
        },
        moderate: {
            level: 'Moderate',
            advice: 'Air quality is acceptable; may be a risk for sensitive individuals.',
            allergy: 'Moderate pollen levels. Consider taking allergy medication if sensitive.'
        },
        unhealthySensitive: {
            level: 'Unhealthy for Sensitive Groups',
            advice: 'Members of sensitive groups may experience health effects.',
            allergy: 'High pollen levels. Those with allergies should limit outdoor activities.'
        },
        unhealthy: {
            level: 'Unhealthy',
            advice: 'Everyone may begin to experience health effects.',
            allergy: 'Very high pollen levels. Consider staying indoors if you have allergies.'
        },
        veryUnhealthy: {
            level: 'Very Unhealthy',
            advice: 'Health warnings of emergency conditions.',
            allergy: 'Extreme pollen levels. Stay indoors if possible.'
        },
        hazardous: {
            level: 'Hazardous',
            advice: 'Health alert: everyone may experience more serious health effects.',
            allergy: 'Dangerous pollen levels. Stay indoors and keep windows closed.'
        }
    };

    if (aqi <= 50) return advice.good;
    if (aqi <= 100) return advice.moderate;
    if (aqi <= 150) return advice.unhealthySensitive;
    if (aqi <= 200) return advice.unhealthy;
    if (aqi <= 300) return advice.veryUnhealthy;
    return advice.hazardous;
}

// Update health and safety information
function updateHealthSafetyInfo(uvIndex, aqi) {
    const uvAdvice = getUVAdvice(uvIndex);
    const airQualityAdvice = getAirQualityAdvice(aqi);

    // Update UV protection
    const uvLevel = document.querySelector('.uv-level');
    uvLevel.textContent = `UV Index: ${uvIndex} (${uvAdvice.level})`;
    uvLevel.className = `uv-level uv-${uvAdvice.level.toLowerCase().replace(' ', '-')}`;

    document.querySelector('.uv-advice').textContent = uvAdvice.advice;
    document.querySelector('.sunscreen-level').textContent = uvAdvice.sunscreen;

    // Update air quality
    const airQualityLevel = document.querySelector('.air-quality-level');
    airQualityLevel.textContent = `Air Quality: ${airQualityAdvice.level}`;
    airQualityLevel.className = `air-quality-level aqi-${airQualityAdvice.level.toLowerCase().replace(' ', '-')}`;

    document.querySelector('.air-quality-advice').textContent = airQualityAdvice.advice;
    document.querySelector('.allergy-info').textContent = airQualityAdvice.allergy;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Theme handling
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update theme toggle icons
            const darkIcons = document.querySelectorAll('.dark-icon');
            const lightIcons = document.querySelectorAll('.light-icon');
            
            darkIcons.forEach(icon => {
                icon.style.opacity = newTheme === 'dark' ? '1' : '0';
            });
            
            lightIcons.forEach(icon => {
                icon.style.opacity = newTheme === 'dark' ? '0' : '1';
            });
        });

        // Set initial icon states
        const isDark = savedTheme === 'dark';
        const darkIcons = document.querySelectorAll('.dark-icon');
        const lightIcons = document.querySelectorAll('.light-icon');
        
        darkIcons.forEach(icon => {
            icon.style.opacity = isDark ? '1' : '0';
        });
        
        lightIcons.forEach(icon => {
            icon.style.opacity = isDark ? '0' : '1';
        });
    }

    // Theme dropdown options
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update theme toggle icons if switching to/from dark mode
            if (theme === 'dark' || theme === 'default') {
                const darkIcons = document.querySelectorAll('.dark-icon');
                const lightIcons = document.querySelectorAll('.light-icon');
                
                darkIcons.forEach(icon => {
                    icon.style.opacity = theme === 'dark' ? '1' : '0';
                });
                
                lightIcons.forEach(icon => {
                    icon.style.opacity = theme === 'dark' ? '0' : '1';
                });
            }
        });
    });

    // Set initial active theme option
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === currentTheme) {
            option.classList.add('active');
        }
    });

    // City search
    const searchBox = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    
    if (searchBox) {
        // Handle Enter key press
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkWeather(searchBox.value);
            }
        });
    }

    if (searchBtn) {
        // Handle search button click
        searchBtn.addEventListener('click', () => {
            if (searchBox) {
                checkWeather(searchBox.value);
            }
        });
    }
});

// Weather Animations
function createSnowflakes() {
    const snow = document.querySelector('.snow');
    snow.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        snowflake.style.opacity = Math.random();
        snowflake.style.width = `${Math.random() * 10 + 5}px`;
        snowflake.style.height = snowflake.style.width;
        snow.appendChild(snowflake);
    }
}

function updateWeatherAnimations(condition) {
    // Reset all animations
    document.querySelector('.rain').classList.remove('active');
    document.querySelector('.snow').classList.remove('active');
    document.querySelector('.thunder').classList.remove('active');

    // Activate appropriate animation based on condition
    if (condition.toLowerCase().includes('rain')) {
        document.querySelector('.rain').classList.add('active');
    } else if (condition.toLowerCase().includes('snow')) {
        createSnowflakes();
        document.querySelector('.snow').classList.add('active');
    } else if (condition.toLowerCase().includes('thunder') || condition.toLowerCase().includes('storm')) {
        document.querySelector('.thunder').classList.add('active');
    }
}

// Update checkWeather function to include animations
async function checkWeather(city) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(`${apiUrl}?q=${city}&appid=${window.weatherApiKey}&units=metric`);
        const currentData = await currentResponse.json();
        
        // Update city name
        const cityNameElement = document.querySelector('.city-name h2');
        if (cityNameElement) {
            cityNameElement.textContent = currentData.name;
        }
        
        // Update temperature
        const tempValue = Math.round(currentData.main.temp);
        const feelsLike = Math.round(currentData.main.feels_like);
        document.querySelector('.temp-value').textContent = 
            `${currentUnit === 'celsius' ? tempValue : celsiusToFahrenheit(tempValue)}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
        document.querySelector('.feels-like-value').textContent = 
            `${currentUnit === 'celsius' ? feelsLike : celsiusToFahrenheit(feelsLike)}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
        
        // Update weather description
        document.querySelector('.description').textContent = currentData.weather[0].description;
        
        // Update additional details
        document.querySelector('.humidity-value').textContent = `${currentData.main.humidity}%`;
        document.querySelector('.wind-value').textContent = `${currentData.wind.speed} km/h`;
        document.querySelector('.pressure-value').textContent = `${currentData.main.pressure} hPa`;
        
        const dewPoint = calculateDewPoint(currentData.main.temp, currentData.main.humidity);
        document.querySelector('.dew-point-value').textContent = 
            `${Math.round(currentUnit === 'celsius' ? dewPoint : celsiusToFahrenheit(dewPoint))}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
        
        document.querySelector('.uv-index-value').textContent = currentData.uvi || '--';
        document.querySelector('.wind-direction-value').textContent = getWindDirection(currentData.wind.deg);
        document.querySelector('.sunrise-time').textContent = formatTime(currentData.sys.sunrise);
        document.querySelector('.sunset-time').textContent = formatTime(currentData.sys.sunset);
        
        // Update weather icon and other features
        updateWeatherIcon(currentData.weather[0].main);
        updateHealthSafetyInfo(currentData.uvi || 0, currentData.aqi || 0);
        
        // Fetch hourly forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${window.weatherApiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        updateHourlyForecast(forecastData.list);
        
        weatherBox.style.display = 'block';
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}

// Calculate dew point
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
} 