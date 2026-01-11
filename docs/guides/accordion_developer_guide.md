# Руководство разработчика по внедрению режима "Гармошка"

## 1. Быстрый старт

**Что такое "Гармошка":** "Гармошка" (accordion) - это UI паттерн, который позволяет скрывать/показывать контент по клику на заголовок. В Movian это реализуется через динамическое добавление/удаление элементов с использованием `moveBefore()` для правильного позиционирования.

**Минимальный пример:**
```javascript
function appendExpandableSection(page, title, data, itemFormatter) {
    var expanded = false;
    var children = [];
    
    var header = page.appendAction(title + ' (развернуть)', function () {
        expanded = !expanded;
        
        if (expanded) {
            // Добавить элементы
            data.forEach(function (d) {
                var info = itemFormatter(d);
                var it = page.appendItem(info.url, info.type || 'video', {
                    title: info.title,
                    icon: info.icon
                });
                children.push(it);
            });
            
            header.root.metadata.title = title + ' (свернуть)';
            header.root.subtype = 'play_arrow';
        } else {
            // Удалить элементы
            children.forEach(function (it) { 
                try { it.destroy(); } catch (e) { } 
            });
            children = [];
            header.root.metadata.title = title + ' (развернуть)';
            header.root.subtype = 'list';
        }
    }, 'list');
}
```

---

## 2. Два типа гармошек

### 2.1 Простая гармошка (appendExpandableSection)
**Использование:** Независимые секции (актеры, режиссеры, поиск)
**Источник:** `browse.js:292-321`

**Преимущества:**
- Простая реализация
- Независимое переключение
- Минимальное состояние

### 2.2 Сложная гармошка (toggleSeason)
**Использование:** Сезоны сериалов (только один раскрыт)
**Источник:** `seasonRenderer.js:41-96`

**Преимущества:**
- Эксклюзивное раскрытие
- Глобальное управление
- Оптимизированная память

---

## 3. Простая гармошка - Полная реализация

### 3.1 Базовая структура
```javascript
function appendExpandableSection(page, title, data, itemFormatter) {
    var expanded = false;
    var children = [];
    var header;
    
    // Создаем заголовок
    header = ui.appendAction(page, title + ' (развернуть)', function () {
        toggleSection();
    }, 'list');
    
    function toggleSection() {
        expanded = !expanded;
        
        if (expanded) {
            expandSection();
        } else {
            collapseSection();
        }
    }
    
    function expandSection() {
        // Находим позицию для вставки
        var allItems = page.getItems();
        var pos = allItems.indexOf(header);
        var nextItem = (pos !== -1 && pos + 1 < allItems.length) ? allItems[pos + 1] : null;
        
        // Добавляем элементы
        data.forEach(function (d) {
            var info = itemFormatter(d);
            var it = page.appendItem(info.url, info.type || 'video', {
                title: info.title,
                icon: info.icon,
                description: info.description
            });
            
            // Вставляем после заголовка
            if (nextItem) {
                it.moveBefore(nextItem);
            }
            children.push(it);
        });
        
        // Обновляем заголовок
        header.root.metadata.title = title + ' (свернуть)';
        header.root.subtype = 'play_arrow';
    }
    
    function collapseSection() {
        // Безопасно удаляем элементы
        children.forEach(function (it) { 
            try { it.destroy(); } catch (e) { } 
        });
        children = [];
        
        // Обновляем заголовок
        header.root.metadata.title = title + ' (развернуть)';
        header.root.subtype = 'list';
    }
}
```

### 3.2 Пример использования
```javascript
// Добавление секции актеров
appendExpandableSection(page, 'Актеры', actors, function (actor) {
    return {
        title: actor.name,
        icon: actor.photo,
        url: 'actor:' + actor.id,
        type: 'directory'
    };
});

// Добавление секции поиска
appendExpandableSection(page, 'Поиск', searchOptions, function (option) {
    return {
        title: option.title,
        icon: 'search-icon',
        url: option.url,
        type: 'directory'
    };
});
```

---

## 4. Сложная гармошка - Полная реализация

### 4.1 Структура состояния
```javascript
function initAccordionState(page, data) {
    page._accordionState = {
        headerItems: [],      // Заголовки секций
        contentItems: [],     // Контент секций
        expandedIndex: -1,    // Текущий раскрытый индекс
        currentData: data     // Данные для рендеринга
    };
}
```

### 4.2 Инициализация гармошки
```javascript
function renderAccordion(page, data) {
    var state = page._accordionState;
    state.headerItems = [];
    state.contentItems = [];
    state.expandedIndex = -1;
    state.currentData = data;
    
    // Создаем заголовки
    data.sections.forEach(function (section, idx) {
        var item = ui.appendAction(page, section.title + ' (развернуть)', function () {
            toggleSection(page, idx);
        }, 'list');
        
        state.headerItems.push(item);
    });
    
    // Авто-раскрытие первой секции
    if (state.headerItems.length > 0) {
        toggleSection(page, 0);
    }
}
```

