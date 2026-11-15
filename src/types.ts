export type LocaleSetting = 'auto' | 'ru' | 'en';
export type Align = 'left' | 'center' | 'right';

export type WeatherConditionKey =
  | 'clear-night'
  | 'cloudy'
  | 'exceptional'
  | 'fog'
  | 'hail'
  | 'lightning'
  | 'lightning-rainy'
  | 'partlycloudy'
  | 'pouring'
  | 'rainy'
  | 'snowy'
  | 'snowy-rainy'
  | 'sunny'
  | 'windy'
  | 'windy-variant';

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language: string; time_format?: string };
  connection?: {
    subscribeMessage<T>(
      callback: (message: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void | Promise<void>>;
  };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

export interface BackgroundConfig {
  image: string;
  color: string;
  opacity: number;
}

export interface FontConfig {
  family: string;
  custom_font_url: string;
  color: string;
}

export interface BlockBase {
  enabled: boolean;
  x: number;
  y: number;
  color: string;
}

export interface ClockConfig extends BlockBase {
  show_time: boolean;
  show_date: boolean;
  show_weekday: boolean;
  time_size: number;
  date_size: number;
  time_weight: number;
  align: Align;
}

export interface OutdoorConfig extends BlockBase {
  weather_entity: string;
  temp_entity: string;
  humidity_entity: string;
  pressure_entity: string;
  show_temp: boolean;
  show_humidity: boolean;
  show_pressure: boolean;
  show_icon: boolean;
  temp_size: number;
  value_size: number;
  icon_size: number;
  icon_override: Record<string, string>;
}

export interface ForecastConfig extends BlockBase {
  days: number;
  icon_size: number;
  day_size: number;
  temp_size: number;
  show_min: boolean;
  weather_entity: string;
}

export interface IndoorConfig extends BlockBase {
  temp_entity: string;
  humidity_entity: string;
  temp_size: number;
  value_size: number;
  show_humidity: boolean;
}

export interface ButtonItem {
  icon: string;
  image: string;
  label: string;
  path: string;
  enabled: boolean;
}

export interface ButtonsConfig extends BlockBase {
  width: number;
  height: number;
  active_path: string;
  items: ButtonItem[];
}

export interface BlocksConfig {
  clock: ClockConfig;
  outdoor: OutdoorConfig;
  forecast: ForecastConfig;
  indoor: IndoorConfig;
  buttons: ButtonsConfig;
}

export interface NSPanelCardConfig {
  type?: string;
  width: number;
  height: number;
  locale: LocaleSetting;
  background: BackgroundConfig;
  font: FontConfig;
  blocks: BlocksConfig;
}

export interface ForecastDay {
  date: Date;
  condition: WeatherConditionKey;
  tempMax?: number;
  tempMin?: number;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};
