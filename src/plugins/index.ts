import searchEngine from './searchEngine';
import getWeather from './weather';
import webCrawler from './webCrawler';

const pluginList = [getWeather, searchEngine, webCrawler];

export default pluginList;
