import { createContext, memo, useContext } from 'react';
import { genCdnUrl } from "../utils/genCdnUrl";
import { jsx as _jsx } from "react/jsx-runtime";
export var ConfigContext = /*#__PURE__*/createContext(null);
var ConfigProvider = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    config = _ref.config;
  return /*#__PURE__*/_jsx(ConfigContext.Provider, {
    value: config,
    children: children
  });
});
var fallback = function fallback(_ref2) {
  var pkg = _ref2.pkg,
    version = _ref2.version,
    path = _ref2.path;
  return genCdnUrl({
    path: path,
    pkg: pkg,
    proxy: 'aliyun',
    version: version
  });
};
export var useCdnFn = function useCdnFn() {
  var config = useContext(ConfigContext);
  if (!config) return fallback;
  if ((config === null || config === void 0 ? void 0 : config.proxy) !== 'custom') return function (_ref3) {
    var pkg = _ref3.pkg,
      version = _ref3.version,
      path = _ref3.path;
    return genCdnUrl({
      path: path,
      pkg: pkg,
      proxy: config.proxy,
      version: version
    });
  };
  return (config === null || config === void 0 ? void 0 : config.customCdnFn) || fallback;
};
export default ConfigProvider;