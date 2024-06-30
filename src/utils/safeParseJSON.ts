export const safeParseJSON = <T = Record<string, any>>(text: string) => {
  let json: T;
  try {
    json = JSON.parse(text);
  } catch {
    return undefined;
  }

  return json;
};
