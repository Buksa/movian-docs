# Руководство разработчика по canonicalUrl для Movian плагинов

## 1. Быстрый старт

**Что такое canonicalUrl:** `canonicalUrl` - это стабильный идентификатор контента, который Movian использует для сохранения истории воспроизведения (позиция, счетчик просмотров, статус просмотра). Вместо динамических URL, которые могут меняться, `canonicalUrl` обеспечивает постоянную привязку к базе данных metadb.

**Минимальный пример:**
```javascript
// 1. Создайте функцию генерации стабильных ID
function getCanonicalUrl(content) {
    var parts = ['myplugin', content.type, content.id];
    if (content.type === 'serial') {
        parts.push(content.season || '0');
        parts.push(content.episode || '0');
    }
    return parts.join(':');
}

// 2. При добавлении элемента привяжите историю
var item = page.appendItem(url, 'video', {
    title: content.title,
    canonical_url: getCanonicalUrl(content)
});

// 3. Вызовите bindPlayInfo для сохранения истории
require('native/metadata').bindPlayInfo(item.root, getCanonicalUrl(content));
```

---

## 2. Паттерны использования

### 2.1 API-based паттерн
```javascript
// Когда у вас есть стабильные ID из API
function getCanonicalUrl(content) {
    return 'api:' + content.service + ':' + content.type + ':' + content.id;
}

// Пример: 'api:netflix:movie:12345'
```

### 2.2 Web-scraping паттерн  
```javascript
// Когда парсите HTML и извлекаете ID из URL
function getCanonicalUrl(content) {
    var id = content.url.match(/\/video\/(\d+)/)[1];
    return 'scraped:' + content.domain + ':' + content.type + ':' + id;
}

// Пример: 'scraped:youtube:video:abc123'
```

### 2.3 Иерархический паттерн
```javascript
// Для сериалов с сезонами/эпизодами
function getCanonicalUrl(content) {
    var parts = ['plugin', content.type, content.id];
    if (content.type === 'serial') {
        parts.push(content.season || '0');
        parts.push(content.episode || '0');
    }
    return parts.join(':');
}

// Пример: 'plugin:serial:show123:2:5'
```

### 2.4 Videoparams паттерн
```javascript
// При передаче в движок воспроизведения
function playVideo(page, video) {
    var canonicalUrl = getCanonicalUrl(video);
    
    var vParams = {
        canonicalUrl: canonicalUrl,
        sources: [{ url: video.streamUrl }],
        title: video.title,
        year: video.year || 0
    };
    
    page.appendItem('videoparams:' + JSON.stringify(vParams), 'video', {
        title: video.title
    });
}
```

---

## 3. Movian API

### 3.1 Videoparams обработка
**Источник:** `res/ecmascript/modules/movian/page.js:275-292`
```javascript
var metabind_url = url;
if(url.indexOf('videoparams:') == 0) {
  try {
    var x = JSON.parse(url.substring(12));
    if(typeof(x.canonicalUrl) == 'string') {
      metabind_url = x.canonicalUrl;
    }
  } catch(e) {
  }
}
require('native/metadata').bindPlayInfo(root, metabind_url);
```

**Как работает:** Movian автоматически извлекает `canonicalUrl` из `videoparams` и вызывает `bindPlayInfo`.

### 3.2 bindPlayInfo API
```javascript
// JavaScript уровень
require('native/metadata').bindPlayInfo(item.root, canonicalUrl);

// C уровень (src/ecmascript/es_metadata.c:107-112)
static int
es_bind_play_info(duk_context *ctx)
{
  struct prop *p = es_stprop_get(ctx, 0);
  const char *url = duk_to_string(ctx, 1);
  playinfo_bind_url_to_prop(url, p);
  return 0;
}
```

**Что делает:** Привязывает элемент к metadb для сохранения истории.

---

## 4. DO/DON'T

### ✅ DO - Правила

