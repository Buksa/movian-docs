# 📚 Навигация в Movian: Руководство разработчика

**Версия:** 1.0  
**Дата:** 2025-11-20  
**Статус:** Готово к использованию

---

## 📖 Содержание

- [Быстрый старт](#-быстрый-старт)
- [Два способа навигации](#-два-способа-навигации)
- [Установка](#-установка)
- [API Reference](#-api-reference)
- [Примеры использования](#-примеры-использования)
- [Правила использования](#-правила-использования)
- [Решение проблем](#-решение-проблем)
- [Внутреннее устройство](#-внутреннее-устройство)
- [Чеклист для разработчика](#-чеклист-для-разработчика)
- [Заключение](#-заключение)

---

## 🚀 Быстрый старт

### Проблема

```javascript
// ❌ ПРОБЛЕМА: История навигации не работает
page.redirect("myapp:video:123");
// При нажатии "Назад" пропускает предыдущую страницу
```

### Решение

```javascript
// ✅ РЕШЕНИЕ: Используйте navigation.openUrl()
var navigation = require('./lib/navigation');
navigation.openUrl("myapp:video:123");
// При нажатии "Назад" возвращает на предыдущую страницу
```

---

## 📊 Два способа навигации

### Сравнительная таблица

| Метод | Назначение | История | Кнопка "Назад" | Когда использовать |
|-------|-----------|---------|----------------|-------------------|
| **`page.redirect(url)`** | Замена страницы | ❌ Не сохраняет | ❌ Пропускает | Редиректы, ошибки |
| **`navigation.openUrl(url)`** | Навигация вперёд | ✅ Сохраняет | ✅ Возвращает | Переходы, продолжение |

### Визуальное сравнение

```
📍 redirect - Замена страницы:
[Главная] → [Аниме] → redirect → [Плеер]
                └─ уничтожена
Назад: [Плеер] → [Главная] ❌ (пропустили Аниме)

📍 openUrl - Навигация вперёд:
[Главная] → [Аниме] → openUrl → [Плеер]
            └─ в истории
Назад: [Плеер] → [Аниме] → [Главная] ✅
```

---

## ⚙️ Установка

### Шаг 1: Создать `lib/navigation.js`

```javascript
/**
 * navigation.js - Helper для правильной навигации в Movian
 * 
 * Использует navigator.eventSink вместо page.eventSink
 * для корректной работы истории навигации
 */

var prop = require('movian/prop');

/**
 * Получить eventSink навигатора
 * @returns {Object|null} Navigator eventSink или null
 */
function getNavigatorEventSink() {
  try {
    var navigators = prop.global.navigators;
    if (!navigators) {
      console.error('[NAV] prop.global.navigators not found');
      return null;
    }
    
    // Получить первый navigator через nodes[0]
    if (navigators.nodes) {
      var nav = navigators.nodes[0];
      if (nav && nav.eventSink) {
        return nav.eventSink;
      }
    }
    
    console.error('[NAV] navigator.eventSink not found');
    return null;
  } catch (e) {
    console.error('[NAV] Error getting navigator eventSink:', e);
    return null;
  }
}

/**
 * Открыть URL с сохранением истории навигации
 * 
 * @param {string} url - URL для открытия
 * @param {Object} options - Опции (необязательно)
 * @param {string} options.view - Тип представления (video, directory, etc)
 * @param {string} options.how - Способ открытия (newTab, newPage, etc)
 * @param {string} options.parenturl - URL родительской страницы
 * @returns {boolean} true если успешно, false если ошибка
 * 
 * @example
 * // Простое использование
 * navigation.openUrl("myapp:video:123");
 * 
 * @example
 * // С опциями
 * navigation.openUrl("myapp:video:123", {
 *   view: "video",
 *   parenturl: "myapp:list"
 * });
 */
function openUrl(url, options) {
  options = options || {};
  
  var eventSink = getNavigatorEventSink();
  if (!eventSink) {
    console.error('[NAV] Cannot open URL: navigator eventSink not found');
    return false;
  }
  
  var args = { url: url };
  if (options.view) args.view = options.view;
  if (options.how) args.how = options.how;
  if (options.parenturl) args.parenturl = options.parenturl;
  
  try {
    prop.sendEvent(eventSink, "openurl", args);
    console.log('[NAV] Opened URL:', url);
    return true;
  } catch (e) {
    console.error('[NAV] Error sending openurl event:', e);
    return false;
  }
}

// Экспорт
exports.getNavigatorEventSink = getNavigatorEventSink;
exports.openUrl = openUrl;
```

### Шаг 2: Использовать в коде

```javascript
// В любом файле плагина
var navigation = require('./lib/navigation');

// Открыть URL
navigation.openUrl("myapp:page:123");
```

---

## 📚 API Reference

### `navigation.openUrl(url, options)`

Открывает URL с сохранением истории навигации.

#### Параметры

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| `url` | string | ✅ Да | URL для открытия |
| `options` | object | ❌ Нет | Дополнительные опции |
| `options.view` | string | ❌ Нет | Тип представления (video, directory) |
| `options.how` | string | ❌ Нет | Способ открытия (newTab, newPage) |
| `options.parenturl` | string | ❌ Нет | URL родительской страницы |

#### Возвращает

`boolean` - `true` если успешно, `false` если ошибка

#### Примеры

```javascript
// Минимальный
navigation.openUrl("myapp:video:123");

// С типом представления
navigation.openUrl("myapp:video:123", { view: "video" });

// Открыть в новой вкладке
navigation.openUrl("myapp:settings", { how: "newTab" });

// С контекстом родителя
navigation.openUrl("myapp:episode:5", {
  parenturl: "myapp:season:2"
});
```

---

### `navigation.getNavigatorEventSink()`

Получить eventSink навигатора (продвинутое использование).

#### Возвращает

`Object|null` - Navigator eventSink или null если не найден

#### Пример

```javascript
var eventSink = navigation.getNavigatorEventSink();
if (eventSink) {
  prop.sendEvent(eventSink, "openurl", { url: "..." });
}
```

---

## 💼 Примеры использования

### Пример 1: Автоматическое продолжение просмотра

```javascript
var popup = require('native/popup');
var navigation = require('./lib/navigation');

function findLastWatched(items) {
  var lastWatched = null;
  
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var playcount = item.root.playcount ? item.root.playcount.valueOf() : 0;
    
    if (playcount > 0) {
      lastWatched = {
        index: i,
        title: item.root.metadata.title.valueOf(),
        url: item.root.url.valueOf()
      };
    }
  }
  
  return lastWatched;
}

function resumePlayback(page, items) {
  setTimeout(function() {
    var lastWatched = findLastWatched(items);
    if (!lastWatched) return;
    
    var message = 'Продолжить просмотр?\n"' + lastWatched.title + '"';
    
    if (popup.message(message, true, true)) {
      // ✅ Используем openUrl для сохранения истории
      navigation.openUrl(lastWatched.url);
    }
  }, 1000);
}

new page.Route(/^myapp:series:(.*)$/, function(page, id) {
  page.type = 'directory';
  page.metadata.title = 'Эпизоды';
  
  // ... загрузка эпизодов в items ...
  
  resumePlayback(page, items);
  
  page.loading = false;
});
```

**Что происходит:**

1. Пользователь открывает страницу серий
2. Система находит последний просмотренный эпизод
3. Показывается popup "Продолжить просмотр?"
4. При нажатии "Да" открывается эпизод через `openUrl` → добавляется в историю
5. При нажатии "Назад" → возврат на страницу серий ✅

---

### Пример 2: Проверка авторизации

```javascript
var navigation = require('./lib/navigation');

new page.Route(/^myapp:premium:(.*)$/, function(page, contentId) {
  
  // Проверка авторизации
  if (!isLoggedIn()) {
    // ❌ redirect - страница премиум не добавляется в историю
    page.redirect("myapp:login?return=myapp:premium:" + contentId);
    return;
  }
  
  // Показываем премиум контент
  page.type = 'video';
  page.source = getPremiumVideo(contentId);
  page.loading = false;
});

new page.Route(/^myapp:login$/, function(page) {
  page.type = 'directory';
  page.metadata.title = 'Авторизация';
  
  page.appendAction("Войти", function() {
    if (login(username, password)) {
      // ✅ openUrl - возвращаем к контенту с сохранением истории
      var returnUrl = getQueryParam('return') || 'myapp:home';
      navigation.openUrl(returnUrl);
    }
  });
  
  page.loading = false;
});
```

**Что происходит:**

1. Пользователь пытается открыть премиум контент
2. Не авторизован → `redirect` на логин (страница премиум не в истории)
3. После успешного логина → `openUrl` открывает премиум контент (добавляется в историю)
4. Кнопка "Назад" не возвращает на страницу логина ✅

---

### Пример 3: Обработка ошибок контента

```javascript
var navigation = require('./lib/navigation');

new page.Route(/^myapp:player:(.*)$/, function(page, videoId) {
  var video = getVideo(videoId);
  
  // Проверка существования
  if (!video) {
    // ❌ redirect на ошибку (не добавляется в историю)
    page.redirect("myapp:error404");
    return;
  }
  
  // Проверка доступа
  if (!hasAccess(video)) {
    // ❌ redirect на страницу подписки
    page.redirect("myapp:subscribe?return=myapp:player:" + videoId);
    return;
  }
  
  page.type = 'video';
  page.source = video.url;
  page.metadata.title = video.title;
  page.loading = false;
});
```

**Что происходит:**

1. Пользователь пытается открыть видео
2. Если видео не найдено → `redirect` на страницу ошибки (не добавляется в историю)
3. Если нет доступа → `redirect` на страницу подписки (не добавляется в историю)
4. Кнопка "Назад" возвращает на предыдущую страницу, минуя ошибки ✅

---

## 🔧 Правила использования

### ✅ Используйте `navigation.openUrl()` когда

#### 1. Автоматический переход к контенту

```javascript
// Продолжить с последнего эпизода
if (shouldResume) {
  navigation.openUrl(lastEpisode.url); // ✅
}
```

#### 2. Навигация вперёд по контенту

```javascript
// Переход к следующему разделу после завершения действия
page.appendAction("Следующий раздел", function() {
  navigation.openUrl(nextSection.url); // ✅
});
```

#### 3. Переход после действия пользователя

```javascript
// После успешного логина
if (loginSuccess) {
  navigation.openUrl(returnUrl); // ✅
}
```

---

### ✅ Используйте `page.redirect()` когда

#### 1. Редирект из-за ошибки или проверки

```javascript
// Не авторизован
if (!isLoggedIn()) {
  page.redirect("myapp:login"); // ✅
  return;
}

// Контент не найден
if (!contentExists) {
  page.redirect("myapp:error404"); // ✅
  return;
}
```

#### 2. Окончание потока контента

```javascript
// Плейлист закончился - возврат к списку
if (!hasNextVideo) {
  page.redirect("myapp:playlist"); // ✅
}
```

---

## 🎯 Правило большого пальца

> **Спросите себя:** *"Должен ли пользователь вернуться на эту страницу кнопкой 'Назад'?"*
>
> - **ДА** → `navigation.openUrl()`
> - **НЕТ** → `page.redirect()`

---

## 🐛 Решение проблем

### Проблема 1: "Назад" пропускает страницы

**Симптомы:**

```
Открыли: Главная → Список → Детали → Плеер
"Назад": Вернулись на заглавную (пропустили Детали) ❌
```

**Причина:**
Используется `page.redirect()` вместо `navigation.openUrl()`

**Решение:**

```javascript
// ❌ Было
page.redirect(details.url);

// ✅ Стало
navigation.openUrl(details.url);
```

---

### Проблема 2: "navigator eventSink not found"

**Симптомы:**

```
[NAV] Error: navigator.eventSink not found
```

**Причина:**

- Navigator ещё не инициализирован
- Вызов слишком рано (до запуска UI)

**Решение:**

```javascript
// Добавить проверку и fallback
var success = navigation.openUrl(url);
if (!success) {
  console.log("Fallback to redirect");
  page.redirect(url);
}
```

---

### Проблема 3: Событие отправляется но ничего не происходит

**Симптомы:**

```
[NAV] Opened URL: myapp:test
// Но страница не открывается
```

**Причина:**

- Нет обработчика для этого URL (Route не зарегистрирован)
- Ошибка в обработчике Route

**Решение:**

```javascript
// Проверить что Route существует
new page.Route(/^myapp:test$/, function(page) {
  console.log("Route handler called"); // Добавить лог
  page.type = 'directory';
  page.loading = false;
});
```

---

## 🔬 Внутреннее устройство

### Как работает page.redirect() - подробно

**Шаг 1: Вызов из JavaScript**

```javascript
// В плагине
page.redirect("myapp:newpage");
```

**Шаг 2: Отправка события в C**

```javascript
// page.js:348
prop.sendEvent(this.root.eventSink, "redirect", url);
// Отправляет EVENT_REDIRECT в page.root.eventSink
```

**Шаг 3: Обработка в page_eventsink (navigator.c:620)**

```c
if(event_is_type(e, EVENT_REDIRECT)) {
  const event_payload_t *ep = (const event_payload_t *)e;
  page_redirect(np, ep->payload);
}
```

**Шаг 4: Функция page_redirect модифицирует текущую страницу**

```c
static void page_redirect(nav_page_t *np, const char *url)
{
  // np - это указатель на СУЩЕСТВУЮЩУЮ страницу в истории
  
  page_unsub(np);              // Отписаться от событий старого URL
  prop_destroy_childs(...);     // Очистить содержимое
  mystrset(&np->np_url, url);   // ЗАМЕНИТЬ URL на новый
  nav_page_setup_prop(np, ...); // Пересоздать свойства
  nav_open_backend(np);         // Открыть новый контент
  
  // np->np_history_link НЕ ИЗМЕНЯЕТСЯ!
  // Страница остаётся в том же месте истории
}
```

**Ключевой момент:**

```c
// История ДО redirect:
// [Главная] → [Список] → [Детали(current)]
//                            ^
//                            np указывает сюда

page_redirect(np, "myapp:error");

// История ПОСЛЕ redirect:
// [Главная] → [Список] → [Ошибка(current)]
//                            ^
//                            тот же np, но с новым URL!

// TAILQ_INSERT_TAIL НЕ ВЫЗЫВАЕТСЯ!
// Новая запись в nav_history НЕ СОЗДАЁТСЯ!
```

**Что происходит при нажатии "Назад" после redirect:**

Из `navigator.c`, функция `nav_back` (строка 796):

```c
static void
nav_back(navigator_t *nav)
{
  nav_page_t *prev, *np = nav->nav_page_current;
  
  // Проверить есть ли предыдущая страница в истории
  if(np != NULL &&
     (prev = TAILQ_PREV(np, nav_page_queue, np_history_link)) != NULL) {
    
    // Есть предыдущая страница - вернуться на неё
    nav_select(nav, prev, NULL);
    
    if(doclose)
      nav_close(np, 1);
      
  } else {
    // НЕТ предыдущей страницы - отправить ACTION_SYSTEM_HOME
    event_t *e = event_create_action(ACTION_SYSTEM_HOME);
    prop_t *eventsink = prop_create_r(nav->nav_prop_root, "eventSink");
    prop_send_ext_event(eventsink, e);
    prop_ref_dec(eventsink);
    event_release(e);
  }
}
```

**Пример сценария:**

```c
// Исходная история:
// [Home] → [List] → [Details(current)]

page_redirect(np, "myapp:error");

// История после redirect (Details заменён на Error):
// [Home] → [List] → [Error(current)]

// Пользователь нажимает "Назад":
nav_back(nav);
// prev = TAILQ_PREV(np, ...) // prev = List
// nav_select(nav, prev, NULL); // Переход на List ✅

// История:
// [Home] → [List(current)] → [Error]

// Пользователь нажимает "Назад" ещё раз:
nav_back(nav);
// prev = TAILQ_PREV(np, ...) // prev = Home
// nav_select(nav, prev, NULL); // Переход на Home ✅

// История:
// [Home(current)] → [List] → [Error]

// Пользователь нажимает "Назад" ещё раз:
nav_back(nav);
// prev = TAILQ_PREV(np, ...) // prev = NULL (нет предыдущей)
// event_create_action(ACTION_SYSTEM_HOME); // Отправка события "Домой" ✅
```

**Важно:** Если страница создана через `redirect` и является ПЕРВОЙ в истории (например, после очистки истории), то нажатие "Назад" отправит `ACTION_SYSTEM_HOME` - возврат к главному экрану системы Movian.

---

### Как работает navigation.openUrl() - подробно

**Шаг 1: Вызов из JavaScript**

```javascript
// В плагине
navigation.openUrl("myapp:newpage");
```

**Шаг 2: Отправка события в navigator**

```javascript
// lib/navigation.js
var eventSink = prop.global.navigators.nodes[0].eventSink;
prop.sendEvent(eventSink, "openurl", { url: url });
// Отправляет EVENT_OPENURL в navigator.eventSink
```

**Шаг 3: Обработка в nav_eventsink (navigator.c:936)**

```c
if(event_is_type(e, EVENT_OPENURL)) {
  ou = (event_openurl_t *)e;
  if(ou->url != NULL)
    nav_open0(nav, ou->url, ...);
}
```

**Шаг 4: Функция nav_open0 создаёт НОВУЮ страницу**

```c
static void nav_open0(navigator_t *nav, const char *url, ...)
{
  // Создать НОВУЮ структуру страницы
  nav_page_t *np = calloc(1, sizeof(nav_page_t));
  np->np_url = strdup(url);
  
  nav_page_setup_prop(np, view);
  
  // ДОБАВИТЬ в историю
  nav_insert_page(nav, np, item_model);
  
  nav_open_backend(np);
}
```

**Шаг 5: Функция nav_insert_page добавляет в историю**

```c
static void nav_insert_page(navigator_t *nav, nav_page_t *np, ...)
{
  // Удалить "будущую" историю если есть
  while((np2 = TAILQ_NEXT(nav->nav_page_current, ...)) != NULL)
    nav_close(np2, 1);
  
  // ДОБАВИТЬ В КОНЕЦ ИСТОРИИ
  TAILQ_INSERT_TAIL(&nav->nav_history, np, np_history_link);
  
  nav_select(nav, np, item_model);
}
```

**Ключевой момент:**

```c
// История ДО openUrl:
// [Главная] → [Список] → [Детали(current)]

nav_open0(nav, "myapp:player");

// История ПОСЛЕ openUrl:
// [Главная] → [Список] → [Детали] → [Плеер(current)]
//                                      ^
//                                      новая np!

// TAILQ_INSERT_TAIL ВЫЗЫВАЕТСЯ!
// Новая запись в nav_history СОЗДАЁТСЯ!
```

---

### Визуальное сравнение структур данных

```
📍 redirect - Изменение существующей страницы:

До:  nav_history: [A] → [B] → [C(current)]
                               ^
                               np->np_url = "page:c"

redirect("page:error"):
     nav_history: [A] → [B] → [C(current)]
                               ^
                               np->np_url = "page:error" (изменён!)

Назад: [A] → [B] (история сократилась на 1 элемент)
Ещё Назад: [A] (текущая страница)
Ещё Назад: ACTION_SYSTEM_HOME (возврат к главному экрану Movian) 🏠


📍 Особый случай - redirect на первой странице:

До:  nav_history: [StartPage(current)]
                  ^
                  np->np_url = "myapp:start"

redirect("myapp:error"):
     nav_history: [ErrorPage(current)]
                  ^
                  np->np_url = "myapp:error" (изменён!)

Назад: prev = NULL → ACTION_SYSTEM_HOME (сразу возврат к Movian Home) 🏠


📍 openUrl - Создание новой страницы:

До:  nav_history: [A] → [B] → [C(current)]

openUrl("page:d"):
     nav_history: [A] → [B] → [C] → [D(current)]
                                     ^
                                     новая np!

Назад: [A] → [B] → [C] → [D]
                    ^
                    вернулись на C
Ещё Назад: [A] → [B] (текущая страница)
Ещё Назад: [A] (текущая страница)
Ещё Назад: ACTION_SYSTEM_HOME (возврат к главному экрану Movian) 🏠
```

---

### Архитектура событий

```
JavaScript                    C (Movian Core)
┌─────────────────┐          ┌──────────────────┐
│ navigation.js   │          │   navigator.c    │
│                 │          │                  │
│ openUrl(url) ──────sendEvent──→ nav_eventsink()
│                 │          │         │        │
└─────────────────┘          │         ▼        │
                             │   nav_open0()    │
                             │         │        │
                             │         ▼        │
                             │  nav_insert_page()│
                             │         │        │
                             │         ▼        │
                             │   [История]      │
                             └──────────────────┘
```

### Структура prop.global из исходников

Из `navigator.c`, строка 250:

```c
nav->nav_prop_root = prop_create(all_navigators, NULL);

nav->nav_prop_pages       = prop_create(nav->nav_prop_root, "pages");
nav->nav_prop_curpage     = prop_create(nav->nav_prop_root, "currentpage");
nav->nav_prop_can_go_back = prop_create(nav->nav_prop_root, "canGoBack");
nav->nav_prop_can_go_fwd  = prop_create(nav->nav_prop_root, "canGoForward");
nav->nav_prop_can_go_home = prop_create(nav->nav_prop_root, "canGoHome");
prop_t *eventsink         = prop_create(nav->nav_prop_root, "eventSink");
```

В JavaScript это доступно как:

```javascript
prop.global.navigators.nodes[0] = {
  pages: ...,
  currentpage: ...,
  canGoBack: ...,
  canGoForward: ...,
  canGoHome: ...,
  eventSink: ...  // ← Используется для openurl
}
```

### Обработка события openurl

Из `navigator.c`, функция `nav_eventsink` (строка 916):

```c
} else if(event_is_type(e, EVENT_OPENURL)) {
  ou = (event_openurl_t *)e;
  if(ou->url != NULL)
    nav_open0(nav, ou->url, ou->view,
              ou->item_model, ou->parent_model,
              ou->how, ou->parent_url);
```

Функция `nav_open0` создаёт **новую страницу**:

```c
nav_page_t *np = calloc(1, sizeof(nav_page_t));
np->np_url = strdup(url);
// ...
nav_insert_page(nav, np, item_model);
```

Функция `nav_insert_page` добавляет в историю (строка 477):

```c
TAILQ_INSERT_TAIL(&nav->nav_history, np, np_history_link);
```

### Обработка события redirect

Из `navigator.c`, функция `page_eventsink` (строка 615):

```c
} else if(event_is_type(e, EVENT_REDIRECT)) {
  const event_payload_t *ep = (const event_payload_t *)e;
  page_redirect(np, ep->payload);
}
```

Функция `page_redirect` **изменяет текущую страницу** (строка 881):

```c
static void
page_redirect(nav_page_t *np, const char *url)
{
  navigator_t *nav = np->np_nav;
  
  TRACE(TRACE_DEBUG, "navigator", "Following redirect to %s", url);
  
  // 1. Отписаться от всех событий текущей страницы
  page_unsub(np);
  
  // 2. Удалить все дочерние свойства
  prop_destroy_childs(np->np_prop_root);
  
  // 3. Изменить URL текущей страницы
  mystrset(&np->np_url, url);
  
  // 4. Пересоздать свойства страницы
  nav_page_setup_prop(np, NULL);
  
  // 5. Открыть новый контент в той же странице
  nav_open_backend(np);
}
```

**Ключевое отличие:**

- `openurl` → вызывает `nav_open0` → создаёт **новую nav_page_t** → добавляет в историю
- `redirect` → вызывает `page_redirect` → **изменяет существующую nav_page_t** → НЕ добавляет в историю

### Вызов из JavaScript

**page.redirect()** в `page.js` (строка 341):

```javascript
Page.prototype.redirect = function(url) {
  // 1. Удалить подписку на изменения узлов
  Core.resourceDestroy(this.nodesub);
  
  if(this.sync) {
    // Синхронный режим - прямой вызов backend
    require('native/route').backendOpen(this.root, url, true);
  } else {
    // Асинхронный режим - отправить событие EVENT_REDIRECT
    prop.sendEvent(this.root.eventSink, "redirect", url);
  }
}
```

**Поток выполнения:**

```
JavaScript                     C (Movian Core)
┌──────────────────┐          ┌──────────────────────┐
│ page.redirect()  │          │                      │
│       │          │          │                      │
│       ▼          │          │                      │
│ sendEvent() ─────────────→  │ page_eventsink()    │
│   "redirect"     │          │       │              │
└──────────────────┘          │       ▼              │
                              │ page_redirect()      │
                              │  ├─ page_unsub()     │
                              │  ├─ destroy_childs() │
                              │  ├─ mystrset(url)    │
                              │  └─ nav_open_backend()│
                              │                      │
                              │ [Та же nav_page_t]   │
                              └──────────────────────┘
```

---

## 📝 Чеклист для разработчика

### ✅ Перед релизом плагина

- [ ] Создан файл `lib/navigation.js`
- [ ] Все переходы используют `navigation.openUrl()`
- [ ] Редиректы используют `page.redirect()`
- [ ] Протестирована кнопка "Назад" на всех экранах
- [ ] Добавлены логи для отладки
- [ ] История навигации логична и удобна

### ✅ Тестирование навигации

1. **Тест прямой навигации:**
   - Главная → Раздел → Детали → Контент
   - Все страницы открываются? ✅

2. **Тест кнопки "Назад":**
   - Контент → "Назад" → Детали
   - Детали → "Назад" → Раздел
   - Раздел → "Назад" → Главная
   - Возврат на правильные страницы? ✅

3. **Тест редиректов:**
   - Ошибка → Редирект на главную
   - "Назад" не возвращает на ошибку? ✅

4. **Тест автопродолжения:**
   - Открыть серию → Popup "Продолжить?"
   - Да → Открывается эпизод
   - "Назад" → Возврат на серию? ✅

---

## 🎓 Заключение

### Ключевые выводы

1. **Для навигации используйте `navigation.openUrl()`** - создаёт запись в истории
2. **Для редиректов используйте `page.redirect()`** - когда история не нужна
3. **Правильный eventSink** - `prop.global.navigators.nodes[0].eventSink`
4. **Тестируйте кнопку "Назад"** - главный индикатор правильной навигации

### Быстрая справка

```javascript
// Навигация - добавляет в историю
navigation.openUrl(url);

// Редирект - заменяет страницу
page.redirect(url);
```

---

**Версия документа:** 1.0  
**Последнее обновление:** 2025-11-20  
**Источники:** navigator.c, event.c, es_prop.c из Movian  
**Лицензия:** MIT
