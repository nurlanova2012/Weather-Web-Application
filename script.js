const API_KEY = "7d953d1796a66234cbadeebe70704c88";
const searchContainer = document.getElementById("search-container");
const resultContainer = document.getElementById("result-container");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const weatherInput = document.getElementById("weather-input");

const hourlyForecast = document.getElementById("hourly-forecast");
const dailyForecast = document.getElementById("daily-forecast");
const localTime = document.getElementById("local-time");

const errorMessage = document.getElementById("errorMessage");

const realFeel = document.getElementById("real-feel");
const windSpeed = document.getElementById("wind-speed");
const rainChange = document.getElementById("rain-change");
const uvIndex = document.getElementById("uv-index");

/*Search a city*/
searchButton.addEventListener("click", () => {
  const cityName = searchInput.value;
  if (cityName !== "") {
    getWeatherData(cityName);
    getForecastData(cityName);
    showResult();
  } else {
    showError("Please enter a city name");
  }
});

/*Get a weather forecast by a city name*/
function getWeatherData(cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      displayCurrentWeather(data);
      clearError();
    })
    .catch((error) => {
      showError(error.message);
    });
}

/*Open/close containers*/
function showResult() {
  searchContainer.style.display = "none";
  resultContainer.style.display = "block";
}

function showSearch() {
  searchContainer.style.display = "flex";
  resultContainer.style.display = "none";
}

/*Display a current city weather info*/
function displayCurrentWeather(data) {
  const { name, main, weather, rain, wind } = data;
  const temperature = main.temp;
  const weatherDescription = weather[0].description;
  const iconCode = weather[0].icon;
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("kg-KG", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const [weekday, date] = formattedDate.split(", ");
  const [month, day] = date.split(" ");
  const year = currentDate.getFullYear();

  const weatherInfo = `
<h2>${name}</h2>
<p class= "weather-desc">${weatherDescription}</p>
<p class= "weather-temp">${Math.floor(temperature)}°C</p>
<p class="current-date">${weekday} | ${day} ${month} ${year}</p>
<img src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">
`;
  weatherInput.innerHTML = weatherInfo;

  /*Go Back with heading H2*/
  const h2Element = weatherInput.querySelector("h2");
  h2Element.addEventListener("click", () => {
    window.history.back();
    showSearch();
  });

  /*Display air condition*/
  windSpeed.textContent = `${(wind.speed * 3.6).toFixed(2)} km/hr`;
  realFeel.textContent = `${Math.floor(main.feels_like)}°C`;
  uvIndex.textContent = `${
    data.uvi !== undefined ? data.uvi : "Not available"
  }`;
  rainChange.textContent = `${
    rain && rain["1h"] ? ((rain["1h"] / totalRain) * 100).toFixed(2) : 0
  }%`;
}

/*Search for a place/display an error message*/
function getForecastData(cityName) {
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then((data) => {
      displayHourlyForecast(data);
      displayDailyForecast(data);
      clearError();
    })
    .catch((error) => {
      showError(error.message);
    });
}

/*Display hourly forecast*/
function displayHourlyForecast(data) {
  const hourlyForecastItems = data.list
    .slice(0, 7)
    .map((item) => {
      const dateTime = new Date(item.dt * 1000);
      const time = `${dateTime.getHours()}:00`;
      const temperature = item.main.temp;
      const iconCode = item.weather[0].icon;
      const { speed } = item.wind;
      const windSpeed = `${Math.floor((speed * 3.6).toFixed(2))} km/hr`;

      return `
            <div class="forecast-item">
            <p class="forecast-item-temp">${Math.floor(temperature)}°</p>
            <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon">
            <p class="forecast-items">${windSpeed}</p>
            <p class="forecast-items">${time}</p>
            </div>
        `;
    })
    .join("");

  hourlyForecast.innerHTML = `<h3>24-Hour Forecast</h3>${hourlyForecastItems}`;
}

/*Display daily forecast*/
function displayDailyForecast(data) {
  const today = new Date();
  const todayIndex = today.getDay();
  //console.log(todayIndex);
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const dailyForecastItems = data.list
    //.filter((item, index) => index % 8 === 0)
    .slice(todayIndex - 3, todayIndex + 4)
    .map((item, index) => {
      const weekdayIndex = (todayIndex + index - 3 + 7) % 7;
      const day = weekdays[weekdayIndex];
      const iconCode = item.weather[0].icon;
      return `
              <div class="forecast-item">
                  <div class="forecast-item-day">${day}</div>
                  <div><img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon"></div>
              </div>
          `;
    });

  dailyForecast.innerHTML = dailyForecastItems.join("");
}

/*Error messages*/
function showError(message) {
  errorMessage.textContent = message;
}

function clearError() {
  errorMessage.textContent = "";
}

/*Time zone*/
const currDate = new Date();
const hoursMin = currDate.toLocaleTimeString("kg-KG", {
  hour: "2-digit",
  minute: "2-digit",
});
document.getElementById("local-time").innerHTML = hoursMin + " GMT";
