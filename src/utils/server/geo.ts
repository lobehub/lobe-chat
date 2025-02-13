import { geolocation } from '@vercel/functions';
import { NextRequest } from 'next/server';

export const parseDefaultThemeFromLongitude = (request: NextRequest) => {
  // 获取经度信息，Next.js 会自动解析 geo 信息到请求对象中
  const geo = geolocation(request);
  const longitude = geo?.longitude;

  if (!!longitude) {
    // 计算时区偏移（每15度经度对应1小时）
    // 东经为正，西经为负
    const offsetHours = Math.round(parseInt(longitude) / 15);

    // 计算当地时间
    const localHour = (new Date().getUTCHours() + offsetHours + 24) % 24;
    console.log(`[theme] localHour: ${localHour}`);

    // 6点到18点之间返回 light 主题
    return localHour >= 6 && localHour < 18 ? 'light' : 'dark';
  }

  return 'light';
};
