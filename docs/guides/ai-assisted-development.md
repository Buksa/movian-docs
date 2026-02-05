# Разработка плагинов Movian с помощью AI (Opencode)

Этот гайд поможет вам использовать AI-ассистента Opencode для быстрой разработки плагинов Movian. Вы узнаете, как правильно формулировать запросы, получать качественный код и избегать типичных ошибок.

## 1. Введение

### Что такое Opencode?

Opencode — это AI-ассистент, интегрированный в вашу среду разработки. Он понимает контекст проекта Movian и может помогать с:

- **Генерацией кода** — создание структуры плагина, обработчиков, функций
- **Исправлением ошибок** — отладка, поиск багов, рефакторинг
- **Обучением** — объяснение API, примеры использования модулей
- **Документированием** — генерация комментариев, описание функций

### Почему это полезно для разработки плагинов?

1. **Скорость** — создание базового плагина за минуты, а не часы
2. **Консистентность** — AI знает соглашения Movian API v2
3. **Обучение на практике** — видите рабочие примеры кода
4. **Отладка** — быстро находите ошибки и получаете исправления

### Когда AI особенно полезен:

- Создание плагина для нового сайта с нуля
- Добавление стандартных функций (поиск, настройки, пагинация)
- Миграция плагина с API v1 на API v2
- Исправление ошибок и оптимизация кода

### Когда AI может подвести:

- Сложная бизнес-логика с множеством условий
- Работа с недокументированными особенностями API
- Интеграция с внешними системами, требующими специфических знаний

---

## 2. Начало работы с Opencode

### Установка и настройка

Opencode уже интегрирован в вашу среду разработки. Основные команды:

```bash
# Проверить статус проекта
opencode status

# Запросить помощь у AI
opencode "ваш запрос здесь"

# Или используйте интерфейс напрямую
```

### Подготовка к разработке

Перед началом работы с AI убедитесь, что:

1. **У вас есть структура проекта** — рабочая папка с Movian
2. **Вы понимаете задачу** — что должен делать плагин
3. **Есть доступ к целевому сайту/API** — для тестирования

### Базовый рабочий процесс

```
1. Описать задачу AI → Получить код → Тестировать → Итерации
```

---

## 3. Промпты для разработки плагинов

### Принципы хорошего промпта

**Хороший промпт:**
- Конкретный и понятный
- Содержит контекст (API v2, целевой сайт)
- Описывает ожидаемый результат
- Указывает ограничения (ES5, без Promise)

**Плохой промпт:**
- Размытый и общий
- Без контекста
- Без указания ожидаемого результата
- Непонятные требования

---

### 3.1 Создание плагина с нуля

#### Сценарий: Простой видео-плагин

**❌ Плохой запрос:**
```
Создай плагин для ютуба
```

**✅ Хороший запрос:**
```
Создай плагин Movian API v2 для видеохостинга example.com.

Требования:
1. Сервис с названием "Example Videos" и иконкой icon.png
2. Главная страница со списком категорий: "Популярное", "Новинки", "Топ"
3. При выборе категории — список видео с превью
4. Видео должны открываться проигрывателем Movian
5. Использовать movian/page, movian/service, movian/http
6. Код должен быть совместим с ES5 (без let/const, Promise, стрелочных функций)

Структура ответа:
1. plugin.json с полным описанием
2. main.js с комментариями
3. Краткое объяснение, как работает код
```

**Результат, который должен получиться:**

```javascript
// plugin.json
{
  "type": "ecmascript",
  "id": "com.example.videos",
  "file": "main.js",
  "title": "Example Videos",
  "version": "1.0.0",
  "apiversion": 2,
  "category": "video",
  "description": "Video content from example.com"
}
```

