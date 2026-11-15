# NSPanel Weather Card — дизайн

Дата: 2026-11-15
Статус: утверждён

## Задача

Lovelace-карточка для Home Assistant под экран панели Sonoff NSPanel 480×480, распространяемая через HACS. Карточка показывает погодную сводку и время, максимально настраивается через визуальный редактор HA.

Содержимое: время, дата, день недели; улица (температура, давление в мм рт. ст., влажность, картинка погоды); прогноз (дни: иконка + мин/макс); помещение (температура, влажность); нижняя панель кнопок для переключения на другие панели (до реализации — заглушки).

Настройка: шрифты и размеры, включение/отключение и позиционирование блоков, замена картинок (фон карточки и иконки погоды).

## Принятые решения

| Вопрос | Решение |
|---|---|
| Позиционирование блоков | Свободные координаты X/Y в пикселях |
| Прогноз | Дни (иконка + мин/макс), количество настраивается |
| Картинки | Фон карточки + иконки погоды, обе заменяемы; в комплекте SVG-набор |
| Кнопки | Список настраиваемых кнопок (добавить/удалить/переставить) |
| Шрифты | Семейство глобально; размер/жирность/цвет по блокам |
| Язык | По языку HA, RU + EN |
| Источник данных | Weather-сущность + оверрайд отдельными сенсорами |
| Название репозитория | `nspanel-weather-card` |
| Стек | Lit + TypeScript + Vite, бандл в `dist/` |

## Архитектура

Карточка регистрируется как `custom:nspanel-weather-card`. Внутри — Lit-компонент холста и отдельные компоненты блоков; состояние передаётся только через `config` и `hass`, глобального состояния нет.

```
nspanel-weather-card/
├─ src/
│  ├─ main.ts            # регистрация элемента, window.customCards
│  ├─ card.ts            # холст W×H, фон, раскладка блоков
│  ├─ editor.ts          # визуальный редактор (раскрывающиеся секции)
│  ├─ blocks/
│  │  ├─ clock.ts        # время / дата / день недели
│  │  ├─ outdoor.ts      # улица: t°, влажность, давление, иконка
│  │  ├─ forecast.ts     # прогноз: иконка + мин/макс по дням
│  │  ├─ indoor.ts       # помещение: t° / влажность
│  │  └─ buttons.ts      # нижние кнопки
│  ├─ types.ts           # TypeScript-схема конфига
│  ├─ defaults.ts        # дефолты, merge конфига, карта иконок
│  ├─ localize.ts        # словари RU/EN, выбор по hass.locale
│  ├─ utils.ts           # hPa→мм рт. ст., формат дат, извлечение прогноза
│  └─ assets/weather/*.svg   # 14 состояний погоды
├─ tests/                # vitest
├─ dev/                  # демо-страница с фейковым hass
├─ hacs.json, info.md, README.md, LICENSE (MIT)
├─ package.json, vite.config.ts, tsconfig.json
└─ .github/workflows/release.yml
```

Принципы:
- Холст фиксированный (`width × height`, по умолчанию 480×480), `position: relative`, `overflow: hidden`. Блоки — `position: absolute`, `left/top` из конфига. Не адаптивный.
- Каждый блок получает свой фрагмент конфига и `hass`; рендерится без данных (плейсхолдер «—»).
- Иконки погоды встроены в бандл (импорт SVG через Vite), каждая переопределяема URL в конфиге.
- Разработка: `npm run dev` (демо с фейковым `hass`), `npm test`, `npm run build`.

## Схема конфига

Пустой конфиг даёт рабочую вёрстку за счёт дефолтов.

```yaml
type: custom:nspanel-weather-card
width: 480
height: 480
locale: auto               # auto | ru | en
background:
  image: ""
  color: "#101418"
  opacity: 1
font:
  family: "Roboto, sans-serif"
  custom_font_url: ""
  color: "#ffffff"
blocks:
  clock:
    enabled: true
    x: 24
    y: 16
    show_time: true
    show_date: true
    show_weekday: true
    time_size: 72
    date_size: 18
    time_weight: 300
    align: left            # left | center | right
    color: ""
  outdoor:
    enabled: true
    x: 24
    y: 128
    weather_entity: weather.home
    temp_entity: ""
    humidity_entity: ""
    pressure_entity: ""
    show_temp: true
    show_humidity: true
    show_pressure: true
    show_icon: true
    temp_size: 44
    value_size: 16
    icon_size: 88
    icon_override: {}      # состояние -> URL
    color: ""
  forecast:
    enabled: true
    x: 24
    y: 260
    days: 4                # 1–7
    icon_size: 36
    day_size: 14
    temp_size: 16
    show_min: true
    weather_entity: ""     # пусто = outdoor.weather_entity
    color: ""
  indoor:
    enabled: true
    x: 300
    y: 128
    temp_entity: ""
    humidity_entity: ""
    temp_size: 32
    value_size: 16
    show_humidity: true
    color: ""
  buttons:
    enabled: true
    x: 0
    y: 408
    width: 480
    height: 72
    active_path: ""
    items:
      - icon: mdi:weather-partly-cloudy
        label: Погода
        path: ""
        enabled: true
        image: ""
      - icon: mdi:thermostat
        label: Климат
        path: ""
        enabled: true
        image: ""
```

