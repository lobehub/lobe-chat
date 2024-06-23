import { useEffect, useState } from 'react';

import { formatSpeed } from '@/utils/speed';

// 用于测试的文件路径和尺寸
const targetFile = { size: 15.4, url: '/favicon-32x32.ico' };

const testDownloadSpeed = (url: string, size: number) =>
  new Promise<{ costTime: number; speed: number }>((resolve, reject) => {
    const img = new Image();

    img.src = `${url}?_t=${Math.random()}`; // 加个时间戳以避免浏览器只发起一次请求

    const startTime = Date.now();

    // eslint-disable-next-line unicorn/prefer-add-event-listener
    img.onload = function () {
      const fileSize = size; // 单位是 kb
      const endTime = Date.now();
      const costTime = endTime - startTime;
      const speed = (fileSize / (endTime - startTime)) * 1000; // 单位是 kb/s
      resolve({ costTime, speed });
    };

    // eslint-disable-next-line unicorn/prefer-add-event-listener
    img.onerror = reject;
  });

/**
 * return the download speed of the network
 */
export const useDownloadSpeed = () => {
  const [speed, setSpeed] = useState('-');

  useEffect(() => {
    const handleSpeed = async () => {
      let { speed } = await testDownloadSpeed(targetFile.url, targetFile.size);

      setSpeed(formatSpeed(speed));
    };

    const interval = setInterval(handleSpeed, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return speed;
};