```javascript
// main.js
var page = require('movian/page');
var service = require('movian/service');
var http = require('movian/http');

// Create service
service.create("Example Videos", "example:start", "video", true, 
               Plugin.path + "icon.png");

// Main page with categories
new page.Route("example:start", function(page) {
  page.type = "directory";
  page.metadata.title = "Example Videos";
  
  page.appendItem("example:category:popular", "directory", {
    title: "Популярное"
  });
  
  page.appendItem("example:category:new", "directory", {
    title: "Новинки"
  });
  
  page.appendItem("example:category:top", "directory", {
    title: "Топ"
  });
  
  page.loading = false;
});

// Category page
new page.Route("example:category:(.*)", function(page, category) {
  page.metadata.title = category;
  
  // Here would be HTTP request to fetch videos
  // For demonstration, using mock data
  page.appendItem("http://example.com/video1.mp4", "video", {
    title: "Sample Video",
    icon: "http://example.com/thumb1.jpg"
  });
  
  page.loading = false;
});
```

---

#### Сценарий: Плагин с авторизацией

**Запрос:**
```
Создай плагин Movian API v2 с авторизацией через API ключ.

Требования:
1. Настройки плагина (plugin settings) для ввода API ключа
2. Проверка наличия ключа перед запросами
3. Хранение ключа в movian/store
4. Использование ключа в заголовках HTTP запросов
5. Обработка ошибки 401 (Unauthorized)

Дай полный код plugin.json и main.js.
```

---

### 3.2 Добавление функциональности

#### Добавление поиска в существующий плагин

**Контекст:** У вас есть рабочий плагин, нужно добавить поиск

**Запрос:**
```
Добавь функцию глобального поиска в плагин.

Существующий код:
[new page.Route("example:start", ...)]

Требования:
1. Использовать page.Searcher для глобального поиска Movian
2. Поисковый запрос передавать в URL example:search:{query}
3. Результаты отображать на той же странице, что и обычные видео
4. Код должен работать синхронно (без Promise)

Дай только код, который нужно добавить, с пояснениями.
```

**Пример ответа:**

```javascript
// Добавить в конец main.js

// Global search integration
new page.Searcher("Example Videos", Plugin.path + "icon.png", 
  function(page, query) {
    page.metadata.title = "Search: " + query;
    
    // Mock search - replace with real API call
    var results = [
      { title: "Result for: " + query, url: "http://example.com/video.mp4" }
    ];
    
    results.forEach(function(video) {
      page.appendItem(video.url, "video", {
        title: video.title
      });
    });
    
    page.loading = false;
  }
);
```

---

#### Добавление пагинации

**Запрос:**
```
Добавь пагинацию "Загрузить еще" в плагин.

Сейчас все видео загружаются сразу. Нужно:
1. Загружать первые 20 видео
2. При прокрутке до конца — загружать следующие 20
3. Использовать page.paginator
4. Сохранить текущую страницу в переменной

Дай код с комментариями.
```

**Пример ответа:**

```javascript
new page.Route("example:category:(.*)", function(page, category) {
  page.metadata.title = category;
  
  var currentPage = 1;
  var hasMore = true;
  
  // Paginator function
  page.paginator = function() {
    if (!hasMore) return false;
    
    try {
      // Replace with real API call
      // var response = http.request("http://api.example.com/videos?page=" + currentPage);
      // var data = JSON.parse(response.toString());
      
      // Mock data for demonstration
      var data = {
        videos: [
          { title: "Video " + currentPage + "-1", url: "..." },
          { title: "Video " + currentPage + "-2", url: "..." }
        ],
        hasMore: currentPage < 5
      };
      
      data.videos.forEach(function(video) {
        page.appendItem(video.url, "video", {
          title: video.title
        });
      });
      
      hasMore = data.hasMore;
      currentPage++;
      
      return hasMore;
    } catch (e) {
      page.error("Failed to load: " + e.message);
      return false;
    }
  };
  
  // Load first page
  page.paginator();
});
```

---

#### Добавление настроек

**Запрос:**
```
Добавь настройки плагина:
1. Качество видео (выбор: 720p, 1080p, 4K)
2. Включить/выключить субтитры (boolean)
3. API ключ (string)
4. Кнопка "Очистить кэш" (action)

Использовать settings.globalSettings и movian/store.
Настройки должны сохраняться между перезапусками.
```

