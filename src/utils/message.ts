import { FUNCTION_MESSAGE_FLAG } from '@/const/message';

export const isFunctionMessageAtStart = (content: string) => {
  return content.startsWith(FUNCTION_MESSAGE_FLAG);
};

export const testFunctionMessageAtEnd = (content: string) => {
  const regExp = /{"function_call":.*?}}/;
  const match = content.match(regExp);

  return { content: match ? match[0] : '', valid: match };
};

// export const createFunctionCallMessage = () => {
//   return [
//     {
//       content: '',
//       function_call: { arguments: '{\n  "city": "杭州"\n}', name: 'realtimeWeather' },
//       role: 'assistant',
//     },
//     {
//       content:
//         '{"status":"1","count":"1","info":"OK","infocode":"10000","forecasts":[{"city":"杭州市","adcode":"300","province":"浙江","reporttime":"2023-07-28 20:32:48","casts":[{"date":"2023-07-28","week":"5","dayweather"小雨","nightweather":"小雨-中雨","daytemp":"32","nighttemp":"26","daywind":"东","nightwind":"东","daypower":"6power":"6","daytemp_float":"32.0","nighttemp_float":"26.0"},{"date":"2023-07-29","week":"6","dayweather":"小雨雨","nightweather":"小雨","daytemp":"30","nighttemp":"25","daywind":"东南","nightwind":"东南","daypower":"4","wer":"4","daytemp_float":"30.0","nighttemp_float":"25.0"},{"date":"2023-07-30","week":"7","dayweather":"小雨",ightweather":"雷阵雨","daytemp":"31","nighttemp":"25","daywind":"东南","nightwind":"东南","daypower":"4","nigh:"4","daytemp_float":"31.0","nighttemp_float":"25.0"},{"date":"2023-07-31","week":"1","dayweather":"雷阵雨","ntweather":"雷阵雨","daytemp":"33","nighttemp":"25","daywind":"东","nightwind":"东","daypower":"4","nightpower""daytemp_float":"33.0","nighttemp_float":"25.0"}]}]}',
//       name: 'realtimeWeather',
//       role: 'function',
//     },
//   ];
// };
