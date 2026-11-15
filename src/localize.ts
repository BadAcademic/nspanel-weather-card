import type { WeatherConditionKey } from './types';

export type Lang = 'ru' | 'en';

interface Dictionary {
  humidity: string;
  pressure: string;
  pressureUnit: string;
  today: string;
  tomorrow: string;
  general: string;
  backgroundAndFont: string;
  clock: string;
  outdoor: string;
  forecast: string;
  indoor: string;
  buttons: string;
  width: string;
  height: string;
  locale: string;
  localeAuto: string;
  backgroundImage: string;
  backgroundOpacity: string;
  fontFamily: string;
  customFontUrl: string;
  enabled: string;
  x: string;
  y: string;
  color: string;
  inheritColor: string;
  align: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  showTime: string;
  showDate: string;
  showWeekday: string;
  timeSize: string;
  dateSize: string;
  timeWeight: string;
  weatherEntity: string;
  tempEntity: string;
  humidityEntity: string;
  pressureEntity: string;
  showTemp: string;
  showHumidity: string;
  showPressure: string;
  showIcon: string;
  tempSize: string;
  valueSize: string;
  iconSize: string;
  iconOverride: string;
  days: string;
  daySize: string;
  showMin: string;
  forecastEntity: string;
  indoorTempEntity: string;
  indoorHumidityEntity: string;
  activePath: string;
  buttonIcon: string;
  buttonImage: string;
  buttonLabel: string;
  buttonPath: string;
  addButton: string;
  conditions: Record<WeatherConditionKey, string>;
}

