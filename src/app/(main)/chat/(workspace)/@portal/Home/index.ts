import Body from './Body';
import Header from './Header';

export { default as HomeBody } from './Body';
export { default as HomeHeader } from './Header';

export const Home = {
  Body,
  Header,
  useEnable: () => true,
};
