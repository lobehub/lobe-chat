export const exportFile = (content: string, filename?: string) => {
  // 创建一个 Blob 对象
  const blob = new Blob([content], { type: 'plain/text' });

  // 创建一个 URL 对象，用于下载
  const url = URL.createObjectURL(blob);

  // 创建一个 <a> 元素，设置下载链接和文件名
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'file.txt';

  // 触发 <a> 元素的点击事件，开始下载
  document.body.append(a);
  a.click();

  // 下载完成后，清除 URL 对象
  URL.revokeObjectURL(url);
  a.remove();
};
