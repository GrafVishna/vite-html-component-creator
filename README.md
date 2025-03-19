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

```json
{
  "viteHtmlComponentCreator.defaultImports": {
    "component_style_path": "@c/{component}/{component}.scss",
    "html_imports": [
      ""
    ],
    "scss_imports": [
      "@import '@s/connect';"
    ]
  }
}
```