### 4.3 Переключение секций
```javascript
function toggleSection(page, index) {
    var state = page._accordionState;
    if (!state) return;
    
    // Если клик на раскрытую секцию - свернуть
    if (state.expandedIndex === index) {
        collapseSection(page);
        state.expandedIndex = -1;
        updateHeaders(page);
        return;
    }
    
    // Свернуть текущую и раскрыть новую
    collapseSection(page);
    expandSection(page, index);
    state.expandedIndex = index;
    updateHeaders(page);
}

function expandSection(page, index) {
    var state = page._accordionState;
    var section = state.currentData.sections[index];
    
    // Находим точку вставки
    var targetHeader = state.headerItems[index];
    var allItems = page.getItems();
    var pos = allItems.indexOf(targetHeader);
    var nextItem = (pos !== -1 && pos + 1 < allItems.length) ? allItems[pos + 1] : null;
    
    // Добавляем контент секции
    section.items.forEach(function (itemData) {
        var item = page.appendItem(itemData.url, itemData.type || 'video', {
            title: itemData.title,
            icon: itemData.icon,
            description: itemData.description
        });
        
        if (nextItem) {
            item.moveBefore(nextItem);
        }
        state.contentItems.push(item);
    });
}

function collapseSection(page) {
    var state = page._accordionState;
    
    // Безопасно удаляем все элементы контента
    state.contentItems.forEach(function (it) { 
        try { it.destroy(); } catch (e) { } 
    });
    state.contentItems = [];
}

function updateHeaders(page) {
    var state = page._accordionState;
    
    state.headerItems.forEach(function (header, i) {
        var section = state.currentData.sections[i];
        
        if (i === state.expandedIndex) {
            // Раскрытая секция
            header.root.metadata.title = section.title + ' (свернуть)';
            header.root.subtype = 'play_arrow';
        } else {
            // Свернутая секция
            header.root.metadata.title = section.title + ' (развернуть)';
            header.root.subtype = 'list';
        }
    });
}
```

---

## 5. Вспомогательные функции

### 5.1 Безопасное создание действий
```javascript
// utils/ui-helpers.js:39-45
exports.appendAction = function (page, title, func, subtype) {
    var item = page.appendAction(title, func, subtype);
    if (page.items && page.items.indexOf(item) === -1) {
        page.items.push(item);
    }
    return item;
};
```

### 5.2 Безопасное удаление элементов
```javascript
function safeDestroy(items) {
    items.forEach(function (it) { 
        try { it.destroy(); } catch (e) { 
            // Игнорировать ошибки при удалении
        } 
    });
}
```

### 5.3 Поиск позиции вставки
```javascript
function findInsertPosition(page, targetItem) {
    var allItems = page.getItems();
    var pos = allItems.indexOf(targetItem);
    return (pos !== -1 && pos + 1 < allItems.length) ? allItems[pos + 1] : null;
}
```

---

## 6. DO/DON'T

### ✅ DO - Правила

**1. Используйте moveBefore для позиционирования**
```javascript
// ✅ ПРАВИЛЬНО
var nextItem = findInsertPosition(page, header);
if (nextItem) {
    newItem.moveBefore(nextItem);
}
```

**2. Безопасно удаляйте элементы**
```javascript
// ✅ ПРАВИЛЬНО
children.forEach(function (it) { 
    try { it.destroy(); } catch (e) { } 
});
```

**3. Обновляйте визуальное состояние**
```javascript
// ✅ ПРАВИЛЬНО
header.root.metadata.title = title + ' (свернуть)';
header.root.subtype = 'play_arrow';
```

### ❌ DON'T - Антипаттерны

**1. НЕ используйте page.appendItem без позиционирования**
```javascript
// ❌ НЕПРАВИЛЬНО
data.forEach(function (d) {
    page.appendItem(d.url, d.type, d.meta);  // Добавится в конец
});
```

**2. НЕ забывайте обрабатывать ошибки**
```javascript
// ❌ НЕПРАВИЛЬНО
children.forEach(function (it) { 
    it.destroy();  // Может вызвать ошибку
});
```

**3. НЕ храните ссылки на уничтоженные элементы**
```javascript
// ❌ НЕПРАВИЛЬНО
children = [];  // Хранит мертвые ссылки
// Нужно сначала уничтожить, потом очистить массив
```

---

## 7. Оптимизации

