import { createGlobalStyle } from 'antd-style';
import antdOverride from "./antdOverride";
import global from "./global";
var GlobalStyle = createGlobalStyle(function (_ref) {
  var theme = _ref.theme;
  return [global(theme), antdOverride(theme)];
});
export default GlobalStyle;