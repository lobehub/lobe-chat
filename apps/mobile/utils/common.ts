export const isEmoji = (str: string) => {
  const emojiRegex =
    /^[\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier}|\p{Emoji_Component}]+$/u;
  return emojiRegex.test(str);
};
