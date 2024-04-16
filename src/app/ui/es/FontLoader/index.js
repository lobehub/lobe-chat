'use client';

import { memo, useEffect, useRef } from 'react';
var createElement = function createElement(url) {
  var element = document.createElement('link');
  element.rel = 'stylesheet';
  element.href = url;
  return element;
};
var FontLoader = /*#__PURE__*/memo(function (_ref) {
  var url = _ref.url;
  var loadRef = useRef(false);
  useEffect(function () {
    if (loadRef.current) return;
    loadRef.current = true;
    var element = createElement(url);
    document.head.append(element);
  }, []);
  return null;
});
export default FontLoader;