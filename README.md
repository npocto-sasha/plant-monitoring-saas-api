# Plant Monitoring SaaS API

Backend-часть магистерского проекта **Plant Monitoring SaaS** — SaaS-системы для слежения за растениями и анализа данных через мобильное приложение.

Проект реализует REST API для работы с пользователями, растениями, ESP32-устройствами, телеметрией и рекомендациями.

## Описание

Backend предназначен для приема, хранения и обработки данных, связанных с мониторингом состояния растений.

Целевая логика системы:

```text
ESP32 + датчики
↓
Backend API
↓
PostgreSQL
↓
Мобильное приложение
↓
Пользователь
```

ESP32-устройство отправляет данные о состоянии растения на backend. Backend сохраняет телеметрию в базе данных, связывает данные с конкретным растением и устройством, а также формирует рекомендации на основе простых правил анализа.

## Текущий статус

Проект находится на стадии backend-прототипа.

На текущем этапе реализованы:

- подключение NestJS;
- подключение Prisma ORM;
- подключение PostgreSQL;
- базовая Prisma-схема;
- модуль растений;
- модуль устройств;
- привязка устройств к растениям;
- модуль телеметрии;
- модуль рекомендаций;
- базовая бизнес-логика анализа показателей.

Авторизация пока не реализована в новой архитектуре. Для тестирования временно используется демо-пользователь с `userId = 1`.

## Технологический стек

- Node.js;
- NestJS;
- TypeScript;
- Prisma ORM;
- PostgreSQL;
- Prisma PostgreSQL Adapter;
- REST API.

## Основные сущности

### User

Пользователь системы.

Основные поля:

- `id`;
- `email`;
- `passwordHash`;
- `name`;
- `createdAt`;
- `updatedAt`.

### Plant

Растение пользователя.

Основные поля:

- `id`;
- `name`;
- `type`;
- `location`;
- `userId`;
- `createdAt`;
- `updatedAt`.

### Device

ESP32-устройство, которое может быть привязано к растению.

Основные поля:

- `id`;
- `name`;
- `deviceCode`;
- `activationKey`;
- `status`;
- `userId`;
- `plantId`;
- `createdAt`;
- `updatedAt`.

### TelemetryMeasurement

Измерение, полученное от устройства.

Основные поля:

- `id`;
- `deviceId`;
- `plantId`;
- `soilMoisture`;
- `temperature`;
- `light`;
- `measuredAt`;
- `createdAt`.

### Recommendation

Рекомендация, связанная с растением.

Основные поля:

- `id`;
- `plantId`;
- `title`;
- `message`;
- `severity`;
- `type`;
- `createdAt`.

В текущей версии рекомендации формируются на лету на основе последних показателей телеметрии.

## Структура проекта

```text
src/
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts

  prisma/
    prisma.module.ts
    prisma.service.ts

  plants/
    dto/
      create-plant.dto.ts
      update-plant.dto.ts
    plants.controller.ts
    plants.module.ts
    plants.service.ts

  devices/
    dto/
      bind-device.dto.ts
      create-device.dto.ts
    devices.controller.ts
    devices.module.ts
    devices.service.ts

  telemetry/
    dto/
      create-telemetry.dto.ts
    telemetry.controller.ts
    telemetry.module.ts
    telemetry.service.ts

  recommendations/
    recommendations.controller.ts
    recommendations.module.ts
    recommendations.service.ts

prisma/
  schema.prisma
  migrations/

prisma.config.ts
```

## Переменные окружения

Создайте файл `.env` в корне проекта.

