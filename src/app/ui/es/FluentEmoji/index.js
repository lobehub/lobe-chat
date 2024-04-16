'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { kebabCase } from 'lodash-es';
import { memo, useMemo, useState } from 'react';
import { useCdnFn } from "../ConfigProvider";
import Img from "../Img";
import { getEmojiNameByCharacter } from "../utils/getEmojiByCharacter";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var FluentEmoji = /*#__PURE__*/memo(function (_ref) {
  var emoji = _ref.emoji,
    className = _ref.className,
    style = _ref.style,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? '3d' : _ref$type,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 40 : _ref$size,
    unoptimized = _ref.unoptimized;
  var genCdnUrl = useCdnFn();
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    loadingFail = _useState2[0],
    setLoadingFail = _useState2[1];
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var emojiUrl = useMemo(function () {
    if (type === 'pure') return;
    var emojiName = getEmojiNameByCharacter(emoji);
    if (!emojiName) return;
    switch (type) {
      case 'modern':
      case 'flat':
      case 'high-contrast':
        {
          return genCdnUrl({
            path: "icons/".concat(type, "/").concat(kebabCase(emojiName), ".svg"),
            pkg: 'fluentui-emoji',
            version: '0.0.8'
          });
        }
      case 'anim':
        {
          return genCdnUrl({
            path: "assets/".concat(emojiName, ".webp"),
            pkg: '@lobehub/assets-emoji-anim',
            version: '1.0.0'
          });
        }
      case '3d':
        {
          return genCdnUrl({
            path: "assets/".concat(emojiName, ".webp"),
            pkg: '@lobehub/assets-emoji',
            version: '1.3.0'
          });
        }
    }
  }, [type, emoji]);
  if (type === 'pure' || !emojiUrl || loadingFail) return /*#__PURE__*/_jsx("div", {
    className: cx(styles.container, className),
    style: _objectSpread({
      fontSize: size * 0.9,
      height: size,
      width: size
    }, style),
    children: emoji
  });
  return /*#__PURE__*/_jsx("div", {
    className: cx(styles.container, className),
    style: _objectSpread({
      height: size,
      width: size
    }, style),
    children: /*#__PURE__*/_jsx(Img, {
      alt: emoji,
      height: size,
      onError: function onError() {
        return setLoadingFail(true);
      },
      src: emojiUrl,
      unoptimized: unoptimized,
      width: size
    })
  });
});
export default FluentEmoji;