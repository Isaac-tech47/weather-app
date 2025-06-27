
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


const apiKey = 'ec7948469c04d6502fc1e421b7952262'

searchBtn.addEventListener('click', () => {

    if (cityInput.value.trim() != '') {
        // const city = cityInput.value;
        updateWeatherInfo(cityInput.value);
        cityInput.value = ''; // Clear the input field after search
        cityInput.blur(); // Remove focus from the input field
    }
    
});

cityInput.addEventListener('keydown', (event) => {
    if(event.key == 'Enter' &&
        cityInput.value.trim() != ''
    ){
        // const city = cityInput.value;
        updateWeatherInfo(cityInput.value);
        cityInput.value = ''; 
        cityInput.blur(); 
    }

});


async function getFetchData(endPoint, city) {
    // This function is a placeholder for fetching data from an API.
    // In a real application, you would replace this with an actual fetch call.
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(apiUrl);

    return response.json();
    // This will return the JSON data from the API response.
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id <= 800) return 'clear.svg';
    else return 'clouds.svg';

    console.log(id)
}


function getCurrentDate() {
    const currentDate = new Date();
    // console.log(currentDate);
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        // year: 'numeric'
    }
    return currentDate.toLocaleDateString('fr-FR', options).replace(/-/g, ' '); // Format the date to "Tue 15 Jun"
}



async function updateWeatherInfo(city) {
    
    const weatherData = await getFetchData('weather', city);


    if(weatherData.cod != 200){
        showDisplaySection(notFoundSection);
        return
    }
    
    console.log(weatherData);

    const {
        name: country,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: {speed},
        // sys: {sunrise, sunset},

    }= weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)}°C`;
    conditionTxt.textContent = main['french'] || main; // Use 'french' if available, otherwise use the default 'main'
    // conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${Math.round(speed)} km/h`;

    currentDateTxt.textContent = getCurrentDate();

    weatherSummaryImg.src =`assets/weather/${getWeatherIcon(id)}.svg`;

    await updateForecastsInfo(city);


    
    showDisplaySection(weatherInfoSection);
}

async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    forecastItemContainer.innerHTML = ''; // Clear previous forecast items
    forecastData.list.forEach(forecastWeather => {
        if(forecastWeather.dt_txt.includes(timeTaken) && 
            !forecastWeather.dt_txt.includes(todayDate)){

                updateForecastsItems(forecastWeather);
        }
    });
}

function updateForecastsItems(weatherData){
    const{
        dt_txt = date,
        weather: [{id}],
        main: {temp},
    } = weatherData;


    const dateTaken = new Date(date);
    const dateOption = {
        day:'2-digit',
        month: 'short',
    }

    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption); // Format the date to "05 Jun"

    const forecastingItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="/assets/weather/${getWeatherIcon(id)}" alt="" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
                `
    forecastItemContainer.insertAdjacentHTML('beforeend', forecastingItem);

}


function showDisplaySection(section){
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(section => section.style.display = 'none')

    section.style.display = 'flex';
}



















