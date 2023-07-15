import { createGlobalStyle } from 'antd-style';

import antdOverride from './antdOverride';
import global from './global';

export const GlobalStyle = createGlobalStyle(({ theme }) => [global(), antdOverride(theme)]);