**1. Используйте стабильные ID**
```javascript
// ✅ ПРАВИЛЬНО
function getCanonicalUrl(content) {
    return 'myplugin:' + content.type + ':' + content.id;
}
```

**2. Привязывайте немедленно после appendItem**
```javascript
// ✅ ПРАВИЛЬНО
var item = page.appendItem(url, 'video', meta);
require('native/metadata').bindPlayInfo(item.root, canonicalUrl);
```

**3. Передавайте в videoparams для воспроизведения**
```javascript
// ✅ ПРАВИЛЬНО
var vParams = {
    canonicalUrl: canonicalUrl,
    sources: [{ url: streamUrl }]
};
```

### ❌ DON'T - Антипаттерны

**1. НЕ используйте динамические URL**
```javascript
// ❌ НЕПРАВИЛЬНО
var canonicalUrl = 'https://site.com/video?token=' + Date.now();
```

**2. НЕ используйте session данные**
```javascript
// ❌ НЕПРАВИЛЬНО  
var canonicalUrl = 'movie:' + userId + ':' + sessionId + ':' + movieId;
```

**3. НЕ забывайте обрабатывать ошибки**
```javascript
// ❌ НЕПРАВИЛЬНО
require('native/metadata').bindPlayInfo(item.root, canonicalUrl);

// ✅ ПРАВИЛЬНО
try {
    require('native/metadata').bindPlayInfo(item.root, canonicalUrl);
} catch (e) {
    // Модуль недоступен или тип не поддерживает биндинг
}
```

---

## 5. Troubleshooting

### 5.1 Проблема: История не сохраняется
**Причина:** Отсутствует `canonicalUrl` в videoparams
**Решение:** Убедитесь, что `canonicalUrl` передается в `vParams`
```javascript
var vParams = {
    canonicalUrl: canonicalUrl,  // Обязательно!
    sources: [{ url: streamUrl }]
};
```

### 5.2 Проблема: Позиция воспроизведения не запоминается  
**Причина:** Неправильный порядок вызовов
**Решение:** Вызывайте `bindPlayInfo` сразу после `appendItem`
```javascript
var item = page.appendItem(url, 'video', meta);
require('native/metadata').bindPlayInfo(item.root, canonicalUrl);  // Немедленно!
```

### 5.3 Проблема: Ошибка bindPlayInfo
**Причина:** Модуль недоступен или тип элемента не поддерживает биндинг
**Решение:** Оберните в try-catch
```javascript
try {
    require('native/metadata').bindPlayInfo(item.root, canonicalUrl);
} catch (e) {
    // Игнорировать ошибку
}
```

---

## 6. Полные примеры

### 6.1 Фильмовый плагин
```javascript
// movie-plugin.js
function getCanonicalUrl(movie) {
    return 'mymovies:movie:' + movie.id;
}

function appendMovies(page, movies) {
    movies.forEach(function(movie) {
        var canonicalUrl = getCanonicalUrl(movie);
        
        var meta = {
            title: movie.title,
            icon: movie.poster,
            canonical_url: canonicalUrl
        };
        
        var item = page.appendItem('play:' + movie.id, 'video', meta);
        
        try {
            require('native/metadata').bindPlayInfo(item.root, canonicalUrl);
        } catch (e) {
            // Игнорировать ошибку
        }
    });
}

function playMovie(page, movieId) {
    var movie = getMovieData(movieId);
    var canonicalUrl = getCanonicalUrl(movie);
    
    page.metadata.canonical_url = canonicalUrl;
    
    getVideoUrl(movieId, function(streamUrl) {
        var vParams = {
            canonicalUrl: canonicalUrl,
            sources: [{ url: streamUrl }],
            title: movie.title,
            year: movie.year
        };
        
        page.appendItem('videoparams:' + JSON.stringify(vParams), 'video', {
            title: movie.title
        });
    });
}
```

