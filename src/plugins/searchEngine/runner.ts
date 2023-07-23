import querystring from 'qs';

const BASE_URL = 'https://serpapi.com/search';

const API_KEY = process.env.SERPAI_API_KEY;

const fetchResult = async (keywords: string) => {
  const params = {
    api_key: API_KEY,
    gl: 'cn',
    google_domain: 'google.com',
    hl: 'zh-cn',
    location: 'China',
    q: keywords,
  };

  const query = querystring.stringify(params);

  const res = await fetch(`${BASE_URL}?${query}`);

  const data = await res.json();

  console.log(data);

  return data.organic_results;
};

export default fetchResult;
