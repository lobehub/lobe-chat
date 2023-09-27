import { createGlobalStyle } from 'antd-style';

import antdOverride from './antdOverride';
import global from './global';

const prefixCls = 'ant';

export const GlobalStyle = createGlobalStyle(({ theme }) => [
  global({ prefixCls }),
  antdOverride({ prefixCls, token: theme }),
]);