### 6.2 Сериальный плагин
```javascript
// series-plugin.js  
function getCanonicalUrl(content) {
    var parts = ['myseries', content.type, content.id];
    if (content.type === 'episode') {
        parts.push(content.season || '0');
        parts.push(content.episode || '0');
    }
    return parts.join(':');
}

function appendEpisodes(page, series) {
    series.episodes.forEach(function(episode) {
        var canonicalUrl = getCanonicalUrl({
            type: 'episode',
            id: series.id,
            season: episode.season,
            episode: episode.number
        });
        
        var meta = {
            title: 'S' + episode.season + 'E' + episode.number + ': ' + episode.title,
            icon: episode.still,
            canonical_url: canonicalUrl,
            vtype: 'tvseries',
            episode: {
                title: episode.title,
                number: parseInt(episode.number)
            },
            season: {
                number: parseInt(episode.season)
            }
        };
        
        var item = page.appendItem('play:' + series.id + ':' + episode.season + ':' + episode.number, 'video', meta);
        
        try {
            require('native/metadata').bindPlayInfo(item.root, canonicalUrl);
        } catch (e) {
            // Игнорировать ошибку
        }
    });
}

function playEpisode(page, seriesId, season, episode) {
    var content = {
        type: 'episode',
        id: seriesId,
        season: season,
        episode: episode
    };
    var canonicalUrl = getCanonicalUrl(content);
    
    page.metadata.canonical_url = canonicalUrl;
    
    getEpisodeStream(seriesId, season, episode, function(streamUrl) {
        var vParams = {
            canonicalUrl: canonicalUrl,
            sources: [{ url: streamUrl }],
            title: 'S' + season + 'E' + episode,
            season: parseInt(season),
            episode: parseInt(episode)
        };
        
        page.appendItem('videoparams:' + JSON.stringify(vParams), 'video', {
            title: 'S' + season + 'E' + episode
        });
    });
}
```

---

## 7. Взаимосвязь с KVStore

### 7.1 Что такое KVStore
**KVStore** - это ключевое хранилище Movian, которое используется для сохранения метаданных воспроизведения. `canonicalUrl` является ключом для доступа к данным в KVStore.

### 7.2 Структура данных в KVStore
**Источник:** `src/metadata/playinfo.c:141-148`
```c
mii->mii_playcount  =
  kv_url_opt_get_int(url, KVSTORE_DOMAIN_SYS, "playcount", 0);

mii->mii_lastplayed =
  kv_url_opt_get_int(url, KVSTORE_DOMAIN_SYS, "lastplayed", 0);

mii->mii_restartpos =
  kv_url_opt_get_int64(url, KVSTORE_DOMAIN_SYS, "restartposition", 0);
```

**Ключи KVStore для canonicalUrl:**
- `playcount` - количество просмотров
- `lastplayed` - время последнего просмотра (timestamp)
- `restartposition` - позиция воспроизведения в миллисекундах

### 7.3 Автоматическое сохранение истории
**Источник:** `src/metadata/playinfo.c:50-54`
```c
kv_url_opt_set(url, KVSTORE_DOMAIN_SYS, "playcount",
               KVSTORE_SET_INT, cur + 1);

kv_url_opt_set(url, KVSTORE_DOMAIN_SYS, "lastplayed",
               KVSTORE_SET_INT, (int)(time(NULL)));
```

**Источник:** `src/metadata/playinfo.c:68-70`
```c
kv_url_opt_set(url, KVSTORE_DOMAIN_SYS, "restartposition",
               f | (pos_ms <= 0 ? KVSTORE_SET_VOID : KVSTORE_SET_INT64),
               pos_ms);
```

### 7.4 Домены KVStore
**Источник:** `src/db/kvstore.h:32-34`
```c
#define KVSTORE_DOMAIN_SYS     1  // Системные данные (playcount, restartposition)
#define KVSTORE_DOMAIN_PROP    2  // Свойства элементов
#define KVSTORE_DOMAIN_PLUGIN  3  // Данные плагинов
#define KVSTORE_DOMAIN_SETTING 4  // Настройки
```

