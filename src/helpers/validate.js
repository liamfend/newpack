import emojiRegexFn from 'emoji-regex/RGI_Emoji';

const emojiRegex = emojiRegexFn();
// eslint-disable-next-line no-useless-escape, max-len
export const validateEmail = value => /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(value);
export const validateEmojiRegex = value => !new RegExp(emojiRegex).test(value);
export const EmojiRegex = new RegExp(emojiRegex);
