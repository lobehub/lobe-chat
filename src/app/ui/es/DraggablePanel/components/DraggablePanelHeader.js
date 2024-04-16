import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["pin", "setPin", "className", "setExpand", "title", "position"];
import { PanelLeft, Pin, PinOff } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import ActionIcon from "../../ActionIcon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var DraggablePanelHeader = /*#__PURE__*/memo(function (props) {
  var pin = props.pin,
    setPin = props.setPin,
    className = props.className,
    setExpand = props.setExpand,
    title = props.title,
    _props$position = props.position,
    position = _props$position === void 0 ? 'left' : _props$position,
    rest = _objectWithoutProperties(props, _excluded);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var _useControlledState = useControlledState(false, {
      onChange: setPin,
      value: pin
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    isPinned = _useControlledState2[0],
    setIsPinned = _useControlledState2[1];
  var panelIcon = /*#__PURE__*/_jsx(ActionIcon, {
    icon: PanelLeft,
    onClick: function onClick() {
      return setExpand === null || setExpand === void 0 ? void 0 : setExpand(false);
    },
    size: {
      blockSize: 24,
      fontSize: 14
    }
  });
  var pinIcon = /*#__PURE__*/_jsx(ActionIcon, {
    active: pin,
    icon: pin ? Pin : PinOff,
    onClick: function onClick() {
      return setIsPinned(!isPinned);
    },
    size: {
      blockSize: 24,
      fontSize: 14
    }
  });
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'center',
    className: cx(styles.header, className),
    flex: 'none',
    gap: 8,
    horizontal: true,
    justify: 'space-between'
  }, rest), {}, {
    children: [position === 'left' ? panelIcon : pinIcon, title, position === 'left' ? pinIcon : panelIcon]
  }));
});
export default DraggablePanelHeader;