**Пример ответа:**

```javascript
var settings = require('movian/settings');
var store = require('movian/store');

// Storage for settings
var config = store.create("example_config");

// Global settings
var pluginSettings = new settings.globalSettings(
  "example-settings",
  "Example Plugin Settings",
  Plugin.path + "icon.png",
  "Configure video quality and other options"
);

// Quality selector
pluginSettings.createMultiOpt(
  "quality",
  "Video Quality",
  [
    ["720", "720p", false],
    ["1080", "1080p", true],  // default
    ["4k", "4K", false]
  ],
  function(selected) {
    config.quality = selected;
    console.log("Quality set to: " + selected);
  },
  true  // persistent
);

// Subtitles toggle
pluginSettings.createBool(
  "subtitles",
  "Enable Subtitles",
  true,  // default
  function(enabled) {
    config.subtitles = enabled;
  },
  true  // persistent
);

// API key
pluginSettings.createString(
  "apikey",
  "API Key",
  "",  // default empty
  function(value) {
    config.apikey = value;
  },
  true  // persistent
);

// Clear cache action
pluginSettings.createAction(
  "clearcache",
  "Clear Cache",
  function() {
    // Clear stored data
    config.cache = {};
    console.log("Cache cleared");
  }
);
```

---

### 3.3 Исправление ошибок

#### Отладка неработающего HTTP запроса

**Контекст:** Плагин не загружает данные

**Запрос:**
```
Видео не загружаются в плагине. Помоги найти ошибку.

Код:
```javascript
new page.Route("example:videos", function(page) {
  var response = http.request("http://api.example.com/videos");
  var data = JSON.parse(response);
  
  data.videos.forEach(function(v) {
    page.appendItem(v.url, "video", { title: v.title });
  });
});
```

Ошибка: "Cannot read property 'videos' of undefined"
```

**Анализ AI:**

Ошибка возникает потому, что:
1. `http.request()` возвращает объект `HttpResponse`, не строку
2. Нужно использовать `response.toString()` перед `JSON.parse()`
3. Нет обработки ошибок HTTP

**Исправленный код:**

```javascript
new page.Route("example:videos", function(page) {
  try {
    var response = http.request("http://api.example.com/videos", {
      headers: {
        "User-Agent": "Movian Plugin"
      }
    });
    
    // Convert response to string, then parse
    var data = JSON.parse(response.toString());
    
    if (!data.videos || !Array.isArray(data.videos)) {
      page.error("Invalid response format");
      return;
    }
    
    data.videos.forEach(function(v) {
      page.appendItem(v.url, "video", { title: v.title });
    });
    
  } catch (e) {
    page.error("Failed to load videos: " + e.message);
    console.error("HTTP Error: " + e.message);
  }
  
  page.loading = false;
});
```

---

#### Исправление ошибки маршрутизации

**Проблема:** Страница не открывается

**Запрос:**
```
Маршрут не работает. При открытии example:video:123 ничего не происходит.

Код:
```javascript
new page.Route("example:video:(.*)", function(page, id) {
  page.metadata.title = "Video " + id;
  page.appendItem("...", "video", { title: "Test" });
});
```
```

**Решение:**

```javascript
new page.Route("example:video:(.*)", function(page, id) {
  page.type = "directory";  // ← Было пропущено!
  page.metadata.title = "Video " + id;
  page.appendItem("...", "video", { title: "Test" });
  page.loading = false;  // ← Тоже важно!
});
```

---

### 3.4 Рефакторинг и миграция

#### Миграция с API v1 на API v2

**Запрос:**
```
Перепиши этот плагин с API v1 на API v2.

API v1 код:
```javascript
(function(plugin) {
  plugin.createService("My Service", "myplugin:start", "video", true);
  
  plugin.addURI("myplugin:start", function(page) {
    page.appendItem("myplugin:video:1", "video", { title: "Video 1" });
    page.appendItem("myplugin:video:2", "video", { title: "Video 2" });
  });
  
  plugin.addURI("myplugin:video:(.*)", function(page, id) {
    showtime.print("Loading video " + id);
    page.source = "videoparams:{...}";
  });
})(this);
```

Дай полный код для API v2 с объяснением изменений.
```

