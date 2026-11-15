# NSPanel Weather Card

Custom Lovelace card sized for the Sonoff NSPanel (480×480) with weather, clock,
forecast, indoor sensors and bottom navigation buttons. Everything is
configurable from the Home Assistant visual editor.

## Features

- Clock: time, date, weekday, configurable size, weight and alignment
- Outdoor: temperature, humidity, pressure in mmHg, replaceable weather icon
- Forecast: daily forecast row (icons + max/min) via `weather/subscribe_forecast`
- Indoor: temperature and humidity from sensors
- Bottom buttons: configurable list, navigation or placeholders
- Background image, custom font (`@font-face` URL), per-block colors
- Blocks can be disabled and positioned freely with X/Y
- RU / EN localization (follows Home Assistant language by default)

## Installation

### HACS

1. Open HACS → Frontend → menu → **Custom repositories**.
2. Add the URL of this repository with category **Lovelace**.
3. Install **NSPanel Weather Card** and reload Home Assistant.
4. HACS adds the resource automatically. If not, add it manually:
   Settings → Dashboards → Resources → `/hacsfiles/nspanel-weather-card/nspanel-weather-card.js` (JavaScript module).

Requires Home Assistant 2023.9 or newer.

### Manual

Copy `dist/nspanel-weather-card.js` from the latest release to
`config/www/nspanel-weather-card.js` and add it as a JavaScript module resource:
`/local/nspanel-weather-card.js`.

## Configuration

Add a card via the UI and use the visual editor, or configure YAML directly:

```yaml
type: custom:nspanel-weather-card
width: 480
height: 480
locale: auto
background:
  image: /local/nspanel/bg.png
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
    align: left
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
    icon_override:
      sunny: /local/nspanel/sunny.png
    color: ""
  forecast:
    enabled: true
    x: 24
    y: 260
    days: 4
    icon_size: 36
    day_size: 14
    temp_size: 16
    show_min: true
    weather_entity: ""
    color: ""
  indoor:
    enabled: true
    x: 300
    y: 128
    temp_entity: sensor.living_room_temperature
    humidity_entity: sensor.living_room_humidity
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
        image: ""
        label: Погода
        path: ""
        enabled: true
      - icon: mdi:thermostat
        image: ""
        label: Климат
        path: ""
        enabled: true
    color: ""
```

### Notes

- `background.color` and per-block `color` are hex strings; an empty block color
  inherits `font.color`.
- Pressure is always converted to mmHg (from hPa, mb, Pa or inHg).
- `forecast.weather_entity` empty means "use `outdoor.weather_entity`".
- Forecast icons use `outdoor.icon_override`, so custom weather images apply to
  both blocks.
- Buttons with an empty `path` are shown dimmed and do nothing (placeholders).
  Set `path` (e.g. `/weather-panel/0`) to navigate, and `active_path` to
  highlight the current panel.

## Development

```bash
npm install
npm run dev     # demo page with fake hass at http://localhost:5173
npm test
npm run build   # produces dist/nspanel-weather-card.js
```

## License

MIT