### 7.1 Управление памятью
```javascript
// Очистка перед новым рендерингом
function cleanupAccordion(page) {
    var state = page._accordionState;
    if (state) {
        safeDestroy(state.contentItems);
        safeDestroy(state.headerItems);
        state.headerItems = [];
        state.contentItems = [];
        state.expandedIndex = -1;
    }
}
```

### 7.2 Ленивая загрузка контента
```javascript
function expandSection(page, index) {
    var state = page._accordionState;
    var section = state.currentData.sections[index];
    
    // Загружаем данные только при раскрытии
    if (!section.loadedData) {
        section.loadedData = loadSectionData(section.id);
    }
    
    // Рендерим загруженные данные
    renderSectionContent(page, section.loadedData);
}
```

### 7.3 Кэширование состояния
```javascript
function saveAccordionState(page) {
    var state = page._accordionState;
    if (state) {
        page._savedState = {
            expandedIndex: state.expandedIndex,
            timestamp: Date.now()
        };
    }
}

function restoreAccordionState(page) {
    var saved = page._savedState;
    if (saved && (Date.now() - saved.timestamp < 300000)) { // 5 минут
        toggleSection(page, saved.expandedIndex);
    }
}
```

---

## 8. Полные примеры

### 8.1 Простая гармошка для меню
```javascript
function createAccordionMenu(page, menuItems) {
    menuItems.forEach(function (section) {
        appendExpandableSection(page, section.title, section.items, function (item) {
            return {
                title: item.title,
                icon: item.icon,
                url: item.url,
                type: item.type || 'video',
                description: item.description
            };
        });
    });
}

// Использование
createAccordionMenu(page, [
    {
        title: 'Фильмы',
        items: [
            { title: 'Новинки', url: 'movies:new', icon: 'new' },
            { title: 'Популярные', url: 'movies:popular', icon: 'popular' }
        ]
    },
    {
        title: 'Сериалы',
        items: [
            { title: 'Новинки', url: 'series:new', icon: 'new' },
            { title: 'Популярные', url: 'series:popular', icon: 'popular' }
        ]
    }
]);
```

### 8.2 Сложная гармошка для сезонов
```javascript
function createSeasonAccordion(page, seriesData) {
    initAccordionState(page, {
        sections: seriesData.seasons.map(function (season) {
            return {
                title: 'Сезон ' + season.number,
                id: season.id,
                items: season.episodes.map(function (episode) {
                    return {
                        title: 'Эпизод ' + episode.number + ': ' + episode.title,
                        url: 'play:' + series.id + ':' + season.number + ':' + episode.number,
                        icon: episode.still,
                        type: 'video',
                        description: episode.overview
                    };
                })
            };
        })
    });
    
    renderAccordion(page, page._accordionState.currentData);
}

// Использование
createSeasonAccordion(page, {
    seasons: [
        {
            id: 'season1',
            number: 1,
            episodes: [
                { number: 1, title: 'Пилот', still: 'ep1.jpg', overview: '...' },
                { number: 2, title: 'Второй эпизод', still: 'ep2.jpg', overview: '...' }
            ]
        }
    ]
});
```

---

## 9. Отладка и troubleshooting

### 9.1 Распространенные проблемы

**Проблема:** Элементы добавляются не в том месте
**Решение:** Проверьте логику `moveBefore()` и позицию `nextItem`

**Проблема:** Ошибки при удалении элементов
**Решение:** Используйте try-catch вокруг `destroy()`

**Проблема:** Память не освобождается
**Решение:** Очищайте массивы после уничтожения элементов

### 9.2 Отладочные функции
```javascript
function debugAccordionState(page) {
    var state = page._accordionState;
    if (state) {
        console.log('Headers:', state.headerItems.length);
        console.log('Content items:', state.contentItems.length);
        console.log('Expanded index:', state.expandedIndex);
    }
}

function validateAccordion(page) {
    var state = page._accordionState;
    if (!state) return false;
    
    // Проверяем целостность ссылок
    var validHeaders = state.headerItems.filter(function (h) {
        return h && h.root;
    });
    
    var validContent = state.contentItems.filter(function (c) {
        return c && c.root;
    });
    
    return validHeaders.length === state.headerItems.length &&
           validContent.length === state.contentItems.length;
}
```

---

## Ключевые моменты

- **Позиционирование:** Всегда используйте `moveBefore()` для правильной вставки
- **Безопасность:** Оборачивайте `destroy()` в try-catch
- **Состояние:** Для сложных гармошек используйте глобальное состояние страницы
- **Визуальная обратная связь:** Обновляйте заголовки и иконки при переключении
- **Память:** Очищайте ссылки на уничтоженные элементы

**Готово к использованию в любых Movian плагинах.**
