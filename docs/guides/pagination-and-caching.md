# Руководство разработчика: Пагинация и Кэширование в Movian

## Введение

Это руководство описывает лучшие практики реализации асинхронной пагинации с интеллектуальным кэшированием для плагинов Movian. Основано на реальном опыте разработки плагина Anilibria.tv.

**Два подхода к кэшированию:**
1. **Встроенный HTTP кэш Movian** (рекомендуется) - простой и эффективный
2. **Custom кэш** (продвинутый) - для специальных случаев и передачи данных между слоями

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Встроенный HTTP кэш Movian (Рекомендуется)](#встроенный-http-кэш-movian-рекомендуется)
3. [Custom кэш (Продвинутый)](#custom-кэш-продвинутый)
4. [Сравнение подходов](#сравнение-подходов)
5. [Асинхронная пагинация](#асинхронная-пагинация)
6. [Интеграция кэша и пагинации](#интеграция-кэша-и-пагинации)
7. [Лучшие практики](#лучшие-практики)
8. [Типичные ошибки](#типичные-ошибки)
9. [Примеры кода](#примеры-кода)

---

## Быстрый старт

### Минимальная реализация пагинации

```javascript
var page = require('movian/page');

new page.Route('myplugin:catalog', function(page) {
  page.type = "directory";
  
  var currentPage = 1;
  
  function loader() {
    // Загрузка данных
    loadData(currentPage, function(error, items) {
      if (error) {
        page.haveMore(false);
        return;
      }
      
      // Добавление элементов
      items.forEach(function(item) {
        page.appendItem(item.url, 'video', {
          title: item.title
        });
      });
      
      // Увеличение счётчика
      currentPage++;
      
      // Проверка наличия следующей страницы
      page.haveMore(!items.endOfData);
    });
  }
  
  // Первый вызов
  loader();
  
  // Установка пагинатора
  page.asyncPaginator = loader;
});
```

---

## Встроенный HTTP кэш Movian (Рекомендуется)

### Обзор

Movian имеет встроенный HTTP кэш, который автоматически кэширует ответы. Это **рекомендуемый подход** для большинства плагинов.

**Преимущества:**
- ✅ Простая реализация (минимум кода)
- ✅ Автоматическое управление
- ✅ Встроено в Movian
- ✅ Надёжное определение источника данных
- ✅ Не требует дополнительных модулей

**Когда использовать:**
- Кэширование HTTP запросов к API
- Стандартная пагинация
- Большинство случаев использования

### Как работает встроенный кэш

```javascript
var http = require('movian/http');

http.request(url, {
  method: 'GET',
  headers: config.HEADERS,
  caching: true,           // ✅ Включить встроенный кэш
  cacheTime: 300000        // Время кэша в миллисекундах (5 минут)
}, function(error, response) {
  // ✅ КЛЮЧЕВОЙ МОМЕНТ: Определение источника данных
  // response.statuscode === 0 означает, что ответ из кэша
  // response.statuscode === 200 означает, что ответ из HTTP
  
  if (response.statuscode === 0) {
    console.log('Response from Movian cache');
  }
});
```

### Определение источника данных

**Ключевой момент:** Movian возвращает `statuscode === 0` для закешированных ответов:

```javascript
var isFromCache = (response.statuscode === 0);

// Проверка статуса
if (response.statuscode !== 200 && response.statuscode !== 0) {
  // Ошибка HTTP
  callback(new Error('HTTP ' + response.statuscode), null);
  return;
}

// Передача флага fromCache
callback(null, data, isFromCache);
```

**Значения statuscode:**
- `200` - свежий ответ от сервера
- `0` - ответ из встроенного кэша Movian
- Другие - ошибка HTTP

### Реализация с встроенным кэшем

**Файл: `lib/loaders/catalog.js`**

```javascript
var http = require('movian/http');
var catalogDomain = require('../domain/catalog');

function createCatalogLoader(config) {
  return {
    load: function(pageNum, callback) {
      // Валидация
      if (!pageNum || typeof pageNum !== 'number' || pageNum < 1) {
        callback(new Error('Invalid page number'), null);
        return;
      }
      
      // Построение URL
      var apiUrl = config.API.API_URL + '/anime/catalog/releases';
      var queryParams = {
        limit: config.UI.PAGE_SIZE,
        'f[sorting]': 'FRESH_AT_DESC',
        page: pageNum
      };
      
      var queryParts = [];
      for (var key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {
          queryParts.push(
            encodeURIComponent(key) + '=' + 
            encodeURIComponent(queryParams[key])
          );
        }
      }
      var requestUrl = apiUrl + '?' + queryParts.join('&');
      
      console.log('[CATALOG] Request URL:', requestUrl);
      
      // ✅ HTTP запрос с встроенным кэшем Movian
      http.request(requestUrl, {
        method: 'GET',
        headers: config.HEADERS,
        caching: true,
        cacheTime: config.CACHE.DURATION
      }, function(error, response) {
        if (error) {
          console.log('[CATALOG] HTTP error:', error);
          callback(error, null);
          return;
        }
        
        console.log('[CATALOG] HTTP status:', response.statuscode);
        
        // ✅ КЛЮЧЕВОЙ МОМЕНТ: Определение источника данных
        var isFromCache = (response.statuscode === 0);
        
        // Проверка статуса
        if (response.statuscode !== 200 && response.statuscode !== 0) {
          callback(new Error('HTTP ' + response.statuscode), null);
          return;
        }
        
        if (isFromCache) {
          console.log('[CATALOG] Response from Movian cache');
        }
        
        // Парсинг ответа
        try {
          var data = JSON.parse(response.toString());
          
          // Обработка через domain layer
          var result = catalogDomain.processCatalogData(data, {
            prefix: config.PREFIX,
            coverBaseUrl: config.API.COVER_URL,
            pageSize: config.UI.PAGE_SIZE
          });
          
          // ✅ Возврат с флагом fromCache
          var responseObj = {
            items: result,
            fromCache: isFromCache  // Определено из statuscode
          };
          
          console.log('[CATALOG] Loaded', result.length, 'items, fromCache:', isFromCache);
          callback(null, responseObj);
        } catch (parseError) {
          console.log('[CATALOG] Parse error:', parseError);
          callback(parseError, null);
        }
      });
    }
  };
}

module.exports = { createCatalogLoader: createCatalogLoader };
```

### Конфигурация встроенного кэша

**Файл: `lib/config.js`**

```javascript
module.exports = {
  CACHE: {
    ENABLED: true,
    DURATION: 300000,      // 5 минут (встроенный кэш Movian)
  }
};
```

### Использование в routes.js

**Файл: `lib/routes.js`**

```javascript
var globalApiClient = createApiClient();

function handleStartPage(page) {
  setupPageMetadata(page, {
    title: 'Anilibria.tv',
    type: 'directory',
    loading: true,
    model: 'movies'
  });

  var currentPage = 1;
  page.flush();

  function loader() {
    log.d('[ROUTES] Loading catalog page: ' + currentPage);
    
    globalApiClient.getCatalog(currentPage, function(error, result) {
      page.loading = false;
      
      if (error) {
        log.e('[ROUTES] Failed to load catalog page ' + currentPage);
        ui.createSeparator(page, 'Ошибка загрузки данных');
        page.haveMore(false);
        return;
      }
      
      var items = result.items;
      var fromCache = result.fromCache;  // ✅ Флаг из loader
      
      log.d('[ROUTES] Loaded ' + items.length + ' items');
      log.d('[ROUTES] fromCache: ' + fromCache);
      
      // Добавление элементов
      ui.renderCatalogItems(page, items);
      
      currentPage++;
      
      // Проверка пагинации
      if (items.endOfData) {
        page.haveMore(false);
      } else {
        page.haveMore(true);
        
        // ✅ КЛЮЧЕВОЙ МОМЕНТ: Автозагрузка из кэша
        if (fromCache && currentPage <= 3) {
          log.d('[ROUTES] Auto-loading page ' + currentPage + ' from cache');
          setTimeout(loader, 10);
        }
      }
    });
  }

  // Первый вызов
  loader();
  
  // Установка пагинатора
  page.asyncPaginator = loader;
}
```

### Почему это работает

**Первое открытие (без кэша):**
```
Страница 1 → HTTP 200 → fromCache=false → НЕТ автозагрузки
Пользователь скроллит → загружается страница 2 (HTTP 200)
```

**Возврат (с кэшем):**
```
Страница 1 → HTTP 0 (кэш) → fromCache=true → Автозагрузка страницы 2
Страница 2 → HTTP 0 (кэш) → fromCache=true → Автозагрузка страницы 3
Страница 3 → HTTP 0 (кэш) → fromCache=true → Стоп (currentPage > 3)
Результат: 60 элементов вместо 20 ✅
```

---

## Custom кэш (Продвинутый)

### Обзор

Custom кэш - это собственная реализация кэширования с полным контролем над хранением и управлением данными.

**Преимущества:**
- ✅ Полный контроль над кэшем
- ✅ Можно кэшировать любые данные (не только HTTP)
- ✅ Передача данных между слоями приложения
- ✅ Кастомная логика вытеснения (LRU, LFU, TTL)
- ✅ Статистика и мониторинг

**Недостатки:**
- ❌ Больше кода для поддержки
- ❌ Ручное управление памятью
- ❌ Нужно самостоятельно реализовывать очистку

**Когда использовать:**
- Кэширование обработанных данных
- Передача данных между разными частями плагина
- Кэширование не-HTTP данных (вычисления, состояние)
- Специальная логика вытеснения
- Нужна детальная статистика

### 💡 Использование Custom Cache для передачи данных между слоями

Custom кэш можно использовать не только для HTTP кэширования, но и как **механизм передачи данных** между различными слоями приложения:

**Примеры использования:**

1. **Передача метаданных между страницами:**
```javascript
// На странице списка - сохраняем данные
cache.set('anime:' + animeId + ':metadata', {
  title: anime.title,
  poster: anime.poster,
  description: anime.description,
  episodes: anime.episodes
});

// На странице плеера - получаем данные
var metadata = cache.get('anime:' + animeId + ':metadata');
if (metadata) {
  page.metadata.title = metadata.title;
  page.metadata.icon = metadata.poster;
}
```

2. **Сохранение состояния между сессиями:**
```javascript
// Сохранение позиции просмотра
cache.set('playback:position:' + videoId, {
  position: currentTime,
  duration: totalDuration,
  timestamp: Date.now()
}, 86400000); // 24 часа

// Восстановление позиции
var savedPosition = cache.get('playback:position:' + videoId);
if (savedPosition && savedPosition.position > 0) {
  player.seek(savedPosition.position);
}
```

3. **Кэширование вычислений:**
```javascript
// Кэширование обработанных данных
function getProcessedAnimeList(rawData) {
  var cacheKey = 'processed:anime:' + rawData.page;
  var cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  // Тяжёлая обработка данных
  var processed = rawData.items.map(function(item) {
    return {
      // ... сложная обработка ...
    };
  });
  
  cache.set(cacheKey, processed, 600000); // 10 минут
  return processed;
}
```

4. **Передача данных между route handlers:**
```javascript
// В route handler списка
new page.Route('plugin:anime:list', function(page) {
  // Сохраняем выбранные фильтры
  cache.set('filters:current', {
    genre: selectedGenre,
    year: selectedYear,
    sorting: selectedSorting
  });
});

// В route handler деталей
new page.Route('plugin:anime:details:(.*)', function(page, id) {
  // Получаем фильтры для кнопки "Назад к списку"
  var filters = cache.get('filters:current');
  if (filters) {
    page.appendAction('Назад к списку', function() {
      navigation.openUrl('plugin:anime:list?' + buildQuery(filters));
    });
  }
});
```

5. **Кэширование API токенов и сессий:**
```javascript
// Сохранение токена авторизации
function login(username, password, callback) {
  api.authenticate(username, password, function(error, token) {
    if (!error && token) {
      cache.set('auth:token', token, 3600000); // 1 час
      cache.set('auth:username', username);
    }
    callback(error, token);
  });
}

// Использование токена в запросах
function makeAuthenticatedRequest(url, callback) {
  var token = cache.get('auth:token');
  if (!token) {
    callback(new Error('Not authenticated'), null);
    return;
  }
  
  http.request(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  }, callback);
}
```

**Ключевые преимущества для передачи данных:**
- Не нужно передавать данные через URL параметры
- Избегаем повторных API запросов
- Сохраняем состояние между навигацией
- Улучшаем производительность

### Создание модуля Custom Cache

**Файл: `lib/cache.js`**

```javascript
var config = require('./config');

var cacheStorage = {
  entries: {},
  stats: { hits: 0, misses: 0, size: 0 }
};

/**
 * Получить данные из кэша
 */
function get(key, maxAge) {
  if (!config.CACHE.ENABLED || !key) {
    return null;
  }
  
  var entry = cacheStorage.entries[key];
  
  if (!entry) {
    cacheStorage.stats.misses++;
    return null;
  }
  
  var age = Date.now() - entry.timestamp;
  var maxAgeToUse = maxAge !== undefined ? maxAge : config.CACHE.DURATION;
  
  if (age > maxAgeToUse) {
    remove(key);
    cacheStorage.stats.misses++;
    return null;
  }
  
  entry.lastAccess = Date.now();
  cacheStorage.stats.hits++;
  return entry.data;
}

/**
 * Сохранить данные в кэш
 */
function set(key, data, maxAge) {
  if (!config.CACHE.ENABLED || !key) {
    return;
  }
  
  var now = Date.now();
  var isNew = !cacheStorage.entries[key];
  
  cacheStorage.entries[key] = {
    data: data,
    timestamp: now,
    lastAccess: now,
    maxAge: maxAge || config.CACHE.DURATION
  };
  
  if (isNew) {
    cacheStorage.stats.size++;
  }
  
  // Очистка при достижении лимита
  if (cacheStorage.stats.size >= config.CACHE.MAX_ENTRIES) {
    removeLeastRecentlyUsed();
  }
}

/**
 * Удалить запись
 */
function remove(key) {
  if (cacheStorage.entries[key]) {
    delete cacheStorage.entries[key];
    cacheStorage.stats.size--;
  }
}

/**
 * Очистить весь кэш
 */
function clear() {
  cacheStorage.entries = {};
  cacheStorage.stats.size = 0;
}

/**
 * Получить статистику
 */
function getStats() {
  var total = cacheStorage.stats.hits + cacheStorage.stats.misses;
  var hitRate = total > 0 ? (cacheStorage.stats.hits / total * 100).toFixed(2) : 0;
  
  return {
    size: cacheStorage.stats.size,
    maxSize: config.CACHE.MAX_ENTRIES,
    hits: cacheStorage.stats.hits,
    misses: cacheStorage.stats.misses,
    hitRate: hitRate + '%',
    enabled: config.CACHE.ENABLED
  };
}

/**
 * LRU вытеснение
 */
function removeLeastRecentlyUsed() {
  var oldestKey = null;
  var oldestAccess = Date.now();
  
  for (var key in cacheStorage.entries) {
    var entry = cacheStorage.entries[key];
    if (entry.lastAccess < oldestAccess) {
      oldestAccess = entry.lastAccess;
      oldestKey = key;
    }
  }
  
  if (oldestKey) {
    remove(oldestKey);
  }
}

module.exports = {
  get: get,
  set: set,
  remove: remove,
  clear: clear,
  getStats: getStats
};
```

### Конфигурация Custom Cache

**Файл: `lib/config.js`**

```javascript
module.exports = {
  CACHE: {
    ENABLED: true,
    DURATION: 300000,      // 5 минут
    MAX_ENTRIES: 100,      // Максимум записей
    CLEANUP_THRESHOLD: 0.9 // Порог очистки
  }
};
```

### Интеграция Custom Cache в API

**Файл: `lib/api.js`**

```javascript
var http = require('movian/http');
var cache = require('./cache');
var config = require('./config');

var apiClient = {
  /**
   * HTTP запрос с кэшированием
   */
  request: function(url, options, callback) {
    var useCache = options.useCache !== false;
    var cacheMaxAge = options.cacheMaxAge || config.CACHE.DURATION;
    
    // Генерация ключа кэша
    var cacheKey = url + (options.postdata ? ':' + JSON.stringify(options.postdata) : '');
    
    // Проверка кэша
    if (useCache && config.CACHE.ENABLED) {
      var cachedData = cache.get(cacheKey, cacheMaxAge);
      if (cachedData !== null) {
        // Возврат из кэша с флагом
        setTimeout(function() {
          callback(null, cachedData, true);  // fromCache = true
        }, 0);
        return;
      }
    }
    
    // HTTP запрос
    http.request(url, options, function(error, response) {
      if (error) {
        callback(error, null, false);
        return;
      }
      
      if (response.statuscode !== 200) {
        callback(new Error('HTTP ' + response.statuscode), null, false);
        return;
      }
      
      try {
        var data = JSON.parse(response.toString());
        
        // Сохранение в кэш
        if (useCache && config.CACHE.ENABLED) {
          cache.set(cacheKey, data);
        }
        
        callback(null, data, false);  // fromCache = false
      } catch (parseError) {
        callback(parseError, null, false);
      }
    });
  },
  
  /**
   * Получить каталог с пагинацией
   */
  getCatalog: function(pageNum, callback) {
    var url = 'https://api.example.com/catalog?page=' + pageNum;
    
    this.request(url, {
      useCache: true,
      cacheMaxAge: 300000  // 5 минут
    }, function(error, data, fromCache) {
      if (error) {
        callback(error, null, false);
        return;
      }
      
      // Обработка данных
      var items = processData(data);
      callback(null, items, fromCache);
    });
  }
};

module.exports = apiClient;
```

---

## Сравнение подходов

### Таблица сравнения

| Критерий | Встроенный HTTP кэш | Custom кэш |
|----------|---------------------|------------|
| **Сложность реализации** | ⭐ Простой | ⭐⭐⭐ Сложный |
| **Количество кода** | Минимальный | Много кода |
| **Управление** | Автоматическое | Ручное |
| **Определение источника** | `statuscode === 0` | Флаг `fromCache` |
| **Типы данных** | Только HTTP ответы | Любые данные |
| **Передача между слоями** | ❌ Нет | ✅ Да |
| **Статистика** | ❌ Нет | ✅ Да (hits, misses, size) |
| **LRU вытеснение** | ✅ Автоматическое | ✅ Ручная реализация |
| **Производительность** | ⚡ Высокая | ⚡ Средняя |
| **Гибкость** | ⭐⭐ Ограниченная | ⭐⭐⭐ Полная |
| **Когда использовать** | По умолчанию | Специальные случаи |

### Рекомендации по выбору

**Используйте встроенный HTTP кэш когда:**
- ✅ Кэшируете HTTP запросы к API
- ✅ Нужна простая реализация
- ✅ Стандартная пагинация
- ✅ Не нужна статистика
- ✅ Не нужна передача данных между слоями

**Используйте Custom кэш когда:**
- ✅ Нужно кэшировать обработанные данные
- ✅ Передача данных между route handlers
- ✅ Кэширование вычислений
- ✅ Нужна детальная статистика
- ✅ Специальная логика вытеснения
- ✅ Кэширование не-HTTP данных

### Можно ли комбинировать?

**Да!** Можно использовать оба подхода одновременно:

```javascript
// Встроенный HTTP кэш для API запросов
http.request(url, {
  caching: true,
  cacheTime: 300000
}, function(error, response) {
  var data = JSON.parse(response.toString());
  
  // Custom кэш для обработанных данных
  var processed = processData(data);
  customCache.set('processed:' + key, processed);
});
```



---

## Асинхронная пагинация

### Правильный порядок операций

```javascript
function loader() {
  console.log('Loading page:', currentPage);
  
  apiClient.getCatalog(currentPage, function(error, items, fromCache) {
    // 1. Сбросить loading
    page.loading = false;
    
    // 2. Обработать ошибку
    if (error) {
      console.error('Error:', error);
      page.haveMore(false);
      return;  // ⚠️ ВАЖНО: выход из функции
    }
    
    // 3. Добавить элементы
    items.forEach(function(item) {
      page.appendItem(item.url, 'video', {
        title: item.title,
        icon: item.icon
      });
    });
    
    // 4. Увеличить счётчик
    currentPage++;
    
    // 5. Проверить пагинацию
    if (items.endOfData) {
      page.haveMore(false);
    } else {
      page.haveMore(true);
    }
  });
}
```

### ❌ Типичные ошибки

**Ошибка 1: Отсутствие return после ошибки**
```javascript
// ❌ НЕПРАВИЛЬНО
if (error) {
  page.haveMore(false);
  // Код продолжает выполняться!
}
items.forEach(...);  // Выполнится даже при ошибке
```

```javascript
// ✅ ПРАВИЛЬНО
if (error) {
  page.haveMore(false);
  return;  // Выход из функции
}
items.forEach(...);  // Не выполнится при ошибке
```

**Ошибка 2: Неправильный порядок операций**
```javascript
// ❌ НЕПРАВИЛЬНО
page.haveMore(true);      // Сначала
items.forEach(...);       // Потом
currentPage++;
```

```javascript
// ✅ ПРАВИЛЬНО
items.forEach(...);       // Сначала добавляем
currentPage++;            // Потом увеличиваем
page.haveMore(true);      // Потом проверяем
```

**Ошибка 3: page.loading в конце**
```javascript
// ❌ НЕПРАВИЛЬНО
apiClient.getCatalog(currentPage, function(error, items) {
  // ... код ...
  page.loading = false;  // В конце
});
```

```javascript
// ✅ ПРАВИЛЬНО
apiClient.getCatalog(currentPage, function(error, items) {
  page.loading = false;  // В начале callback
  // ... код ...
});
```

---

## Интеграция кэша и пагинации

### Проблема: Только первая страница при возврате

При возврате на страницу с кэшем показывается только первая страница, потому что:
1. `page.flush()` очищает все элементы
2. Данные из кэша загружаются мгновенно
3. `page.asyncPaginator` не успевает загрузить следующие страницы

### Решение: Автозагрузка из кэша

```javascript
function loader() {
  apiClient.getCatalog(currentPage, function(error, items, fromCache) {
    page.loading = false;
    
    if (error) {
      page.haveMore(false);
      return;
    }
    
    // Добавление элементов
    items.forEach(function(item) {
      page.appendItem(item.url, 'video', {
        title: item.title
      });
    });
    
    currentPage++;
    
    if (items.endOfData) {
      page.haveMore(false);
    } else {
      page.haveMore(true);
      
      // ✅ Автозагрузка следующих страниц из кэша
      if (fromCache && currentPage <= 3) {
        console.log('Auto-loading page', currentPage, 'from cache');
        setTimeout(function() {
          loader();
        }, 10);  // Небольшая задержка для UI
      }
    }
  });
}
```

### Почему это работает

**Первое открытие (без кэша):**
```
Страница 1 → HTTP запрос → fromCache=false → НЕТ автозагрузки
Пользователь скроллит → загружается страница 2
```

**Возврат (с кэшем):**
```
Страница 1 → Кэш → fromCache=true → Автозагрузка страницы 2
Страница 2 → Кэш → fromCache=true → Автозагрузка страницы 3
Страница 3 → Кэш → fromCache=true → Стоп (currentPage > 3)
Результат: 60 элементов вместо 20
```

---

## Лучшие практики

### 1. Выбор правильного подхода

**Встроенный HTTP кэш (рекомендуется):**
```javascript
// ✅ Для большинства случаев
http.request(url, {
  caching: true,
  cacheTime: 300000
}, callback);
```

**Custom кэш (специальные случаи):**
```javascript
// ✅ Для передачи данных между слоями
cache.set('anime:' + id + ':metadata', metadata);
```

### 2. Уникальные ключи кэша

```javascript
// ✅ ПРАВИЛЬНО: Включает все параметры
var cacheKey = url + ':' + JSON.stringify(params);

// Примеры:
// "https://api.com/catalog?page=1"
// "https://api.com/catalog?page=2"
// "https://api.com/search:{"query":"anime"}"
```

```javascript
// ❌ НЕПРАВИЛЬНО: Один ключ для всех страниц
var cacheKey = 'catalog';  // Все страницы перезаписывают друг друга
```

### 3. Кэшировать RAW данные

```javascript
// ✅ ПРАВИЛЬНО: Кэшируем RAW данные от API
cache.set(cacheKey, rawData);

// Обработка происходит каждый раз
var processedItems = processData(rawData);
callback(null, processedItems);
```

```javascript
// ❌ НЕПРАВИЛЬНО: Кэшируем обработанные данные
var processedItems = processData(rawData);
cache.set(cacheKey, processedItems);  // Нельзя изменить обработку
```

**Почему RAW данные:**
- Обработка может меняться (новые поля, форматирование)
- RAW данные универсальны
- Можно переиспользовать для разных целей

### 4. Асинхронный возврат из кэша

```javascript
// ✅ ПРАВИЛЬНО: Асинхронный возврат
if (cachedData !== null) {
  setTimeout(function() {
    callback(null, cachedData, true);
  }, 0);
  return;
}
```

```javascript
// ❌ НЕПРАВИЛЬНО: Синхронный возврат
if (cachedData !== null) {
  callback(null, cachedData, true);  // Может заблокировать UI
  return;
}
```

**Почему setTimeout(0):**
- Даёт Movian время обработать страницу
- Предотвращает блокировку UI
- Делает поведение предсказуемым

```javascript
// ✅ ПРАВИЛЬНО: Передаём флаг fromCache
callback(null, data, true);   // Из кэша
callback(null, data, false);  // Из HTTP
```

**Использование:**
- Автозагрузка страниц из кэша
- Отладка (логирование источника данных)
- Аналитика (скорость загрузки)

### 6. Ограничение автозагрузки

```javascript
// ✅ ПРАВИЛЬНО: Ограничение на 3 страницы
if (fromCache && currentPage <= 3) {
  setTimeout(loader, 10);
}
```

```javascript
// ❌ НЕПРАВИЛЬНО: Без ограничения
if (fromCache) {
  setTimeout(loader, 10);  // Может загрузить все страницы
}
```

**Почему ограничение:**
- Баланс между UX и производительностью
- Не перегружает UI
- Экономит память

### 7. Задержка между автозагрузками

```javascript
// ✅ ПРАВИЛЬНО: Задержка 10-50ms
setTimeout(function() {
  loader();
}, 10);
```

```javascript
// ❌ НЕПРАВИЛЬНО: Без задержки
loader();  // Может заблокировать UI
```

### 8. Логирование для отладки

```javascript
function loader() {
  console.log('[PAGINATION] Loading page:', currentPage);
  
  apiClient.getCatalog(currentPage, function(error, items, fromCache) {
    console.log('[PAGINATION] Loaded', items.length, 'items');
    console.log('[PAGINATION] fromCache:', fromCache);
    console.log('[PAGINATION] endOfData:', items.endOfData);
    
    // ... код ...
  });
}
```

### 9. Определение endOfData

```javascript
// ✅ ПРАВИЛЬНО: Используем metadata от API
if (data.meta && data.meta.pagination) {
  items.endOfData = data.meta.pagination.current_page >= data.meta.pagination.total_pages;
} else {
  // Fallback
  items.endOfData = data.items.length < PAGE_SIZE;
}
```

```javascript
// ❌ НЕПРАВИЛЬНО: Только по количеству элементов
items.endOfData = data.items.length < PAGE_SIZE;
// Проблема: Если API вернул меньше элементов, endOfData будет true
```

---

## Типичные ошибки

### Ошибка 1: Глобальный счётчик страниц

```javascript
// ❌ НЕПРАВИЛЬНО: Глобальная переменная
var currentPage = 1;

new page.Route('plugin:catalog', function(page) {
  // currentPage НЕ сбрасывается при повторном входе
  function loader() {
    // ...
  }
});
```

```javascript
// ✅ ПРАВИЛЬНО: Локальная переменная
new page.Route('plugin:catalog', function(page) {
  var currentPage = 1;  // Сбрасывается при каждом входе
  
  function loader() {
    // ...
  }
});
```

### Ошибка 2: Забыли page.flush()

```javascript
// ❌ НЕПРАВИЛЬНО: Без page.flush()
new page.Route('plugin:catalog', function(page) {
  var currentPage = 1;
  // Старые элементы остаются на странице
  
  loader();
  page.asyncPaginator = loader;
});
```

```javascript
// ✅ ПРАВИЛЬНО: С page.flush()
new page.Route('plugin:catalog', function(page) {
  var currentPage = 1;
  page.flush();  // Очищаем старые элементы
  
  loader();
  page.asyncPaginator = loader;
});
```

### Ошибка 3: Не вызвали loader() первый раз

```javascript
// ❌ НЕПРАВИЛЬНО: Только asyncPaginator
new page.Route('plugin:catalog', function(page) {
  function loader() {
    // ...
  }
  
  page.asyncPaginator = loader;  // Не вызовется автоматически
});
```

```javascript
// ✅ ПРАВИЛЬНО: Первый вызов + asyncPaginator
new page.Route('plugin:catalog', function(page) {
  function loader() {
    // ...
  }
  
  loader();  // Первый вызов
  page.asyncPaginator = loader;  // Для следующих страниц
});
```

### Ошибка 4: Кэш без уникальных ключей

```javascript
// ❌ НЕПРАВИЛЬНО: Один ключ для всех
var cacheKey = 'catalog';
cache.set(cacheKey, data);  // Страница 2 перезапишет страницу 1
```

```javascript
// ✅ ПРАВИЛЬНО: Уникальный ключ для каждой страницы
var cacheKey = 'catalog:page:' + pageNum;
cache.set(cacheKey, data);
```

---

## Примеры кода

### Пример 1: Простая пагинация без кэша

```javascript
var page = require('movian/page');
var http = require('movian/http');

new page.Route('plugin:catalog', function(page) {
  page.type = "directory";
  page.metadata.title = "Catalog";
  
  var currentPage = 1;
  page.flush();
  
  function loader() {
    var url = 'https://api.example.com/items?page=' + currentPage;
    
    http.request(url, {}, function(error, response) {
      page.loading = false;
      
      if (error) {
        page.appendItem('', 'separator', {
          title: 'Error: ' + error
        });
        page.haveMore(false);
        return;
      }
      
      var data = JSON.parse(response.toString());
      
      data.items.forEach(function(item) {
        page.appendItem('plugin:item:' + item.id, 'video', {
          title: item.title,
          icon: item.poster
        });
      });
      
      currentPage++;
      page.haveMore(currentPage <= data.totalPages);
    });
  }
  
  loader();
  page.asyncPaginator = loader;
});
```

### Пример 2: Пагинация с кэшем

```javascript
var page = require('movian/page');
var apiClient = require('./lib/api');  // С кэшированием

new page.Route('plugin:catalog', function(page) {
  page.type = "directory";
  page.metadata.title = "Catalog";
  
  var currentPage = 1;
  page.flush();
  
  function loader() {
    apiClient.getCatalog(currentPage, function(error, items, fromCache) {
      page.loading = false;
      
      if (error) {
        page.appendItem('', 'separator', {
          title: 'Error: ' + error
        });
        page.haveMore(false);
        return;
      }
      
      items.forEach(function(item) {
        page.appendItem(item.url, 'video', {
          title: item.title,
          icon: item.icon
        });
      });
      
      currentPage++;
      
      if (items.endOfData) {
        page.haveMore(false);
      } else {
        page.haveMore(true);
        
        // Автозагрузка из кэша
        if (fromCache && currentPage <= 3) {
          setTimeout(function() {
            loader();
          }, 10);
        }
      }
    });
  }
  
  loader();
  page.asyncPaginator = loader;
});
```

### Пример 3: Пагинация с обработкой данных

```javascript
var page = require('movian/page');
var apiClient = require('./lib/api');

function processItems(rawData) {
  return rawData.items.map(function(item) {
    return {
      id: item.id,
      url: 'plugin:item:' + item.id,
      title: item.name,
      description: truncate(item.description, 200),
      icon: getOptimizedImage(item.poster),
      year: item.year,
      rating: calculateRating(item.likes)
    };
  });
}

new page.Route('plugin:catalog', function(page) {
  page.type = "directory";
  page.metadata.title = "Catalog";
  
  var currentPage = 1;
  page.flush();
  
  function loader() {
    apiClient.getCatalog(currentPage, function(error, rawData, fromCache) {
      page.loading = false;
      
      if (error) {
        page.haveMore(false);
        return;
      }
      
      // Обработка данных
      var items = processItems(rawData);
      
      items.forEach(function(item) {
        page.appendItem(item.url, 'video', {
          title: item.title,
          description: item.description,
          icon: item.icon,
          year: item.year,
          rating: item.rating
        });
      });
      
      currentPage++;
      
      var endOfData = rawData.pagination.current >= rawData.pagination.total;
      
      if (endOfData) {
        page.haveMore(false);
      } else {
        page.haveMore(true);
        
        if (fromCache && currentPage <= 3) {
          setTimeout(loader, 10);
        }
      }
    });
  }
  
  loader();
  page.asyncPaginator = loader;
});
```

---

## Чеклист для разработчиков

### Перед релизом проверьте:

- [ ] Кэш имеет уникальные ключи для каждой страницы
- [ ] RAW данные кэшируются, обработка происходит каждый раз
- [ ] Флаг `fromCache` передаётся через все уровни
- [ ] Автозагрузка ограничена (2-3 страницы)
- [ ] `page.loading = false` в начале callback
- [ ] `return` после обработки ошибки
- [ ] Элементы добавляются ПЕРЕД `page.haveMore()`
- [ ] `currentPage++` после добавления элементов
- [ ] `page.flush()` вызывается при входе на страницу
- [ ] `loader()` вызывается первый раз вручную
- [ ] `page.asyncPaginator = loader` установлен
- [ ] Логирование для отладки добавлено
- [ ] `endOfData` определяется правильно
- [ ] Задержка между автозагрузками (10-50ms)
- [ ] Кэш можно отключить через конфиг

---

## Заключение

Правильная реализация пагинации и кэширования:
- Улучшает пользовательский опыт
- Снижает нагрузку на API
- Ускоряет загрузку контента
- Экономит трафик

Следуйте этому руководству, и ваш плагин будет работать быстро и надёжно!

---

## Дополнительные ресурсы

- [Официальный пример Movian: async_page_load](../movian/plugin_examples/async_page_load/)
- [Документация Movian Page API](https://movian.tv/docs/)
- [Исходный код плагина Anilibria.tv](./lib/)

---

**Версия:** 1.0  
**Дата:** 2025-11-14  
**Автор:** Anilibria.tv Plugin Team
