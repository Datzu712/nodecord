// COPIED FROM https://gist.github.com/abritinthebay/d80eb99b2726c83feb0d97eab95206c4#file-consolecolors-js-L8
// Colors reference
// You can use the following as so:
// console.log(colorCode, data);
// console.log(`${colorCode}some colorful text string${resetCode} rest of string in normal color`);
//
// ... and so on.

export const reset = '\x1b[0m';
export const bright = '\x1b[1m';
export const dim = '\x1b[2m';
export const underscore = '\x1b[4m';
export const blink = '\x1b[5m';
export const reverse = '\x1b[7m';
export const hidden = '\x1b[8m';

export const black = '\x1b[30m';
export const red = '\x1b[31m';
export const green = '\x1b[32m';
export const yellow = '\x1b[33m';
export const blue = '\x1b[34m';
export const magenta = '\x1b[35m';
export const cyan = '\x1b[36m';
export const white = '\x1b[37m';

export const BGblack = '\x1b[40m';
export const BGred = '\x1b[41m';
export const BGgreen = '\x1b[42m';
export const BGyellow = '\x1b[43m';
export const BGblue = '\x1b[44m';
export const BGmagenta = '\x1b[45m';
export const BGcyan = '\x1b[46m';
export const BGwhite = '\x1b[47m';