**Результат:**

```javascript
// API v2 - Modern approach

// Import modules instead of plugin wrapper
var service = require('movian/service');
var page = require('movian/page');

// Create service
service.create(
  "My Service",           // title
  "myplugin:start",       // url
  "video",                // type
  true,                   // enabled
  Plugin.path + "icon.png" // icon
);

// Use page.Route instead of plugin.addURI
new page.Route("myplugin:start", function(page) {
  page.type = "directory";  // Required!
  page.metadata.title = "My Service";
  
  page.appendItem("myplugin:video:1", "video", { title: "Video 1" });
  page.appendItem("myplugin:video:2", "video", { title: "Video 2" });
  
  page.loading = false;  // Required!
});

new page.Route("myplugin:video:(.*)", function(page, id) {
  console.log("Loading video " + id);  // console instead of showtime
  
  page.type = "video";
  page.source = "videoparams:{...}";
  page.loading = false;
});
```

**Изменения:**
1. ❌ `plugin.createService()` → ✅ `service.create()`
2. ❌ `plugin.addURI()` → ✅ `new page.Route()`
3. ❌ `(function(plugin){...})(this)` → ✅ Прямые `require()`
4. ❌ `showtime.print()` → ✅ `console.log()`
5. ✅ Добавлен `page.type = "directory"`
6. ✅ Добавлен `page.loading = false`

---

## 4. Лучшие практики работы с AI

### 4.1 Как формулировать задачи

**Структура хорошего запроса:**

```
[Контекст] + [Задача] + [Требования] + [Ограничения] + [Формат ответа]
```

**Пример:**

```
Контекст: Я разрабатываю плагин Movian API v2
Задача: Нужно добавить функцию поиска
Требования: 
  - Глобальный поиск через page.Searcher
  - Поиск по названию видео
  - Отображение до 20 результатов
Ограничения:
  - ES5 синтаксис (без Promise)
  - Обработка ошибок HTTP
Формат: Дай только код функции с комментариями
```

### 4.2 Предоставление контекста

**Всегда указывайте:**

1. **Версия API:** API v2 (или v1 для старых плагинов)
2. **Целевая платформа:** Movian media player
3. **Ограничения:** ES5, без Promise/async-await
4. **Существующий код:** если есть

**Пример контекста:**

```
Контекст проекта:
- Movian plugin API v2
- ES5 JavaScript (var, function, без стрелочных функций)
- Используются модули: movian/page, movian/service, movian/http
- Целевой сайт: example.com (имеет REST API)
```

### 4.3 Итеративная разработка

**Не пытайтесь получить идеальный код с первого раза.**

**Цикл разработки:**

```
1. Запросить базовую структуру
2. Добавить одну функцию (например, отображение списка)
3. Тестировать
4. Добавить следующую функцию (поиск)
5. Тестировать
6. Добавить настройки
7. Рефакторинг и оптимизация
```

**Пример итераций:**

**Итерация 1 — База:**
```
Создай базовый плагин для example.com.
Нужен сервис и главная страница с категориями.
```

**Итерация 2 — Контент:**
```
Добавь загрузку видео с API example.com.
Используй http.request для GET запроса.
```

**Итерация 3 — Поиск:**
```
Добавь глобальный поиск через page.Searcher.
```

**Итерация 4 — Улучшения:**
```
Добавь обработку ошибок и кэширование.
```

### 4.4 Проверка сгенерированного кода

**Всегда проверяйте:**

1. ✅ **Синтаксис ES5** — нет `let`, `const`, стрелочных функций, `Promise`
2. ✅ **Обязательные поля** — `page.type`, `page.loading = false`
3. ✅ **Обработка ошибок** — try-catch для HTTP
4. ✅ **Правильные модули** — `movian/page`, не `showtime/page`
5. ✅ **API v2 синтаксис** — `new page.Route`, не `plugin.addURI`

