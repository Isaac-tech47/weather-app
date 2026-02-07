// Selectors
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");
const notFoundSection = document.querySelector(".not-found");
const loadingSpinner = document.querySelector(".loading-spinner");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const forecastItemContainer = document.querySelector(
  ".forecast-item-container"
);

const apiKey = "ec7948469c04d6502fc1e421b7952262";

// Weather conditions translations (English → French)
const conditionsFR = {
  Clear: "Clair",
  Clouds: "Nuageux",
  Rain: "Pluie",
  Snow: "Neige",
  Drizzle: "Bruine",
  Thunderstorm: "Orage",
  Mist: "Brume",
};

// Event Listeners
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = "";
    cityInput.blur();
  }
});

// Fetch data helper
async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

// Map weather ID to icon file
function getWeatherIcon(id) {
  if (id <= 232) return "thunderstorm.svg";
  if (id <= 321) return "drizzle.svg";
  if (id <= 531) return "rain.svg";
  if (id <= 622) return "snow.svg";
  if (id <= 781) return "atmosphere.svg";
  if (id === 800) return "clear.svg";
  return "clouds.svg";
}

// Format current date in French
function getCurrentDate() {
  const currentDate = new Date();
  const options = { weekday: "short", day: "2-digit", month: "short" };
  return currentDate.toLocaleDateString("fr-FR", options).replace(/-/g, " ");
}

// Update weather info main function
async function updateWeatherInfo(city) {
  try {
    // Show loading spinner and hide other sections
    loadingSpinner.style.display = "flex";
    showDisplaySection(null);

    const weatherData = await getFetchData("weather", city);

    loadingSpinner.style.display = "none";

    if (weatherData.cod !== 200) {
      showDisplaySection(notFoundSection);
      return;
    }

    // Apply day/night theme based on current time
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 18) {
      document.body.classList.add("day");
      document.body.classList.remove("night");
    } else {
      document.body.classList.add("night");
      document.body.classList.remove("day");
    }

    // Destructure relevant data
    const {
      name: country,
      main: { temp, humidity },
      weather: [{ id, main }],
      wind: { speed },
    } = weatherData;

    // Update UI elements
    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)}°C`;
    conditionTxt.textContent = conditionsFR[main] || main;
    humidityValueTxt.textContent = `${humidity}%`;
    windValueTxt.textContent = `${Math.round(speed)} km/h`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    // Update forecasts
    await updateForecastsInfo(city);

    // Show weather info section
    showDisplaySection(weatherInfoSection);
  } catch (error) {
    console.error("Error fetching weather:", error);
    loadingSpinner.style.display = "none";
    showDisplaySection(notFoundSection);
  }
}

// Update forecast info
async function updateForecastsInfo(city) {
  const forecastData = await getFetchData("forecast", city);
  const targetTime = "12:00:00";
  const todayDate = new Date().toISOString().split("T")[0];
  forecastItemContainer.innerHTML = "";

  forecastData.list.forEach((forecast) => {
    if (
      forecast.dt_txt.includes(targetTime) &&
      !forecast.dt_txt.includes(todayDate)
    ) {
      updateForecastsItems(forecast);
    }
  });
}

// Create and append forecast item
function updateForecastsItems(weatherData) {
  const {
    dt_txt,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateObj = new Date(dt_txt);
  const dateOptions = { day: "2-digit", month: "short" };
  const formattedDate = dateObj.toLocaleDateString("en-US", dateOptions);

  const forecastHTML = `
    <div class="forecast-item">
        <h5 class="forecast-item-date regular-text">${formattedDate}</h5>
        <img src="assets/weather/${getWeatherIcon(
          id
        )}" alt="" class="forecast-item-img" />
        <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
    `;

  forecastItemContainer.insertAdjacentHTML("beforeend", forecastHTML);
}

// Show only one section or hide all if null
function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, notFoundSection].forEach((sec) => {
    sec.style.display = "none";
  });
  if (section) {
    section.style.display = "flex";
  }
}
