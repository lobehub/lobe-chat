import { geolocation } from '@vercel/functions';
import { getCountry } from 'countries-and-timezones';
import { NextRequest } from 'next/server';

const getLocalTime = (timeZone: string) => {
  return new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  });
};

const isValidTimeZone = (timeZone: string) => {
  try {
    getLocalTime(timeZone);
    return true; // If no exception is thrown, the timezone is valid
  } catch (e) {
    // If a RangeError is caught, the timezone is invalid
    if (e instanceof RangeError) {
      return false;
    }
    // If it's another error, better to re-throw it
    throw e;
  }
};

export const parseDefaultThemeFromCountry = (request: NextRequest) => {
  // 1. Get country code from request headers
  const geo = geolocation(request);

  const countryCode =
    geo?.country ||
    request.headers.get('x-vercel-ip-country') || // Vercel
    request.headers.get('cf-ipcountry') || // Cloudflare
    request.headers.get('x-zeabur-ip-country') || // Zeabur
    request.headers.get('x-country-code'); // Netlify

  // If no country code is obtained, return light theme directly
  if (!countryCode) return 'light';

  // 2. Get timezone information for the country
  const country = getCountry(countryCode);

  // If country information is not found or the country has no timezone information, return light theme
  if (!country?.timezones?.length) return 'light';

  const timeZone = country.timezones.find((tz) => isValidTimeZone(tz));
  if (!timeZone) return 'light';

  // 3. Get the current time in the country's first timezone
  const localTime = getLocalTime(timeZone);

  // 4. Parse the hour and determine the theme
  const localHour = parseInt(localTime);
  // console.log(
  //   `[theme] Country: ${countryCode}, Timezone: ${country.timezones[0]}, LocalHour: ${localHour}`,
  // );

  return localHour >= 6 && localHour < 18 ? 'light' : 'dark';
};
