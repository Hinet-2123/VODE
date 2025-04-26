const apiKey = '43701e1cd87ea3324e38f4844201c432';  // Твой API ключ
let map;  // Переменная для карты
let marker;  // Переменная для маркера

// Функция для получения координат города
function getCityCoordinates(city) {
  console.log('Получение координат для города:', city);  // Логируем название города
  return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.coord) {
        console.log('Координаты города:', data.coord);  // Логируем координаты
        return data.coord; // Возвращаем объект с координатами
      } else {
        throw new Error('Город не найден');
      }
    });
}

// Функция для получения данных о качестве воздуха
function getAirQuality() {
  const city = document.getElementById('city').value;
  if (!city) {
    alert("Введите название города!");
    return;
  }

  console.log('Запрос данных о загрязнении для города:', city);
  // Получаем координаты города
  getCityCoordinates(city)
    .then(coords => {
      console.log('Координаты для запроса загрязнения:', coords);
      // Запрос к API для получения данных о качестве воздуха
      return fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`);
    })
    .then(response => response.json())
    .then(data => {
      console.log('Данные о загрязнении:', data);

      // Если данные успешно получены
      if (data && data.list && data.list[0].components) {
        const airQuality = data.list[0].components;

        // Отображаем данные о загрязнении в соответствующих элементах
        document.getElementById('pm25').textContent = airQuality.pm2_5 || 'Неизвестно';
        document.getElementById('pm10').textContent = airQuality.pm10 || 'Неизвестно';
        document.getElementById('co2').textContent = airQuality.co || 'Неизвестно';

        // Передаем координаты в updateMap как lat и lon
        updateMap(city, coords.lat, coords.lon, airQuality.pm2_5); // Теперь передаем lat и lon напрямую
      } else {
        alert('Не удалось найти данные для указанного города.');
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert(error.message);
    });
}

// Функция для инициализации карты
function initMap() {
  if (!map) {
    map = L.map('map').setView([55.7558, 37.6173], 10); // Начальные координаты (Москва)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }
}

// Функция для обновления карты с учетом уровня загрязнения
function updateMap(city, lat, lon, pm25) {
  console.log('Обновление карты с PM2.5:', pm25);

  // Если маркер существует — удаляем его
  if (marker) {
    marker.remove();
  }

  // Определяем цвет в зависимости от PM2.5
  let markerColor;
  if (pm25 <= 12) {
    markerColor = 'green';  // Хорошее качество
  } else if (pm25 > 12 && pm25 <= 35) {
    markerColor = 'yellow';  // Умеренное загрязнение
  } else {
    markerColor = 'red';  // Сильное загрязнение
  }

  // Добавляем круглый маркер с цветом
  marker = L.circle([lat, lon], {
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: 0.4,
    radius: 10000, // Радиус в метрах (10 км вокруг города)
    weight: 1
  }).addTo(map)
    .bindPopup(`Город: ${city} <br> PM2.5: ${pm25}`)
    .openPopup();

  // Центрируем карту на новом маркере
  map.setView([lat, lon], 10);
}

// Инициализация карты при загрузке страницы
initMap();
