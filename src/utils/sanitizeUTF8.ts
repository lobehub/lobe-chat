/**
 * Sanitize UTF-8 string to remove all control characters and invalid code points.
 * @param str
 */
export const sanitizeUTF8 = (str: string) => {
  // 移除替换字符 (0xFFFD) 和其他非法字符
  return (
    str
      .replaceAll('�', '') // 移除 Unicode 替换字符
      // eslint-disable-next-line no-control-regex
      .replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // 移除控制字符
      .replaceAll(/[\uD800-\uDFFF]/g, '')
  ); // 移除未配对的代理项码点
};
