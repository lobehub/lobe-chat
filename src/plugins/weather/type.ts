export interface WeatherParams {
  city: string;
  extensions?: 'base' | 'all';
}
export type WeatherResult = Forecast[];

export interface Response {
  count: string;
  forecasts: Forecast[];
  info: string;
  infocode: string;
  status: string;
}

export interface Forecast {
  adcode: string;
  casts: Cast[];
  city: string;
  province: string;
  reporttime: string;
}

export interface Cast {
  date: string;
  daypower: string;
  daytemp: string;
  daytemp_float: string;
  dayweather: string;
  daywind: string;
  nightpower: string;
  nighttemp: string;
  nighttemp_float: string;
  nightweather: string;
  nightwind: string;
  week: string;
}
