/**
 * transform bytes to kb or mb
 * @param {Bytes} size
 */
export const getFileSizeString = (size) => {
  if (typeof size !== 'number' || size <= 0) {
    return '0';
  }
  if (size / 1024 / 1024 >= 1) { // >= 1mb
    return `${parseFloat(size / 1024 / 1024).toFixed(2)}M`;
  }
  return `${parseFloat(size / 1024).toFixed(2)}kb`;
};

/**
 * get user selected text by mouse
 */
export const getSelected = () => {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.getSelection) {
    return document.getSelection().toString();
  }
  const selection = document.selection && document.selection.createRange();

  if (selection && selection.text) {
    return selection.text.toString();
  }

  return '';
};

export default {
  getFileSizeString,
};