**Чек-лист проверки:**

```javascript
// Проверьте, что код содержит:
✓ page.type = "directory" | "video"
✓ page.loading = false
✓ var (не let/const)
✓ function() {} (не () => {})
✓ require('movian/...')
✓ try-catch для http.request
```

---

## 5. Примеры сценариев (Case Studies)

### Сценарий 1: Плагин видеохостинга с нуля

**Задача:** Создать плагин для сайта video.example.com

**Шаги с AI:**

1. **Анализ сайта:**
   ```
   Сайт video.example.com имеет API:
   - GET /api/categories — список категорий
   - GET /api/videos?category=X — видео в категории
   - GET /api/search?q=X — поиск
   
   Создай структуру плагина для этого API.
   ```

2. **Базовый код:**
   ```
   Создай main.js с:
   - Сервисом "Video Example"
   - Страницей категорий (/api/categories)
   - Страницей видео (/api/videos?category=X)
   - Обработкой JSON
   ```

3. **Добавление поиска:**
   ```
   Добавь page.Searcher для /api/search?q={query}
   ```

4. **Обработка ошибок:**
   ```
   Добавь try-catch для всех HTTP запросов
   и отображение ошибок пользователю.
   ```

**Результат:** Рабочий плагин за 4 итерации

---

### Сценарий 2: Добавление поиска в существующий плагин

**Задача:** У вас есть плагин с категориями, нужен поиск

**Исходный код:**
```javascript
// Только отображение категорий
new page.Route("example:start", function(page) {
  page.type = "directory";
  page.appendItem("example:cat:movies", "directory", { title: "Movies" });
  page.loading = false;
});
```

**Запрос к AI:**
```
У меня есть плагин с категориями. Добавь глобальный поск.

Текущий код:
[new page.Route("example:start", ...)]

API поиска: GET /api/search?q={query}
Ответ: { results: [{ title, url, thumb }] }

Дай полный код с Searcher.
```

**Результат:**
```javascript
// Добавить в main.js:
new page.Searcher("Example Videos", Plugin.path + "icon.png",
  function(page, query) {
    page.metadata.title = "Search: " + query;
    
    try {
      var response = http.request("http://api.example.com/search?q=" + 
                                  encodeURIComponent(query));
      var data = JSON.parse(response.toString());
      
      if (data.results && data.results.length > 0) {
        data.results.forEach(function(video) {
          page.appendItem(video.url, "video", {
            title: video.title,
            icon: video.thumb
          });
        });
      } else {
        page.appendPassiveItem("label", {
          title: "No results found"
        });
      }
    } catch (e) {
      page.error("Search failed: " + e.message);
    }
    
    page.loading = false;
  }
);
```

---

### Сценарий 3: Исправление ошибки пагинации

**Проблема:** "Загрузить еще" не работает

**Исходный код (с ошибкой):**
```javascript
new page.Route("example:videos", function(page) {
  var pageNum = 1;
  
  page.paginator = function() {
    var response = http.request("/api/videos?page=" + pageNum);
    var data = JSON.parse(response.toString());
    
    data.videos.forEach(function(v) {
      page.appendItem(v.url, "video", { title: v.title });
    });
    
    pageNum++;
    return data.hasMore;
  };
});
```

**Запрос к AI:**
```
Пагинация не работает — при нажатии "Загрузить еще" ничего не происходит.

Код:
[показываем код]

API возвращает:
{
  videos: [...],
  totalPages: 10,
  currentPage: 1
}

Найди и исправь ошибку.
```

**Анализ AI:**
1. Нет `page.type = "directory"`
2. Нет `page.loading = false`
3. Нет вызова `page.paginator()` для первой загрузки
4. Нет обработки ошибок

