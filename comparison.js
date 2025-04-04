// Chart instances
let temperatureChart, humidityChart, windChart, aqiChart;
let city1Data = null;
let city2Data = null;

// Initialize charts
function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'var(--text-color)'
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    color: 'var(--text-color)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: 'var(--text-color)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    // Temperature Chart
    const tempCtx = document.getElementById('temperatureChart');
    if (tempCtx) {
        temperatureChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: ['Current', 'Next 3h', 'Next 6h', 'Next 9h'],
                datasets: [
                    {
                        label: 'City 1 Temperature',
                        data: [],
                        borderColor: '#0061f2',
                        tension: 0.4
                    },
                    {
                        label: 'City 2 Temperature',
                        data: [],
                        borderColor: '#ff6b6b',
                        tension: 0.4
                    }
                ]
            },
            options: chartOptions
        });
    }

    // Humidity Chart
    const humidityCtx = document.getElementById('humidityChart');
    if (humidityCtx) {
        humidityChart = new Chart(humidityCtx, {
            type: 'bar',
            data: {
                labels: ['City 1', 'City 2'],
                datasets: [{
                    label: 'Humidity (%)',
                    data: [],
                    backgroundColor: ['#0061f2', '#ff6b6b']
                }]
            },
            options: chartOptions
        });
    }

    // Wind Chart
    const windCtx = document.getElementById('windChart');
    if (windCtx) {
        windChart = new Chart(windCtx, {
            type: 'radar',
            data: {
                labels: ['Speed', 'Direction', 'Gust'],
                datasets: [
                    {
                        label: 'City 1 Wind',
                        data: [],
                        borderColor: '#0061f2',
                        backgroundColor: 'rgba(0, 97, 242, 0.2)'
                    },
                    {
                        label: 'City 2 Wind',
                        data: [],
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.2)'
                    }
                ]
            },
            options: chartOptions
        });
    }

    // AQI Chart
    const aqiCtx = document.getElementById('aqiChart');
    if (aqiCtx) {
        aqiChart = new Chart(aqiCtx, {
            type: 'doughnut',
            data: {
                labels: ['City 1', 'City 2'],
                datasets: [{
                    data: [],
                    backgroundColor: ['#0061f2', '#ff6b6b']
                }]
            },
            options: chartOptions
        });
    }
}

// Update charts with new data
function updateCharts() {
    if (!city1Data || !city2Data) return;

    // Update temperature chart
    if (temperatureChart) {
        temperatureChart.data.datasets[0].data = [
            city1Data.main.temp,
            city1Data.forecast[0].main.temp,
            city1Data.forecast[1].main.temp,
            city1Data.forecast[2].main.temp
        ];
        temperatureChart.data.datasets[1].data = [
            city2Data.main.temp,
            city2Data.forecast[0].main.temp,
            city2Data.forecast[1].main.temp,
            city2Data.forecast[2].main.temp
        ];
        temperatureChart.update();
    }

    // Update humidity chart
    if (humidityChart) {
        humidityChart.data.datasets[0].data = [city1Data.main.humidity, city2Data.main.humidity];
        humidityChart.update();
    }

    // Update wind chart
    if (windChart) {
        windChart.data.datasets[0].data = [
            city1Data.wind.speed,
            city1Data.wind.deg,
            city1Data.wind.gust || 0
        ];
        windChart.data.datasets[1].data = [
            city2Data.wind.speed,
            city2Data.wind.deg,
            city2Data.wind.gust || 0
        ];
        windChart.update();
    }

    // Update AQI chart
    if (aqiChart) {
        aqiChart.data.datasets[0].data = [city1Data.aqi || 0, city2Data.aqi || 0];
        aqiChart.update();
    }
}

// Fetch weather data for a city
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${window.weatherApiKey}`);
        if (!response.ok) throw new Error('City not found');
        
        const currentData = await response.json();
        
        // Fetch forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${window.weatherApiKey}`);
        const forecastData = await forecastResponse.json();
        
        return {
            ...currentData,
            forecast: forecastData.list.slice(0, 3)
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Update city card with weather data
function updateCityCard(card, data) {
    if (!data) return;
    
    card.querySelector('.city-name').textContent = data.name;
    card.querySelector('.temp-value').textContent = `${Math.round(data.main.temp)}°C`;
    card.querySelector('.feels-like-value').textContent = `${Math.round(data.main.feels_like)}°C`;
    card.querySelector('.description').textContent = data.weather[0].description;
    card.querySelector('.humidity-value').textContent = `${data.main.humidity}%`;
    card.querySelector('.wind-value').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    card.querySelector('.pressure-value').textContent = `${data.main.pressure} hPa`;
    card.querySelector('.uv-index-value').textContent = data.uvi || 'N/A';
    
    // Update weather icon
    const icon = card.querySelector('.weather-icon i');
    icon.className = `fas ${getWeatherIcon(data.weather[0].main)}`;
}

// Handle city search
async function handleCitySearch(city, isCity1) {
    const data = await fetchWeatherData(city);
    if (data) {
        if (isCity1) {
            city1Data = data;
            updateCityCard(document.querySelector('.city1'), data);
        } else {
            city2Data = data;
            updateCityCard(document.querySelector('.city2'), data);
        }
        updateCharts();
    } else {
        alert('City not found. Please try again.');
    }
}

// Toggle view between side-by-side and overlay
function toggleView(view) {
    const comparisonArea = document.querySelector('.comparison-area');
    const cards = document.querySelectorAll('.city-card');
    
    if (view === 'overlay') {
        comparisonArea.classList.add('overlay');
        cards.forEach(card => card.classList.add('overlay'));
    } else {
        comparisonArea.classList.remove('overlay');
        cards.forEach(card => card.classList.remove('overlay'));
    }
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initializeCharts();

    // City search
    const searchButtons = document.querySelectorAll('.search-btn');
    if (searchButtons.length > 0) {
        searchButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                if (input) {
                    handleCitySearch(input.value, index === 0);
                }
            });
        });
    }
    
    // View toggle
    const viewButtons = document.querySelectorAll('.view-btn');
    if (viewButtons.length > 0) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                toggleView(btn.dataset.view);
            });
        });
    }
}); 