# SVOdki Dashboard

Frontend-приложение на Angular для мониторинга и управления ботами.

## Возможности

- Просмотр списка ботов
- Детальная информация о каждом боте
- Визуализация метрик и активности
- Управление источниками данных

## Требования

- Node.js 16+
- npm 8+
- Angular CLI 16+

## Установка

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/svodki-dashboard.git

# Перейти в директорию проекта
cd svodki-dashboard

# Установить зависимости
npm install
```

## Настройка окружения

Приложение использует два конфигурационных файла окружения:

- `src/environments/environment.ts` - для разработки
- `src/environments/environment.prod.ts` - для production

Основные настройки:

```typescript
export const environment = {
  production: false, // или true для production
  apiUrl: 'http://localhost:3000' // базовый URL API
};
```

## Запуск

### Разработка

```bash
npm start
# или
ng serve
```

Приложение будет доступно по адресу `http://localhost:4200/`.

### Production сборка

```bash
npm run build
# или
ng build --configuration production
```

Результат сборки будет помещен в директорию `dist/`.

## API Эндпоинты

Приложение взаимодействует со следующими API эндпоинтами:

- `GET /bots/` - получение списка всех ботов
- `GET /bots/:id/` - получение детальной информации о боте
- `POST /bots/` - создание нового бота
- `PUT /bots/:id/` - обновление информации о боте
- `DELETE /bots/:id/` - удаление бота

## Формат данных

### Бот (IBotLight)

```typescript
{
  id: number;
  name: string;
  topic: string;
  status: BotStatus; // 0 - неактивен, 1 - активен
}
```

### Детальная информация о боте (IBotDetail)

```typescript
{
  id: number;
  name: string;
  topic: string;
  status: BotStatus;
  description: string;
  users_count: number;
  sources: IBotSource[];
  metrics: Array<{date: string, value: number}>;
}
```

### Источник данных (IBotSource)

```typescript
{
  id: number;
  name: string;
  description: string;
  type: BotSourceType; // 0 - Telegram, 1 - веб-сайт
  url: string;
}
```

## Разработка

### Структура проекта

- `src/app/components` - компоненты приложения
- `src/app/services` - сервисы для работы с API
- `src/app/interfaces` - интерфейсы TypeScript
- `src/app/pages` - компоненты-страницы

### Основные компоненты

- `BotsComponent` - страница со списком ботов
- `BotDetailComponent` - страница с детальной информацией о боте
- `BotSidebarComponent` - боковая панель с навигацией по ботам
- `BotMetricsComponent` - компонент для отображения метрик бота
- `ActivityChartComponent` - компонент для отображения графика активности

## Лицензия

MIT