**Исправленный код:**
```javascript
new page.Route("example:videos", function(page) {
  page.type = "directory";
  page.metadata.title = "Videos";
  
  var pageNum = 1;
  var totalPages = 1;
  
  page.paginator = function() {
    try {
      var response = http.request("http://api.example.com/videos?page=" + pageNum);
      var data = JSON.parse(response.toString());
      
      if (data.videos) {
        data.videos.forEach(function(v) {
          page.appendItem(v.url, "video", { title: v.title });
        });
      }
      
      totalPages = data.totalPages || 1;
      pageNum++;
      
      return pageNum <= totalPages;
    } catch (e) {
      console.error("Pagination error: " + e.message);
      return false;
    }
  };
  
  // Load first page
  page.paginator();
});
```

---

### Сценарий 4: Миграция API v1 → v2

**Исходный код (API v1):**
```javascript
(function(plugin) {
  var logo = plugin.path + "logo.png";
  
  plugin.createService("Old Plugin", "old:start", "video", true, logo);
  
  plugin.addURI("old:start", function(page) {
    page.appendItem("old:cat:1", "directory", { title: "Category 1" });
  });
  
  plugin.addURI("old:cat:(.*)", function(page, id) {
    showtime.print("Loading " + id);
    var url = "http://api.example.com/cat/" + id;
    var response = showtime.httpReq(url);
    var data = JSON.parse(response);
    
    data.items.forEach(function(item) {
      page.appendItem(item.url, "video", { title: item.title });
    });
  });
})(this);
```

**Запрос к AI:**
```
Перепиши этот плагин на API v2. Дай полный код с пояснениями изменений.

[вставляем код выше]
```

**Результат:**

```javascript
// API v2 Migration

var service = require('movian/service');
var page = require('movian/page');
var http = require('movian/http');

// Create service (note: Plugin.path is global)
service.create(
  "Old Plugin",
  "old:start",
  "video",
  true,
  Plugin.path + "logo.png"
);

// Main page
new page.Route("old:start", function(page) {
  page.type = "directory";  // Added: required in v2
  page.metadata.title = "Old Plugin";
  
  page.appendItem("old:cat:1", "directory", { title: "Category 1" });
  
  page.loading = false;  // Added: required in v2
});

// Category page
new page.Route("old:cat:(.*)", function(page, id) {
  console.log("Loading " + id);  // Changed: showtime.print → console.log
  
  try {  // Added: error handling
    var url = "http://api.example.com/cat/" + id;
    var response = http.request(url);  // Changed: showtime.httpReq → http.request
    var data = JSON.parse(response.toString());  // Changed: added toString()
    
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach(function(item) {
        page.appendItem(item.url, "video", { title: item.title });
      });
    }
  } catch (e) {
    page.error("Failed to load: " + e.message);
    console.error("Error: " + e.message);
  }
  
  page.loading = false;  // Added: required in v2
});
```

**Изменения объяснены:**
1. ❌ `(function(plugin){...})(this)` → ✅ Удалено, используем `require()`
2. ❌ `plugin.createService()` → ✅ `service.create()`
3. ❌ `plugin.addURI()` → ✅ `new page.Route()`
4. ❌ `showtime.httpReq()` → ✅ `http.request()`
5. ❌ `showtime.print()` → ✅ `console.log()`
6. ❌ `JSON.parse(response)` → ✅ `JSON.parse(response.toString())`
7. ✅ Добавлен `page.type = "directory"`
8. ✅ Добавлен `page.loading = false`
9. ✅ Добавлен try-catch для обработки ошибок

---

## 6. Ограничения AI и типичные проблемы

### 6.1 Галлюцинации API

**Проблема:** AI может придумать несуществующие функции

**Пример:**
```javascript
// AI может сгенерировать:
page.showNotification("Loading...");  // ❌ Не существует!
showtime.alert("Error");              // ❌ Не существует!
```

**Решение:**
- Всегда проверяйте сгенерированный код по документации
- Используйте только документированные функции из:
  - `movian/page`
  - `movian/service`
  - `movian/http`
  - `movian/settings`
  - `movian/store`
  - и т.д.

