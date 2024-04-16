import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { Space, message } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { copyToClipboard } from "../utils/copyToClipboard";
import { alphaBg, useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ScaleRow = /*#__PURE__*/memo(function (_ref) {
  var name = _ref.name,
    title = _ref.title,
    scale = _ref.scale;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var style = {};
  var isAlpha = false;
  switch (title) {
    case 'lightA':
      {
        style = {
          background: alphaBg.light,
          backgroundColor: '#fff'
        };
        isAlpha = true;
        break;
      }
    case 'darkA':
      {
        style = {
          background: alphaBg.dark,
          backgroundColor: '#000'
        };
        isAlpha = true;
        break;
      }
    default:
      {
        break;
      }
  }
  return /*#__PURE__*/_jsxs(Space, {
    size: 2,
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.scaleRowTitle,
      children: /*#__PURE__*/_jsx("div", {
        className: styles.text,
        children: title
      })
    }, title), scale.map(function (color, index) {
      if (index === 0 || index === 12) return false;
      return /*#__PURE__*/_jsx("div", {
        className: styles.scaleBox,
        onClick: /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var content;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                content = "token.".concat(name).concat(index).concat(isAlpha ? 'A' : '', " /* ").concat(color, " */");
                _context.next = 3;
                return copyToClipboard(content);
              case 3:
                message.success(content);
              case 4:
              case "end":
                return _context.stop();
            }
          }, _callee);
        })),
        style: style,
        title: color,
        children: /*#__PURE__*/_jsx(Flexbox, {
          align: 'center',
          className: styles.scaleItem,
          horizontal: true,
          justify: 'center',
          style: {
            backgroundColor: color
          }
        })
      }, index);
    })]
  });
});
export default ScaleRow;