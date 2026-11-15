import '../src/main.ts';

class HaIconStub extends HTMLElement {
  private _icon = '';
  set icon(value: string) {
    this._icon = value;
    this.textContent = '◉';
    this.title = value;
  }
  get icon(): string {
    return this._icon;
  }
}

if (!customElements.get('ha-icon')) {
  customElements.define('ha-icon', HaIconStub);
}

const tomorrow = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const demoForecast = [
  { datetime: tomorrow(0), condition: 'partlycloudy', temperature: 9, templow: 3 },
  { datetime: tomorrow(1), condition: 'rainy', temperature: 7, templow: 2 },
  { datetime: tomorrow(2), condition: 'sunny', temperature: 12, templow: 4 },
  { datetime: tomorrow(3), condition: 'snowy', temperature: 1, templow: -4 },
];

const hass: Record<string, unknown> = {
  locale: { language: 'ru', time_format: '24' },
  states: {
    'weather.home': {
      entity_id: 'weather.home',
      state: 'partlycloudy',
      attributes: { temperature: 8.3, humidity: 72, pressure: 1012 },
    },
    'sensor.indoor_temperature': {
      entity_id: 'sensor.indoor_temperature',
      state: '21.4',
      attributes: { unit_of_measurement: '°C' },
    },
    'sensor.indoor_humidity': {
      entity_id: 'sensor.indoor_humidity',
      state: '45',
      attributes: { unit_of_measurement: '%' },
    },
  },
  connection: {
    subscribeMessage: async (callback: (message: unknown) => void) => {
      callback({ forecast: demoForecast });
      return async () => {};
    },
  },
  callWS: async () => ({ forecast: demoForecast }),
};

const card = document.createElement('nspanel-weather-card') as HTMLElement & {
  setConfig: (config: unknown) => void;
  hass: unknown;
};
card.setConfig({});
card.hass = hass;
document.getElementById('root')!.append(card);