export const STRINGS: Record<Lang, Dictionary> = {
  ru: {
    humidity: 'Влажность',
    pressure: 'Давление',
    pressureUnit: 'мм рт. ст.',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    general: 'Общие',
    backgroundAndFont: 'Фон и шрифт',
    clock: 'Часы',
    outdoor: 'Улица',
    forecast: 'Прогноз',
    indoor: 'Помещение',
    buttons: 'Кнопки',
    width: 'Ширина (px)',
    height: 'Высота (px)',
    locale: 'Язык',
    localeAuto: 'Как в Home Assistant',
    backgroundImage: 'Фоновое изображение (URL)',
    backgroundOpacity: 'Прозрачность фона (0–1)',
    fontFamily: 'Семейство шрифта',
    customFontUrl: 'URL шрифта (@font-face)',
    enabled: 'Включён',
    x: 'X (px)',
    y: 'Y (px)',
    color: 'Цвет',
    inheritColor: 'Сбросить (наследовать цвет)',
    align: 'Выравнивание',
    alignLeft: 'Слева',
    alignCenter: 'По центру',
    alignRight: 'Справа',
    showTime: 'Показывать время',
    showDate: 'Показывать дату',
    showWeekday: 'Показывать день недели',
    timeSize: 'Размер времени (px)',
    dateSize: 'Размер даты (px)',
    timeWeight: 'Жирность времени',
    weatherEntity: 'Погодная сущность',
    tempEntity: 'Датчик температуры (пусто = из погоды)',
    humidityEntity: 'Датчик влажности (пусто = из погоды)',
    pressureEntity: 'Датчик давления (пусто = из погоды)',
    showTemp: 'Показывать температуру',
    showHumidity: 'Показывать влажность',
    showPressure: 'Показывать давление',
    showIcon: 'Показывать иконку',
    tempSize: 'Размер температуры (px)',
    valueSize: 'Размер значений (px)',
    iconSize: 'Размер иконки (px)',
    iconOverride: 'Свои картинки погоды (URL по состоянию)',
    days: 'Количество дней (1–7)',
    daySize: 'Размер подписи дня (px)',
    showMin: 'Показывать минимум',
    forecastEntity: 'Погодная сущность (пусто = как у улицы)',
    indoorTempEntity: 'Датчик температуры',
    indoorHumidityEntity: 'Датчик влажности',
    activePath: 'Активный путь (для подсветки)',
    buttonIcon: 'Иконка (mdi)',
    buttonImage: 'Картинка (URL, вместо иконки)',
    buttonLabel: 'Подпись',
    buttonPath: 'Путь (пусто = заглушка)',
    addButton: 'Добавить кнопку',
    conditions: {
      'clear-night': 'Ясно (ночь)',
      cloudy: 'Облачно',
      exceptional: 'Аномально',
      fog: 'Туман',
      hail: 'Град',
      lightning: 'Гроза',
      'lightning-rainy': 'Гроза с дождём',
      partlycloudy: 'Переменная облачность',
      pouring: 'Ливень',
      rainy: 'Дождь',
      snowy: 'Снег',
      'snowy-rainy': 'Снег с дождём',
      sunny: 'Солнечно',
      windy: 'Ветрено',
      'windy-variant': 'Сильный ветер',
    },
  },
  en: {
    humidity: 'Humidity',
    pressure: 'Pressure',
    pressureUnit: 'mmHg',
    today: 'Today',
    tomorrow: 'Tomorrow',
    general: 'General',
    backgroundAndFont: 'Background & font',
    clock: 'Clock',
    outdoor: 'Outdoor',
    forecast: 'Forecast',
    indoor: 'Indoor',
    buttons: 'Buttons',
    width: 'Width (px)',
    height: 'Height (px)',
    locale: 'Language',
    localeAuto: 'Same as Home Assistant',
    backgroundImage: 'Background image (URL)',
    backgroundOpacity: 'Background opacity (0–1)',
    fontFamily: 'Font family',
    customFontUrl: 'Font URL (@font-face)',
    enabled: 'Enabled',
    x: 'X (px)',
    y: 'Y (px)',
    color: 'Color',
    inheritColor: 'Reset (inherit color)',
    align: 'Alignment',
    alignLeft: 'Left',
    alignCenter: 'Center',
    alignRight: 'Right',
    showTime: 'Show time',
    showDate: 'Show date',
    showWeekday: 'Show weekday',
    timeSize: 'Time size (px)',
    dateSize: 'Date size (px)',
    timeWeight: 'Time font weight',
    weatherEntity: 'Weather entity',
    tempEntity: 'Temperature sensor (empty = from weather)',
    humidityEntity: 'Humidity sensor (empty = from weather)',
    pressureEntity: 'Pressure sensor (empty = from weather)',
    showTemp: 'Show temperature',
    showHumidity: 'Show humidity',
    showPressure: 'Show pressure',
    showIcon: 'Show icon',
    tempSize: 'Temperature size (px)',
    valueSize: 'Value size (px)',
    iconSize: 'Icon size (px)',
    iconOverride: 'Custom weather images (URL per state)',
    days: 'Days (1–7)',
    daySize: 'Day label size (px)',
    showMin: 'Show minimum',
    forecastEntity: 'Weather entity (empty = same as outdoor)',
    indoorTempEntity: 'Temperature sensor',
    indoorHumidityEntity: 'Humidity sensor',
    activePath: 'Active path (for highlighting)',
    buttonIcon: 'Icon (mdi)',
    buttonImage: 'Image (URL, instead of icon)',
    buttonLabel: 'Label',
    buttonPath: 'Path (empty = placeholder)',
    addButton: 'Add button',
    conditions: {
      'clear-night': 'Clear (night)',
      cloudy: 'Cloudy',
      exceptional: 'Exceptional',
      fog: 'Fog',
      hail: 'Hail',
      lightning: 'Lightning',
      'lightning-rainy': 'Lightning rain',
      partlycloudy: 'Partly cloudy',
      pouring: 'Pouring',
      rainy: 'Rain',
      snowy: 'Snow',
      'snowy-rainy': 'Snow and rain',
      sunny: 'Sunny',
      windy: 'Windy',
      'windy-variant': 'Windy variant',
    },
  },
};

export type StringKey = Exclude<keyof Dictionary, 'conditions'>;

export function resolveLang(locale: string | undefined, hassLang: string | undefined): Lang {
  const value = locale && locale !== 'auto' ? locale : hassLang;
  return (value ?? 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function localize(lang: Lang, key: StringKey): string {
  return STRINGS[lang][key];
}

export function conditionLabel(lang: Lang, key: WeatherConditionKey): string {
  return STRINGS[lang].conditions[key];
}
