export const parseDataUri = (
  dataUri: string,
): { base64: string | null; mimeType: string | null } => {
  // 正则表达式匹配整个 Data URI 结构
  const dataUriMatch = dataUri.match(/^data:([^;]+);base64,(.+)$/);

  // 如果匹配成功，则返回 mimeType 和 base64，否则返回 null
  if (dataUriMatch) {
    return {
      base64: dataUriMatch[2],
      mimeType: dataUriMatch[1],
    };
  }

  return { base64: null, mimeType: null };
};
