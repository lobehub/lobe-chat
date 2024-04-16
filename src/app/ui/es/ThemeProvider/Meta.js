import { memo, useCallback } from 'react';
import { useCdnFn } from "../ConfigProvider";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Meta = /*#__PURE__*/memo(function (_ref) {
  var _ref$title = _ref.title,
    title = _ref$title === void 0 ? 'LobeHub' : _ref$title,
    _ref$description = _ref.description,
    description = _ref$description === void 0 ? 'Empowering your AI dreams with LobeHub' : _ref$description,
    withManifest = _ref.withManifest;
  var genCdnUrl = useCdnFn();
  var genAssets = useCallback(function (path) {
    return genCdnUrl({
      path: path,
      pkg: '@lobehub/assets-favicons',
      version: 'latest'
    });
  }, []);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("link", {
      href: genAssets('assets/favicon.ico'),
      rel: "shortcut icon"
    }), /*#__PURE__*/_jsx("link", {
      href: genAssets('assets/apple-touch-icon.png'),
      rel: "apple-touch-icon",
      sizes: "180x180"
    }), /*#__PURE__*/_jsx("link", {
      href: genAssets('assets/favicon-32x32.png'),
      rel: "icon",
      sizes: "32x32",
      type: "image/png"
    }), /*#__PURE__*/_jsx("link", {
      href: genAssets('assets/favicon-16x16.png'),
      rel: "icon",
      sizes: "16x16",
      type: "image/png"
    }), /*#__PURE__*/_jsx("meta", {
      content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no",
      name: "viewport"
    }), /*#__PURE__*/_jsx("meta", {
      content: title,
      name: "apple-mobile-web-app-title"
    }), /*#__PURE__*/_jsx("meta", {
      content: title,
      name: "application-name"
    }), /*#__PURE__*/_jsx("meta", {
      content: description,
      name: "description"
    }), /*#__PURE__*/_jsx("meta", {
      content: "#000000",
      name: "msapplication-TileColor"
    }), /*#__PURE__*/_jsx("meta", {
      content: "#fff",
      media: "(prefers-color-scheme: light)",
      name: "theme-color"
    }), /*#__PURE__*/_jsx("meta", {
      content: "#000",
      media: "(prefers-color-scheme: dark)",
      name: "theme-color"
    }), /*#__PURE__*/_jsx("meta", {
      content: "yes",
      name: "apple-mobile-web-app-capable"
    }), /*#__PURE__*/_jsx("meta", {
      content: title,
      name: "apple-mobile-web-app-title"
    }), /*#__PURE__*/_jsx("meta", {
      content: "black-translucent",
      name: "apple-mobile-web-app-status-bar-style"
    }), withManifest && /*#__PURE__*/_jsx("link", {
      href: genAssets('assets/site.webmanifest'),
      rel: "manifest"
    })]
  });
});
export default Meta;