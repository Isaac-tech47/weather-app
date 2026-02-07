
//           ChatGpt

const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemContainer = document.querySelector('.forecast-item-container');

const apiKey = 'ec7948469c04d6502fc1e421b7952262';

const conditionsFR = {
    "Clear": "Clair",
    "Clouds": "Nuageux",
    "Rain": "Pluie",
    "Snow": "Neige",
    "Drizzle": "Bruine",
    "Thunderstorm": "Orage",
    "Mist": "Brume"
};

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('fr-FR', options).replace(/-/g, ' ');
}

async function updateWeatherInfo(city) {
    try {
        const weatherData = await getFetchData('weather', city);

        if (weatherData.cod !== 200) {
            showDisplaySection(notFoundSection);
            return;
        }

        const {
            name: country,
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData;

        countryTxt.textContent = country;
        tempTxt.textContent = `${Math.round(temp)}°C`;
        conditionTxt.textContent = conditionsFR[main] || main;
        humidityValueTxt.textContent = `${humidity}%`;
        windValueTxt.textContent = `${Math.round(speed)} km/h`;
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

        await updateForecastsInfo(city);
        showDisplaySection(weatherInfoSection);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showDisplaySection(notFoundSection);
    }
}

async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemContainer.innerHTML = '';

    forecastData.list.forEach(forecastWeather => {
        if (
            forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastsItems(forecastWeather);
        }
    });
}

function updateForecastsItems(weatherData) {
    const {
        dt_txt,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(dt_txt);
    const dateOption = {
        day: '2-digit',
        month: 'short'
    };

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastingItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="/assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `;

    forecastItemContainer.insertAdjacentHTML('beforeend', forecastingItem);
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => {
        sec.style.display = 'none';
    });
    section.style.display = 'flex';
}


















