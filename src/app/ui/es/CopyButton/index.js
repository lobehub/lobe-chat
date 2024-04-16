'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["content", "placement", "size", "icon", "glass", "onClick"];
import { Check, Copy } from 'lucide-react';
import { memo } from 'react';
import ActionIcon from "../ActionIcon";
import { useCopied } from "../hooks/useCopied";
import { copyToClipboard } from "../utils/copyToClipboard";
import { jsx as _jsx } from "react/jsx-runtime";
var CopyButton = /*#__PURE__*/memo(function (_ref) {
  var content = _ref.content,
    _ref$placement = _ref.placement,
    placement = _ref$placement === void 0 ? 'right' : _ref$placement,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 'site' : _ref$size,
    icon = _ref.icon,
    _ref$glass = _ref.glass,
    glass = _ref$glass === void 0 ? true : _ref$glass,
    onClick = _ref.onClick,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useCopied = useCopied(),
    copied = _useCopied.copied,
    setCopied = _useCopied.setCopied;
  var Icon = icon || Copy;
  return /*#__PURE__*/_jsx(ActionIcon, _objectSpread(_objectSpread({
    glass: glass
  }, rest), {}, {
    active: copied,
    icon: copied ? Check : Icon,
    onClick: ( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return copyToClipboard(content);
            case 2:
              setCopied();
              onClick === null || onClick === void 0 || onClick(e);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }()),
    placement: placement,
    size: size,
    title: 'Copy'
  }));
});
export default CopyButton;