Правила:
- **Давление** — всегда в мм рт. ст., одна цифра после запятой. Из weather (hPa) умножается на 0.750062; из сенсора по `unit_of_measurement` (hPa/MB/Pa → конвертация, mmHg — как есть).
- **Цвет** — `font.color` глобально, `blocks.X.color` переопределяет; пустая строка = наследовать.
- **Подписи** («Влажность», «Давление», дни недели) — из `localize.ts`, в конфиг не выносятся.
- **Неизвестные ключи** игнорируются: глубокий merge с дефолтами.
- `forecast.weather_entity` пустой → берётся `outdoor.weather_entity`.

## Визуальный редактор

Отдельный Lit-элемент из `getConfigElement()`, показывается HA в правой панели. Секции на `ha-expansion-panel`, формы на `ha-form` (нативные виджеты HA: entity, icon, color, integer).

Секции: «Общие» (width/height/locale), «Фон и шрифт», по секции на каждый блок (enabled, X/Y, специфичные поля), «Кнопки» (expandable-массив: добавить/удалить/переставить).

Типы полей:
- сущности — `entity`-селектор с фильтром по домену;
- цвета — `color_rgb` (пикер), в конфиг пишется hex-строка (`#rrggbb`); пусто = наследовать;
- иконки — `icon`-селектор (mdi);
- override иконок погоды — expandable-список пар «состояние → URL»;
- X/Y и размеры — `integer`.

Поведение:
- Изменение поля сразу пишет в конфиг карточки — живой предпросмотр.
- Редактор не держит собственного состояния, рендерится от текущего конфига (merge с дефолтами).
- Подписи полей локализованы RU/EN.

## Данные

- **Улица** — атрибуты weather-сущности (`temperature`, `humidity`, `pressure`, `state`); оверрайд-сенсор заменяет соответствующее значение.
- **Помещение** — state сенсоров + `unit_of_measurement`.
- **Часы** — `setInterval(1 c)`; дата/день недели пересчитываются при смене даты.
- **Прогноз** — подписка `weather/subscribe_forecast` (тип `daily`); переподписка при смене сущности или `days`, отписка в `disconnectedCallback`; при неудаче подписки — one-shot `hass.callWS`; при неудаче обоих — «—». Запрос не повторяется на каждый тик, только раз в 30 мин.
- **Кнопки** — при заданном `path`: `history.pushState` + `location-changed`; пустой `path` = неактивная кнопка.

## Локализация

`localize.ts` с словарями RU/EN: дни недели, подписи «Влажность»/«Давление», «Сегодня»/«Завтра», подписи редактора. Язык: `locale` конфига, иначе `hass.locale.language` (`ru*` → RU, иначе EN). Даты — `Intl.DateTimeFormat`.

## Обработка ошибок

- Нет/не найдена weather-сущность → «—» во всех значениях, иконка-плейсхолдер.
- Сенсор `unavailable`/`unknown` → «—» только в своём значении.
- Ошибка загрузки картинки → фолбэк на встроенный SVG (иконки) или цвет фона.
- Ошибка websocket прогноза → блок прогноза «—», остальное работает; `console.warn` без UI-ошибки.

## Тестирование

Vitest на `utils.ts` (конвертация давления, извлечение прогноза, форматирование дат/дней) и `defaults.ts` (merge конфига, дефолты, неизвестные ключи). DOM-рендер Lit юнит-тестами не покрываем — проверка на dev-странице и в реальном HA.

## Метаданные пакета и HACS

- `hacs.json`: `name`, `filename: nspanel-weather-card.js`, `render_readme: true`.
- `dist/nspanel-weather-card.js` — единственный артефакт, коммитится в релиз через GitHub Actions по тегу.
- Регистрация в `window.customCards` (name, description, preview).
- README + info.md с установкой через HACS, примером конфига, описанием полей.

## Риски

- Формат прогноза различается между версиями HA: читаем и старый атрибут `forecast`, и WS-подписку; минимальная версия HA указывается в README.
