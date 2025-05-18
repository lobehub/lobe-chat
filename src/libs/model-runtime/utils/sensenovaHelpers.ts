export const convertSenseNovaMessage = (content: any) => {
  // 如果为单条 string 类 content，则格式转换为 text 类
  if (typeof content === 'string') {
    return [{ text: content, type: 'text' }];
  }

  // 如果内容为空或不是数组，返回空数组避免后续错误
  if (!Array.isArray(content)) {
    return [];
  }

  // 如果内容包含图片内容，则需要对 array 类 content，进行格式转换
  return content
    .map((item: any) => {
      // 如果项为空，跳过处理
      if (!item) return null;

      // 如果为 content，则格式转换为 text 类
      if (item.type === 'text') return item;

      // 如果为 image_url，则格式转换为 image_url 类
      if (item.type === 'image_url' && item.image_url) {
        const url = item.image_url.url;

        // 确保 URL 存在且为字符串
        if (!url || typeof url !== 'string') return null;

        // 如果 image_url 为 base64 格式，则返回 image_base64 类，否则返回 image_url 类
        return url.startsWith('data:image/jpeg;base64') || url.startsWith('data:image/png;base64')
          ? {
              image_base64: url.split(',')[1],
              type: 'image_base64',
            }
          : { image_url: url, type: 'image_url' };
      }

      return null;
    })
    .filter(Boolean);
};
