import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import { transformerNotationDiff, transformerNotationErrorLevel, transformerNotationFocus, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers';
import { getHighlighter } from 'shiki';
import useSWR from 'swr';
import { themeConfig } from "../Highlighter/theme";
import languageMap from "./languageMap";
export var FALLBACK_LANG = 'txt';
var FALLBACK_LANGS = [FALLBACK_LANG];
var cacheHighlighter;
var initHighlighter = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(lang) {
    var highlighter, language;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          highlighter = cacheHighlighter;
          language = lang.toLowerCase();
          if (!(highlighter && FALLBACK_LANGS.includes(language))) {
            _context.next = 4;
            break;
          }
          return _context.abrupt("return", highlighter);
        case 4:
          if (languageMap.includes(language) && !FALLBACK_LANGS.includes(language)) {
            FALLBACK_LANGS.push(language);
          }
          _context.next = 7;
          return getHighlighter({
            langs: FALLBACK_LANGS,
            themes: [themeConfig(true), themeConfig(false)]
          });
        case 7:
          highlighter = _context.sent;
          cacheHighlighter = highlighter;
          return _context.abrupt("return", highlighter);
        case 10:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function initHighlighter(_x) {
    return _ref.apply(this, arguments);
  };
}();
export var useHighlight = function useHighlight(text, lang, isDarkMode) {
  return useSWR([lang.toLowerCase(), isDarkMode ? 'dark' : 'light', text].join('-'), /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var language, highlighter, html;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          language = lang.toLowerCase();
          _context2.next = 4;
          return initHighlighter(language);
        case 4:
          highlighter = _context2.sent;
          html = highlighter === null || highlighter === void 0 ? void 0 : highlighter.codeToHtml(text, {
            lang: languageMap.includes(language) ? language : FALLBACK_LANG,
            theme: isDarkMode ? 'dark' : 'light',
            transformers: [transformerNotationDiff(), transformerNotationHighlight(), transformerNotationWordHighlight(), transformerNotationFocus(), transformerNotationErrorLevel()]
          });
          return _context2.abrupt("return", html);
        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", "<pre><code>".concat(text, "</code></pre>"));
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 9]]);
  })), {
    revalidateOnFocus: false
  });
};
export { default as languageMap } from "./languageMap";