Пример:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/plant_monitoring_saas?schema=public"
```

Где:

- `postgres` — имя пользователя PostgreSQL;
- `password` — пароль пользователя PostgreSQL;
- `localhost` — адрес локального сервера PostgreSQL;
- `5432` — порт PostgreSQL;
- `plant_monitoring_saas` — имя базы данных.

Файл `.env` не должен попадать в Git.

## Установка

Установите зависимости:

```bash
npm install
```

## Настройка базы данных

Создайте базу данных PostgreSQL:

```text
plant_monitoring_saas
```

Затем выполните миграции Prisma:

```bash
npx prisma migrate dev
```

Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

## Запуск проекта

Режим разработки:

```bash
npm run start:dev
```

После запуска backend будет доступен по адресу:

```text
http://localhost:3000
```

## Prisma Studio

Для просмотра и редактирования данных в базе можно использовать Prisma Studio:

```bash
npx prisma studio
```

## API endpoints

### Plants

#### Получить список растений

```http
GET /plants
```

#### Получить одно растение

```http
GET /plants/:id
```

#### Создать растение

```http
POST /plants
```

Пример тела запроса:

```json
{
  "name": "Фикус",
  "type": "Комнатное растение",
  "location": "Подоконник"
}
```

#### Обновить растение

```http
PATCH /plants/:id
```

Пример тела запроса:

```json
{
  "location": "Гостиная"
}
```

#### Удалить растение

```http
DELETE /plants/:id
```

### Devices

#### Получить список устройств

```http
GET /devices
```

#### Получить одно устройство

```http
GET /devices/:id
```

#### Создать устройство

```http
POST /devices
```

Пример тела запроса:

```json
{
  "name": "ESP32 у фикуса",
  "deviceCode": "esp32-001",
  "activationKey": "demo-key"
}
```

#### Привязать устройство к растению

```http
PATCH /devices/:id/bind-plant
```

Пример тела запроса:

```json
{
  "plantId": 1
}
```

#### Удалить устройство

```http
DELETE /devices/:id
```

### Telemetry

#### Отправить телеметрию

```http
POST /telemetry
```

Пример тела запроса:

```json
{
  "deviceCode": "esp32-001",
  "soilMoisture": 42,
  "temperature": 23.5,
  "light": 680
}
```

#### Получить последний замер растения

```http
GET /telemetry/plants/:plantId/latest
```

#### Получить историю измерений растения

```http
GET /telemetry/plants/:plantId/history
```

### Recommendations

#### Получить все рекомендации

```http
GET /recommendations
```

#### Получить рекомендации по одному растению

```http
GET /recommendations/plants/:plantId
```

## Логика рекомендаций

В текущей версии рекомендации формируются на основе последнего измерения растения.

Используются простые правила:

```text
Если устройство не подключено → рекомендация подключить ESP32
Если устройство подключено, но телеметрии нет → рекомендация проверить отправку данных
Если влажность почвы < 30% → рекомендация проверить полив
Если влажность почвы < 20% → высокий риск
Если температура < 18°C → рекомендация повысить температуру
Если температура < 16°C → высокий риск
Если освещенность < 300 lx → рекомендация улучшить освещение
Если освещенность < 200 lx → высокий риск
Если отклонений нет → показатели в норме
```

## Пример сценария тестирования

### 1. Создать растение

```http
POST /plants
```

```json
{
  "name": "Фикус",
  "type": "Комнатное растение",
  "location": "Подоконник"
}
```

### 2. Создать устройство

```http
POST /devices
```

```json
{
  "name": "ESP32 у фикуса",
  "deviceCode": "esp32-001",
  "activationKey": "demo-key"
}
```

### 3. Привязать устройство к растению

```http
PATCH /devices/1/bind-plant
```

```json
{
  "plantId": 1
}
```

### 4. Отправить телеметрию

```http
POST /telemetry
```

```json
{
  "deviceCode": "esp32-001",
  "soilMoisture": 42,
  "temperature": 23.5,
  "light": 680
}
```

### 5. Получить историю измерений

```http
GET /telemetry/plants/1/history
```

### 6. Получить рекомендации

```http
GET /recommendations/plants/1
```

## Работа с ESP32

В будущей версии ESP32 будет отправлять данные на endpoint:

```http
POST /telemetry
```

Пример JSON:

```json
{
  "deviceCode": "esp32-001",
  "soilMoisture": 42,
  "temperature": 23.5,
  "light": 680
}
```

На первом этапе используется HTTP. В дальнейшем возможно добавление MQTT.

## Текущие ограничения

- авторизация пока не реализована в новой backend-архитектуре;
- временно используется `userId = 1`;
- рекомендации формируются на лету, без сохранения в таблицу;
- нет проверки прав доступа пользователя к объектам через JWT;
- нет Swagger-документации;
- нет валидации DTO через `class-validator`;
- нет production-конфигурации.

## Планы развития

Ближайшие задачи:

- добавить авторизацию и регистрацию;
- реализовать JWT guard;
- заменить временный `userId = 1` на текущего пользователя из токена;
- подключить мобильное приложение к backend API;
- добавить DTO-валидацию;
- добавить Swagger;
- реализовать прием данных от ESP32;
- добавить MQTT как альтернативный транспорт;
- расширить аналитику рекомендаций;
- добавить агрегацию истории измерений;
- подготовить backend к демонстрации в рамках магистерской диссертации.

## Назначение проекта

Backend используется как серверная часть магистерского проекта по разработке SaaS-системы для слежения за растениями и анализа данных с использованием мобильного приложения.

Проект демонстрирует серверную архитектуру для системы, объединяющей:

- пользователей;
- растения;
- IoT-устройства;
- телеметрические данные;
- историю измерений;
- рекомендации по уходу.
