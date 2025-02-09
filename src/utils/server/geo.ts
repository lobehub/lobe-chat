import { geolocation } from '@vercel/functions';
import { getCountry } from 'countries-and-timezones';
import { NextRequest } from 'next/server';

export const parseDefaultThemeFromCountry = (request: NextRequest) => {
  // 1. 从请求头中获取国家代码
  const geo = geolocation(request);

  const countryCode =
    geo?.country ||
    request.headers.get('x-vercel-ip-country') || // Vercel
    request.headers.get('cf-ipcountry') || // Cloudflare
    request.headers.get('x-zeabur-ip-country') || // Zeabur
    request.headers.get('x-country-code'); // Netlify

  // 如果没有获取到国家代码，直接返回 light 主题
  if (!countryCode) return 'light';

  // 2. 获取国家的时区信息
  const country = getCountry(countryCode);

  // 如果找不到国家信息或该国家没有时区信息，返回 light 主题
  if (!country?.timezones?.length) return 'light';

  // 3. 获取该国家的第一个 时区下的当前时间
  const localTime = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: country.timezones[0],
  });

  // 4. 解析小时数并确定主题
  const localHour = parseInt(localTime);
  // console.log(
  //   `[theme] Country: ${countryCode}, Timezone: ${country.timezones[0]}, LocalHour: ${localHour}`,
  // );

  return localHour >= 6 && localHour < 18 ? 'light' : 'dark';
};
