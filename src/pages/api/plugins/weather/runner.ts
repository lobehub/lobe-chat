const weatherBaseURL = 'https://restapi.amap.com/v3/weather/weatherInfo';

const citySearchURL = 'https://restapi.amap.com/v3/config/district';

const KEY = process.env.GAODE_WEATHER_KEY;

interface WeatherParams {
  city: string;
  extensions?: 'base' | 'all';
}

const fetchCityCode = async (keywords: string): Promise<string> => {
  const URL = `${citySearchURL}?keywords=${keywords}&subdistrict=0&extensions=base&key=${KEY}`;
  const res = await fetch(URL);

  const data = await res.json();

  return data.districts[0].adcode;
};

const fetchWeather = async ({ city, extensions = 'all' }: WeatherParams) => {
  const cityCode = await fetchCityCode(city);

  const URL = `${weatherBaseURL}?city=${cityCode}&extensions=${extensions}&key=${KEY}`;
  const res = await fetch(URL);

  return await res.json();
};

export default fetchWeather;
