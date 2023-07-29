import { PluginRunner } from '@/plugins/type';

import { Response, WeatherParams, WeatherResult } from './type';

const weatherBaseURL = 'https://restapi.amap.com/v3/weather/weatherInfo';

const citySearchURL = 'https://restapi.amap.com/v3/config/district';

const KEY = process.env.GAODE_WEATHER_KEY;

const fetchCityCode = async (keywords: string): Promise<string> => {
  const URL = `${citySearchURL}?keywords=${keywords}&subdistrict=0&extensions=base&key=${KEY}`;
  const res = await fetch(URL);

  const data = await res.json();
  console.log(data);

  return data.districts[0].adcode;
};

const fetchWeather: PluginRunner<WeatherParams, WeatherResult> = async ({
  city,
  extensions = 'all',
}) => {
  const cityCode = await fetchCityCode(city);

  const URL = `${weatherBaseURL}?city=${cityCode}&extensions=${extensions}&key=${KEY}`;
  const res = await fetch(URL);

  const data: Response = await res.json();

  return data.forecasts;
};

export default fetchWeather;