### 6.2 ES6 синтаксис

**Проблема:** AI любит использовать современный JavaScript

**Примеры ошибок:**
```javascript
// ❌ Не работает в Movian
const title = "Video";           // const не поддерживается
let count = 0;                   // let не поддерживается
items.forEach(v => { ... });     // стрелочные функции не работают
fetch(url).then(r => r.json());  // Promise и fetch не поддерживаются

// ✅ Работает в Movian
var title = "Video";
var count = 0;
items.forEach(function(v) { ... });
http.request(url);  // встроенный модуль
```

**Решение:**
- Всегда указывайте в запросе: "ES5 синтаксис, без let/const/стрелочных функций/Promise"
- Проверяйте код перед тестированием

### 6.3 Отсутствие контекста

**Проблема:** AI не знает специфики вашего проекта

**Пример:**
```
Пользователь: Добавь авторизацию
AI: [генерирует код с OAuth2]
Проблема: На самом деле нужен простой API key
```

**Решение:**
- Предоставляйте максимум контекста
- Показывайте существующий код
- Описывайте требования детально

### 6.4 Когда обращаться к документации

**Используйте документацию вместо AI:**

1. **Сложная бизнес-логика** — AI не понимает специфику вашего проекта
2. **Нестандартные API** — если API сайта имеет необычную структуру
3. **Отладка** — AI не может запустить и протестировать код
4. **Оптимизация** — AI генерирует рабочий, но не всегда оптимальный код
5. **Безопасность** — AI может предложить небезопасные решения

**Золотое правило:**
```
AI = быстрый прототип + шаблоны
Документация = точная информация + лучшие практики
Тестирование = проверка работоспособности
```

---

## 7. Заключение

### Ключевые принципы работы с AI:

1. **Конкретика** — чем точнее запрос, тем лучше результат
2. **Контекст** — всегда предоставляйте информацию о проекте
3. **Итерации** — разбивайте задачи на маленькие шаги
4. **Проверка** — всегда проверяйте сгенерированный код
5. **Документация** — используйте как источник правды

### Ресурсы для обучения:

**Документация:**
- [Core API Reference](../plugins/api/core-api.md) — основные функции
- [HTTP API](../plugins/api/http-api.md) — сетевые запросы
- [Page API](../plugins/api/page-api.md) — работа со страницами
- [Settings API](../plugins/api/settings-api.md) — настройки
- [API Migration Guide](api-v1-to-v2-migration.md) — миграция с v1

**Примеры:**
- [Hello World](../plugins/examples/hello-world/) — минимальный пример
- [Content Provider](../plugins/examples/content-provider/) — полноценный плагин
- [Search Plugin](../plugins/examples/search-plugin/) — поиск

### Финальные рекомендации:

1. **Начинайте с простого** — создайте базовый плагин, потом добавляйте функции
2. **Тестируйте часто** — проверяйте каждую итерацию
3. **Учитесь на примерах** — изучайте сгенерированный код
4. **Не бойтесь ошибок** — AI поможет их исправить
5. **Используйте сообщество** — делитесь опытом и задавайте вопросы

**Успешной разработки плагинов!** 🚀

---

## Приложение: Шаблоны промптов

### Быстрый старт
```
Создай плагин Movian API v2 для [сайт].
Нужны: сервис, категории, видео.
ES5, полный код plugin.json и main.js.
```

### Добавление функции
```
Добавь [функция] в плагин.
Текущий код: [вставить код]
Использовать [модуль].
Дай только новый код.
```

### Исправление ошибки
```
Исправь ошибку: [описание]
Код: [вставить код]
Ошибка: [текст ошибки]
```

### Рефакторинг
```
Оптимизируй код:
[вставить код]

Требования: [что улучшить]
```

### Объяснение
```
Объясни, как работает этот код:
[вставить код]
```

### Миграция
```
Перепиши с API v1 на API v2:
[вставить код v1]

Дай полный код v2 с пояснениями.
```
