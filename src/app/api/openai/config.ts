// due to OpenAi is not available in Hong Kong, we need to set the preferred region to exclude "Hong Kong (hkg1)".
// refs: https://platform.openai.com/docs/supported-countries
export const openAiPreferredRegion = () => [
  'arn1',
  'bom1',
  'cdg1',
  'cle1',
  'cpt1',
  'dub1',
  'fra1',
  'gru1',
  'hnd1',
  'iad1',
  'icn1',
  'kix1',
  'lhr1',
  'pdx1',
  'sfo1',
  'sin1',
  'syd1',
];
