# Vite Component Creator

**Швидке створення компонентів для ваших Vite-проєктів!**

Цей плагін додає пункт "Створити компонент збірки" до контекстного меню папок у VSCode. Після введення назви компонента автоматично створюється папка з HTML та SCSS файлами, де HTML уже має підключений SCSS через `<link>`.

## Основні функції

- Додає пункт "Створити компонент збірки" до контекстного меню папок.
- Запитує назву компонента через діалогове вікно.
- Створює папку з назвою компонента, а всередині:
  - HTML-файл із підключеним SCSS.
  - SCSS-файл із базовим класом для стилізації.
- Перевіряє введену назву (дозволяє лише літери, цифри та дефіс).

## Як почати

1. У провіднику VSCode клацніть правою кнопкою миші на папці.
2. Виберіть "Створити компонент збірки".
3. Введіть назву компонента (наприклад, `MyComponent`).
4. Натисніть Enter — нова структура буде створена:

```bash
MyComponent/
├── MyComponent.html
├── MyComponent.scss
```

### Приклад створених файлів

- **MyComponent.html**:
```html
<link rel="stylesheet" href="/src/html/components/MyComponent/MyComponent.scss">

<div class="MyComponent">
  <!-- Ваш контент тут -->
</div>
```

- **MyComponent.scss**:
```scss
@import 'src/scss/mixins';

.MyComponent {
  /* Ваші стилі тут */
}
```

### settings.json  

Ви можете налаштувати поведінку плагіна через settings.json у VSCode. Дефолтна конфігурація виглядає так:

```json
{
  "viteHtmlComponentCreator.defaultImports": {
    "html_imports": ["<link rel='stylesheet' href='@c/{component}/{component}.scss'/>"],
    "scss_imports": ["@import '@s/connect';"]
  }
}
```

html_imports: Масив із рядками для HTML-файлу. За замовчуванням містить <link> із динамічним шляхом до стилів, де {component} замінюється на назву компонента.
scss_imports: Масив із імпортами для SCSS-файлу, наприклад, підключення зовнішніх стилів чи міксинів.
Щоб змінити налаштування:

Відкрийте settings.json (Ctrl + , → "Open Settings (JSON)").
Додайте або змініть секцію viteHtmlComponentCreator.defaultImports.

Приклад кастомізації:

```json
{
  "viteHtmlComponentCreator.defaultImports": {
    "html_imports": ["<link rel='stylesheet' href='@styles/{component}/{component}.scss'/>"],
    "scss_imports": ["@import '@s/variables';", "@import '@s/mixins';"]
  }
}
```