### 7.5 Прямой доступ к KVStore из плагина
**Источник:** `src/ecmascript/es_kvstore.c:120-126`

**Доступные функции:**
```javascript
var kvstore = require('native/kvstore');

// Чтение данных
var stringValue = kvstore.getString(canonicalUrl, 'plugin', 'myKey'); // null если не найдено
var intValue = kvstore.getInteger(canonicalUrl, 'plugin', 'myKey', defaultValue);
var boolValue = kvstore.getBoolean(canonicalUrl, 'plugin', 'myKey', defaultValue);

// Запись данных
kvstore.set(canonicalUrl, 'plugin', 'myKey', 'stringValue');  // строка
kvstore.set(canonicalUrl, 'plugin', 'myKey', 123);          // число
kvstore.set(canonicalUrl, 'plugin', 'myKey', true);         // boolean
kvstore.set(canonicalUrl, 'plugin', 'myKey', null);         // удалить
```

**ВАЖНО:** Из плагинов доступен только домен `'plugin'`!
**Источник:** `src/ecmascript/es_kvstore.c:34-37`
```c
if(!strcmp(domain, "plugin"))
  return KVSTORE_DOMAIN_PLUGIN;

duk_error(ctx, DUK_ERR_ERROR, "Unknown domain %s", domain);
```

**Правильные примеры:**
```javascript
// ✅ ПРАВИЛЬНО - только домен 'plugin'
var myRating = kvstore.getInteger(canonicalUrl, 'plugin', 'rating', 0);
kvstore.set(canonicalUrl, 'plugin', 'lastWatched', '2026-01-10');

// ❌ НЕПРАВИЛЬНО - домен 'sys' недоступен из плагинов
var playcount = kvstore.getInteger(canonicalUrl, 'sys', 'playcount', 0); // ОШИБКА!
```

**Чтение системных данных через settings:**
```javascript
// Для чтения системных данных используйте metadata API
try {
    var metadata = require('native/metadata');
    // Но прямой доступ к sys домену из плагина заблокирован
} catch (e) {
    // Используйте каналы metadata API
}
```

### 7.6 Очистка истории

**ВАЖНО:** Прямая очистка системных данных (`sys` домен) из плагинов невозможна!

**Источник:** `src/ecmascript/es_kvstore.c:34-37`
```c
if(!strcmp(domain, "plugin"))
  return KVSTORE_DOMAIN_PLUGIN;

duk_error(ctx, DUK_ERR_ERROR, "Unknown domain %s", domain);
```

**Что можно очищать из плагина:**
```javascript
// ✅ ПРАВИЛЬНО - очистка только plugin домена
kvstore.set(canonicalUrl, 'plugin', 'myRating', null);
kvstore.set(canonicalUrl, 'plugin', 'watchDate', null);
```

**Системные данные очищаются только Movian:**
- `playcount` - очищается автоматически при достижении 100% просмотра
- `lastplayed` - обновляется при каждом воспроизведении  
- `restartposition` - очищается при полном просмотре

**Для принудительной очистки истории:**
```javascript
// Используйте metadata API (если доступно)
try {
    // Но прямой очистки sys домена из плагина нет
    // Только через нативные методы Movian
} catch (e) {
    // Альтернатива: создайте plugin-флаг для игнорирования истории
    kvstore.set(canonicalUrl, 'plugin', 'ignoreHistory', true);
}
```

---

## Ключевые моменты

- **Стабильность:** `canonicalUrl` должен быть постоянным для одного и того же контента
- **Уникальность:** Разный контент должен иметь разные `canonicalUrl`
- **Автоматическая обработка:** Movian автоматически извлекает `canonicalUrl` из `videoparams`
- **История:** `bindPlayInfo` связывает элемент с metadb для сохранения истории
- **Обработка ошибок:** Всегда оборачивайте `bindPlayInfo` в try-catch
- **KVStore интеграция:** `canonicalUrl` используется как ключ для доступа к истории воспроизведения в KVStore

**Готово к использованию в любых Movian плагинах.**
