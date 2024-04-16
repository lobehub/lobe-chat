'use client';

import { Space } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import ScaleRow from "./ScaleRow";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ColorScales = /*#__PURE__*/memo(function (_ref) {
  var name = _ref.name,
    scale = _ref.scale,
    midHighLight = _ref.midHighLight;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(Flexbox, {
    align: 'center',
    flex: 1,
    horizontal: true,
    justify: 'center',
    children: /*#__PURE__*/_jsx("div", {
      style: {
        padding: '8px 16px 32px 0'
      },
      children: /*#__PURE__*/_jsxs(Space, {
        direction: 'vertical',
        size: 2,
        children: [/*#__PURE__*/_jsxs(Space, {
          size: 2,
          children: [/*#__PURE__*/_jsx(Flexbox, {
            align: 'center',
            className: styles.scaleRowTitle,
            horizontal: true
          }, "scale-num"), Array.from({
            length: scale.light.length
          }).fill('').map(function (_, index) {
            if (index === 0 || index === 12) return false;
            var isMidHighlight = midHighLight === index;
            return /*#__PURE__*/_jsx("div", {
              className: styles.scaleBox,
              children: /*#__PURE__*/_jsx("div", {
                className: styles.scaleBox,
                children: /*#__PURE__*/_jsx(Flexbox, {
                  align: 'center',
                  className: styles.scaleItem,
                  horizontal: true,
                  justify: 'center',
                  style: {
                    fontWeight: isMidHighlight ? 700 : 400,
                    opacity: 0.5
                  },
                  children: index
                })
              })
            }, "num".concat(index));
          })]
        }, "scale-title"), /*#__PURE__*/_jsx(ScaleRow, {
          name: name,
          scale: scale.light,
          title: "light"
        }, "light"), /*#__PURE__*/_jsx(ScaleRow, {
          name: name,
          scale: scale.lightA,
          title: "lightA"
        }, "lightA"), /*#__PURE__*/_jsx(ScaleRow, {
          name: name,
          scale: scale.dark,
          title: "dark"
        }, "dark"), /*#__PURE__*/_jsx(ScaleRow, {
          name: name,
          scale: scale.darkA,
          title: "darkA"
        }, "darkA")]
      })
    })
  });
});
export default ColorScales;