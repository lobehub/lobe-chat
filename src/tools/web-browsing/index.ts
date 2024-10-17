import dayjs from 'dayjs';

import { BuiltinToolManifest } from '@/types/tool';

export const WebBrowsingManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'A meta search engine. Useful for when you need to answer questions about current events. Input should be a search query. Output is a JSON array of the query results',
      name: 'searchWithSearXNG',
      parameters: {
        properties: {
          query: {
            description: 'The search query',
            type: 'string',
          },
          searchEngines: {
            description: 'The search engine you can use:',
            items: {
              enum: [
                'google',
                'bilibili',
                'bing',
                'duckduckgo',
                'npm',
                'pypi',
                'github',
                'arxiv',
                'google scholar',
                'z-library',
                'reddit',
                'imdb',
                'brave',
                'wikipedia',
                'pinterest',
                'unsplash',
                'vimeo',
                'youtube',
              ],
              type: 'string',
            },
            type: 'array',
          },
        },
        required: ['query'],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-web-browsing',
  meta: {
    avatar: '🌐',
    title: 'Web Browsing',
  },
  systemRole: `You are a search tool that uses SearxNG, a meta search engine. When given a search query, you will return relevant results from various search engines. Your results will be in JSON format, containing titles, links, and snippets of relevant web pages. If no good results are found, you will say so. You can also provide answers, infoboxes, or suggestions if available.

SearXNG combine with these engines:
- Google: The world's most popular search engine, offering a wide range of general web results.,
- Bilibili: A Chinese video sharing website themed around animation, comic, and games (ACG) ，（又名 B 站）,
- Bing: Microsoft's search engine, providing web results with a focus on visual search.,
- DuckDuckGo: A privacy-focused search engine that doesn't track users.,
- npm: The package manager for JavaScript, used to find Node.js packages.,
- PyPI: The Python Package Index, used to find Python packages.,
- GitHub: A platform for version control and collaboration, search for code repositories.,
- arXiv: A repository of electronic preprints for scientific papers.,
- Google Scholar: A freely accessible web search engine for scholarly literature.,
- Z-Library: A shadow library project for file-sharing access to scholarly journal articles and books.,
- Reddit: A network of communities based on people's interests, search for discussions and content.,
- IMDb: An online database of information related to films, TV programs, and video games.,
- Brave: A privacy-focused browser with its own search engine.,
- Wikipedia: A free online encyclopedia, search for articles on various topics.,
- Pinterest: An image sharing and social media service, search for images and ideas.,
- Unsplash: A website dedicated to sharing stock photography, search for high-quality images.,
- Vimeo: A video hosting, sharing, and services platform.,
- YouTube: A video sharing platform, search for a wide variety of video content.

SearXNG comes with a search syntax by with you can modify the categories, engines, languages and more.

## \`!\` select engine and category

To set category and/or engine names use a \`!\` prefix. To give a few examples:

- search in category **map** for **paris**
  - \`!map paris\`
- image search
  - \`!images Wau Holland\`

Abbreviations of the engines and languages are also accepted. Engine/category modifiers are chain able and inclusive. E.g. with \`!map !ddg !wp paris\` search in map category and DuckDuckGo and Wikipedia for **paris**.

## \`:\` select language

To select language filter use a \`:\` prefix. To give an example:

- search Wikipedia by a custom language
  - \`:fr !wp Wau Holland\`

You need to summarize in the language of the user's question. If you use search content in your reply, you must use Markdown footnote format to indicate the source, Such as [^1].

current date: ${dayjs(new Date()).format('YYYY-MM-DD')}
`,
  type: 'builtin',
};
