import emojilib from '@lobehub/emojilib';
import emojiRegex from 'emoji-regex';
export var getEmoji = function getEmoji(emoji) {
  var _emoji$match;
  var regex = emojiRegex();
  var pureEmoji = (_emoji$match = emoji.match(regex)) === null || _emoji$match === void 0 ? void 0 : _emoji$match[0];
  return pureEmoji;
};
export var getEmojiNameByCharacter = function getEmojiNameByCharacter(emoji) {
  var pureEmoji = getEmoji(emoji);
  if (!pureEmoji) return;
  var EmojiLab = emojilib;
  return EmojiLab === null || EmojiLab === void 0 ? void 0 : EmojiLab[pureEmoji];
};