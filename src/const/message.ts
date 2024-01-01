export const LOADING_FLAT = '...';

//  start with this，it should be a function message
export const FUNCTION_MESSAGE_FLAG = '{"tool_calls"';

export const isFunctionMessageAtStart = (content: string) => {
  return content.startsWith(FUNCTION_MESSAGE_FLAG);
};

export const testFunctionMessageAtEnd = (content: string) => {
  const regExp = /{"tool_calls":.*?]}$/;
  const match = content?.trim().match(regExp);

  return { content: match ? match[0] : '', valid: !!match };
};
