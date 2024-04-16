import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["color", "strokeWidth", "linePick"];
import { isUndefined } from 'lodash-es';
import { memo, useCallback } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Line = /*#__PURE__*/function (Line) {
  Line[Line["l7"] = 0] = "l7";
  Line[Line["l6"] = 1] = "l6";
  Line[Line["l5"] = 2] = "l5";
  Line[Line["l4"] = 3] = "l4";
  Line[Line["l3"] = 4] = "l3";
  Line[Line["l2"] = 5] = "l2";
  Line[Line["l1"] = 6] = "l1";
  Line[Line["center"] = 7] = "center";
  Line[Line["r1"] = 8] = "r1";
  Line[Line["r2"] = 9] = "r2";
  Line[Line["r3"] = 10] = "r3";
  Line[Line["r4"] = 11] = "r4";
  Line[Line["r5"] = 12] = "r5";
  Line[Line["r6"] = 13] = "r6";
  Line[Line["r7"] = 14] = "r7";
  return Line;
}(Line || {});
var Grid = /*#__PURE__*/memo(function (_ref) {
  var _ref$color = _ref.color,
    color = _ref$color === void 0 ? '#fff' : _ref$color,
    _ref$strokeWidth = _ref.strokeWidth,
    strokeWidth = _ref$strokeWidth === void 0 ? 3 : _ref$strokeWidth,
    linePick = _ref.linePick,
    rest = _objectWithoutProperties(_ref, _excluded);
  var isUnpick = isUndefined(linePick);
  var showLine = useCallback(function (l) {
    return isUnpick || linePick === l;
  }, [linePick]);
  var vLine = /*#__PURE__*/_jsxs(_Fragment, {
    children: [showLine(Line.l7) && /*#__PURE__*/_jsx("path", {
      d: "M2 420v-60.343c0-21.82 14.15-41.12 34.959-47.684L1026 0h0"
    }), showLine(Line.l6) && /*#__PURE__*/_jsx("path", {
      d: "M268 420v-62.077c0-20.977 13.094-39.724 32.789-46.944L1149 0h0"
    }), showLine(Line.l5) && /*#__PURE__*/_jsx("path", {
      d: "M534 420v-64.358a50 50 0 0129.884-45.775L1269 0h0"
    }), showLine(Line.l4) && /*#__PURE__*/_jsx("path", {
      d: "M800 420v-67.395a50 50 0 0125.958-43.84L1389 0h0"
    }), showLine(Line.l3) && /*#__PURE__*/_jsx("path", {
      d: "M1066 420v-71.645a50 50 0 0120.456-40.337L1507 0h0"
    }), showLine(Line.l2) && /*#__PURE__*/_jsx("path", {
      d: "M1332 420v-77.506a50 50 0 0113.194-33.843L1629 0h0"
    }), showLine(Line.l1) && /*#__PURE__*/_jsx("path", {
      d: "M1598 420v-86.225a50 50 0 014.438-20.594L1744 0h0"
    }), showLine(Line.center) && /*#__PURE__*/_jsx("path", {
      d: "M1864 420V0h0"
    }), showLine(Line.r1) && /*#__PURE__*/_jsx("path", {
      d: "M2130 420v-86.225a50 50 0 00-4.438-20.594L1984 0h0"
    }), showLine(Line.r2) && /*#__PURE__*/_jsx("path", {
      d: "M2396 420v-77.506a50 50 0 00-13.194-33.843L2099 0h0"
    }), showLine(Line.r3) && /*#__PURE__*/_jsx("path", {
      d: "M2662 420v-71.645a50 50 0 00-20.456-40.337L2221 0h0"
    }), showLine(Line.r4) && /*#__PURE__*/_jsx("path", {
      d: "M2928 420v-67.395a50 50 0 00-25.958-43.84L2339 0h0"
    }), showLine(Line.r5) && /*#__PURE__*/_jsx("path", {
      d: "M3194 420v-64.358a50 50 0 00-29.884-45.775L2459 0h0"
    }), showLine(Line.r6) && /*#__PURE__*/_jsx("path", {
      d: "M3460 420v-62.077c0-20.977-13.094-39.724-32.789-46.944L2579 0h0"
    }), showLine(Line.r7) && /*#__PURE__*/_jsx("path", {
      d: "M3726 420v-60.343c0-21.82-14.15-41.12-34.959-47.684L2702 0h0"
    })]
  });
  var hLine = isUnpick && /*#__PURE__*/_jsxs(_Fragment, {
    children: [/*#__PURE__*/_jsx("path", {
      d: "M2835 42H892"
    }), /*#__PURE__*/_jsx("path", {
      d: "M595 136h2538"
    }), /*#__PURE__*/_jsx("path", {
      d: "M237 249h3254"
    })]
  });
  return /*#__PURE__*/_jsx("div", _objectSpread(_objectSpread({}, rest), {}, {
    children: /*#__PURE__*/_jsx("svg", {
      style: {
        width: '100%'
      },
      viewBox: "0 0 3728 422",
      xmlns: "http://www.w3.org/2000/svg",
      children: /*#__PURE__*/_jsxs("g", {
        fill: "none",
        fillRule: "evenodd",
        stroke: color,
        strokeWidth: strokeWidth,
        children: [vLine, hLine]
      })
    })
  }));
});
export default Grid;