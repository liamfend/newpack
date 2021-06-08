!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["microapp-frontend-base"]=e():t["microapp-frontend-base"]=e()}(this,function(){return function(t){function e(n){if(r[n])return r[n].exports;var o=r[n]={exports:{},id:n,loaded:!1};return t[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}({0:function(t,e,r){t.exports=r(193)},193:function(t,e,r){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function o(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"H";a.default.toDataURL(t,{errorCorrectionLevel:r},function(t,r){return!t&&(e&&e.setAttribute("src",r),r)})}Object.defineProperty(e,"__esModule",{value:!0}),e.default=o;var i=r(194),a=n(i);t.exports=e.default},194:function(t,e,r){"use strict";function n(t,e,r,n,i){var a=arguments.length-1;if(a<2)throw new Error("Too few arguments provided");if(2===a?(i=r,r=e,e=n=void 0):3===a&&(e.getContext&&"undefined"==typeof i?(i=n,n=void 0):(i=n,n=r,r=e,e=void 0)),"function"!=typeof i)throw new Error("Callback required as last argument");try{var u=o.create(r,n);i(null,t(u,e,n))}catch(t){i(t)}}var o=r(195),i=r(219),a=r(221);e.create=o.create,e.toCanvas=n.bind(null,i.render),e.toDataURL=n.bind(null,i.renderToDataURL),e.toString=n.bind(null,function(t,e,r){return a.render(t,r)}),e.qrcodedraw=function(){return{draw:e.toCanvas}}},195:function(t,e,r){"use strict";function n(t,e){for(var r=t.size,n=y.getPositions(e),o=0;o<n.length;o++)for(var i=n[o][0],a=n[o][1],u=-1;u<=7;u++)if(!(i+u<=-1||r<=i+u))for(var s=-1;s<=7;s++)a+s<=-1||r<=a+s||(u>=0&&u<=6&&(0===s||6===s)||s>=0&&s<=6&&(0===u||6===u)||u>=2&&u<=4&&s>=2&&s<=4?t.set(i+u,a+s,!0,!0):t.set(i+u,a+s,!1,!0))}function o(t){for(var e=t.size,r=8;r<e-8;r++){var n=r%2===0;t.set(r,6,n,!0),t.set(6,r,n,!0)}}function i(t,e){for(var r=w.getPositions(e),n=0;n<r.length;n++)for(var o=r[n][0],i=r[n][1],a=-2;a<=2;a++)for(var u=-2;u<=2;u++)a===-2||2===a||u===-2||2===u||0===a&&0===u?t.set(o+a,i+u,!0,!0):t.set(o+a,i+u,!1,!0)}function a(t,e){for(var r,n,o,i=t.size,a=B.getEncodedBits(e),u=0;u<18;u++)r=Math.floor(u/3),n=u%3+i-8-3,o=1===(a>>u&1),t.set(r,n,o,!0),t.set(n,r,o,!0)}function u(t,e,r){var n,o,i=t.size,a=A.getEncodedBits(e,r);for(n=0;n<15;n++)o=1===(a>>n&1),n<6?t.set(n,8,o,!0):n<8?t.set(n+1,8,o,!0):t.set(i-15+n,8,o,!0),n<8?t.set(8,i-n-1,o,!0):n<9?t.set(8,15-n-1+1,o,!0):t.set(8,15-n-1,o,!0);t.set(i-8,8,1,!0)}function s(t,e){for(var r=t.size,n=-1,o=r-1,i=7,a=0,u=r-1;u>0;u-=2)for(6===u&&u--;;){for(var s=0;s<2;s++)if(!t.isReserved(o,u-s)){var f=!1;a<e.length&&(f=1===(e[a]>>>i&1)),t.set(o,u-s,f),i--,i===-1&&(a++,i=7)}if(o+=n,o<0||r<=o){o-=n,n=-n;break}}}function f(t,e,r){var n=new p;r.forEach(function(e){n.put(e.mode.bit,4),n.put(e.getLength(),C.getCharCountIndicator(e.mode,t)),e.write(n)});var o=g.getSymbolTotalCodewords(t),i=E.getTotalCodewordsCount(t,e),a=8*(o-i);for(n.getLengthInBits()+4<=a&&n.put(0,4);n.getLengthInBits()%8!==0;)n.putBit(0);for(var u=(a-n.getLengthInBits())/8,s=0;s<u;s++)n.put(s%2?17:236,8);return c(n,t,e)}function c(t,e,r){for(var n=g.getSymbolTotalCodewords(e),o=E.getTotalCodewordsCount(e,r),i=n-o,a=E.getBlocksCount(e,r),u=n%a,s=a-u,f=Math.floor(n/a),c=Math.floor(i/a),h=c+1,d=f-c,p=new b(d),v=0,w=new Array(a),y=new Array(a),m=0,B=new l(t.buffer),A=0;A<a;A++){var C=A<s?c:h;w[A]=B.slice(v,v+C),y[A]=p.encode(w[A]),v+=C,m=Math.max(m,C)}var N,T,I=new l(n),M=0;for(N=0;N<m;N++)for(T=0;T<a;T++)N<w[T].length&&(I[M++]=w[T][N]);for(N=0;N<d;N++)for(T=0;T<a;T++)I[M++]=y[T][N];return I}function h(t,e,r){var c;if(T(t))c=N.fromArray(t);else{if("string"!=typeof t)throw new Error("Invalid data");var h=e;if(!h){var l=N.rawSplit(t);h=B.getBestVersionForData(l,r)}c=N.fromString(t,h)}var d=B.getBestVersionForData(c,r);if(!d)throw new Error("The amount of data is too big to be stored in a QR Code");if(e){if(e<d)throw new Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: "+d+".\n")}else e=d;var p=f(e,r,c),w=g.getSymbolSize(e),y=new v(w);n(y,e),o(y),i(y,e),u(y,r,0),e>=7&&a(y,e),s(y,p);var E=m.getBestMask(y,u.bind(null,y,r));return m.applyMask(E,y),u(y,r,E),{modules:y,version:e,errorCorrectionLevel:r,maskPattern:E,segments:c}}var l=r(196),g=r(198),d=r(199),p=r(200),v=r(201),w=r(202),y=r(203),m=r(204),E=r(205),b=r(206),B=r(209),A=r(212),C=r(210),N=r(213),T=r(197);e.create=function(t,e){if("undefined"==typeof t||""===t)throw new Error("No input text");var r,n=d.M;return"undefined"!=typeof e&&(n=d.from(e.errorCorrectionLevel,d.M),r=B.from(e.version),e.toSJISFunc&&g.setToSJISFunction(e.toSJISFunc)),h(t,r,n)}},196:function(t,e,r){"use strict";function n(t,e,r){return"number"==typeof t?u(t):v(t,e,r)}function o(t){if(t>=y)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+y.toString(16)+" bytes");return 0|t}function i(t){return t!==t}function a(t){var e=new Uint8Array(t);return e.__proto__=n.prototype,e}function u(t){return a(t<0?0:0|o(t))}function s(t){var e=0|g(t),r=a(e),n=r.write(t);return n!==e&&(r=r.slice(0,n)),r}function f(t){for(var e=t.length<0?0:0|o(t.length),r=a(e),n=0;n<e;n+=1)r[n]=255&t[n];return r}function c(t,e,r){if(e<0||t.byteLength<e)throw new RangeError("'offset' is out of bounds");if(t.byteLength<e+(r||0))throw new RangeError("'length' is out of bounds");var o;return o=void 0===e&&void 0===r?new Uint8Array(t):void 0===r?new Uint8Array(t,e):new Uint8Array(t,e,r),o.__proto__=n.prototype,o}function h(t){if(n.isBuffer(t)){var e=0|o(t.length),r=a(e);return 0===r.length?r:(t.copy(r,0,0,e),r)}if(t){if("undefined"!=typeof ArrayBuffer&&t.buffer instanceof ArrayBuffer||"length"in t)return"number"!=typeof t.length||i(t.length)?a(0):f(t);if("Buffer"===t.type&&Array.isArray(t.data))return f(t.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function l(t,e){e=e||1/0;for(var r,n=t.length,o=null,i=[],a=0;a<n;++a){if(r=t.charCodeAt(a),r>55295&&r<57344){if(!o){if(r>56319){(e-=3)>-1&&i.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&i.push(239,191,189);continue}o=r;continue}if(r<56320){(e-=3)>-1&&i.push(239,191,189),o=r;continue}r=(o-55296<<10|r-56320)+65536}else o&&(e-=3)>-1&&i.push(239,191,189);if(o=null,r<128){if((e-=1)<0)break;i.push(r)}else if(r<2048){if((e-=2)<0)break;i.push(r>>6|192,63&r|128)}else if(r<65536){if((e-=3)<0)break;i.push(r>>12|224,r>>6&63|128,63&r|128)}else{if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;i.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128)}}return i}function g(t){if(n.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var e=t.length;return 0===e?0:l(t).length}function d(t,e,r,n){for(var o=0;o<n&&!(o+r>=e.length||o>=t.length);++o)e[o+r]=t[o];return o}function p(t,e,r,n){return d(l(e,t.length-r),t,r,n)}function v(t,e,r){if("number"==typeof t)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer?c(t,e,r):"string"==typeof t?s(t,e):h(t)}var w=r(197),y=2147483647;n.prototype.__proto__=Uint8Array.prototype,n.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&n[Symbol.species]===n&&Object.defineProperty(n,Symbol.species,{value:null,configurable:!0,enumerable:!1,writable:!1}),n.prototype.write=function(t,e,r){void 0===e?(r=this.length,e=0):void 0===r&&"string"==typeof e?(r=this.length,e=0):isFinite(e)&&(e|=0,isFinite(r)?r|=0:r=void 0);var n=this.length-e;if((void 0===r||r>n)&&(r=n),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");return p(this,t,e,r)},n.prototype.slice=function(t,e){var r=this.length;t=~~t,e=void 0===e?r:~~e,t<0?(t+=r,t<0&&(t=0)):t>r&&(t=r),e<0?(e+=r,e<0&&(e=0)):e>r&&(e=r),e<t&&(e=t);var o=this.subarray(t,e);return o.__proto__=n.prototype,o},n.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var o,i=n-r;if(this===t&&r<e&&e<n)for(o=i-1;o>=0;--o)t[o+e]=this[o+r];else if(i<1e3)for(o=0;o<i;++o)t[o+e]=this[o+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+i),e);return i},n.prototype.fill=function(t,e,r){if("string"==typeof t){if("string"==typeof e?(e=0,r=this.length):"string"==typeof r&&(r=this.length),1===t.length){var o=t.charCodeAt(0);o<256&&(t=o)}}else"number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0);var i;if("number"==typeof t)for(i=e;i<r;++i)this[i]=t;else{var a=n.isBuffer(t)?t:new n(t),u=a.length;for(i=0;i<r-e;++i)this[i+e]=a[i%u]}return this},n.concat=function(t,e){if(!w(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return a(null,0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var o=u(e),i=0;for(r=0;r<t.length;++r){var s=t[r];if(!n.isBuffer(s))throw new TypeError('"list" argument must be an Array of Buffers');s.copy(o,i),i+=s.length}return o},n.byteLength=g,n.prototype._isBuffer=!0,n.isBuffer=function(t){return!(null==t||!t._isBuffer)},t.exports=n},197:function(t,e){"use strict";var r={}.toString;t.exports=Array.isArray||function(t){return"[object Array]"==r.call(t)}},198:function(t,e){"use strict";var r,n=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];e.getSymbolSize=function(t){if(!t)throw new Error('"version" cannot be null or undefined');if(t<1||t>40)throw new Error('"version" should be in range from 1 to 40');return 4*t+17},e.getSymbolTotalCodewords=function(t){return n[t]},e.getBCHDigit=function(t){for(var e=0;0!==t;)e++,t>>>=1;return e},e.setToSJISFunction=function(t){if("function"!=typeof t)throw new Error('"toSJISFunc" is not a valid function.');r=t},e.isKanjiModeEnabled=function(){return"undefined"!=typeof r},e.toSJIS=function(t){return r(t)}},199:function(t,e){"use strict";function r(t){if("string"!=typeof t)throw new Error("Param is not a string");var r=t.toLowerCase();switch(r){case"l":case"low":return e.L;case"m":case"medium":return e.M;case"q":case"quartile":return e.Q;case"h":case"high":return e.H;default:throw new Error("Unknown EC Level: "+t)}}e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2},e.isValid=function(t){return t&&"undefined"!=typeof t.bit&&t.bit>=0&&t.bit<4},e.from=function(t,n){if(e.isValid(t))return t;try{return r(t)}catch(t){return n}}},200:function(t,e){"use strict";function r(){this.buffer=[],this.length=0}r.prototype={get:function(t){var e=Math.floor(t/8);return 1===(this.buffer[e]>>>7-t%8&1)},put:function(t,e){for(var r=0;r<e;r++)this.putBit(1===(t>>>e-r-1&1))},getLengthInBits:function(){return this.length},putBit:function(t){var e=Math.floor(this.length/8);this.buffer.length<=e&&this.buffer.push(0),t&&(this.buffer[e]|=128>>>this.length%8),this.length++}},t.exports=r},201:function(t,e,r){"use strict";function n(t){if(!t||t<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=t,this.data=new o(t*t),this.data.fill(0),this.reservedBit=new o(t*t),this.reservedBit.fill(0)}var o=r(196);n.prototype.set=function(t,e,r,n){var o=t*this.size+e;this.data[o]=r,n&&(this.reservedBit[o]=!0)},n.prototype.get=function(t,e){return this.data[t*this.size+e]},n.prototype.xor=function(t,e,r){this.data[t*this.size+e]^=r},n.prototype.isReserved=function(t,e){return this.reservedBit[t*this.size+e]},t.exports=n},202:function(t,e,r){"use strict";var n=r(198).getSymbolSize;e.getRowColCoords=function(t){if(1===t)return[];for(var e=Math.floor(t/7)+2,r=n(t),o=145===r?26:2*Math.ceil((r-13)/(2*e-2)),i=[r-7],a=1;a<e-1;a++)i[a]=i[a-1]-o;return i.push(6),i.reverse()},e.getPositions=function(t){for(var r=[],n=e.getRowColCoords(t),o=n.length,i=0;i<o;i++)for(var a=0;a<o;a++)0===i&&0===a||0===i&&a===o-1||i===o-1&&0===a||r.push([n[i],n[a]]);return r}},203:function(t,e,r){"use strict";var n=r(198).getSymbolSize,o=7;e.getPositions=function(t){var e=n(t);return[[0,0],[e-o,0],[0,e-o]]}},204:function(t,e){"use strict";function r(t,r,n){switch(t){case e.Patterns.PATTERN000:return(r+n)%2===0;case e.Patterns.PATTERN001:return r%2===0;case e.Patterns.PATTERN010:return n%3===0;case e.Patterns.PATTERN011:return(r+n)%3===0;case e.Patterns.PATTERN100:return(Math.floor(r/2)+Math.floor(n/3))%2===0;case e.Patterns.PATTERN101:return r*n%2+r*n%3===0;case e.Patterns.PATTERN110:return(r*n%2+r*n%3)%2===0;case e.Patterns.PATTERN111:return(r*n%3+(r+n)%2)%2===0;default:throw new Error("bad maskPattern:"+t)}}e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var n={N1:3,N2:3,N3:40,N4:10};e.getPenaltyN1=function(t){for(var e=t.size,r=0,o=0,i=0,a=null,u=null,s=0;s<e;s++){o=i=0,a=u=null;for(var f=0;f<e;f++){var c=t.get(s,f);c===a?o++:(o>=5&&(r+=n.N1+(o-5)),a=c,o=1),c=t.get(f,s),c===u?i++:(i>=5&&(r+=n.N1+(i-5)),u=c,i=1)}o>=5&&(r+=n.N1+(o-5)),i>=5&&(r+=n.N1+(i-5))}return r},e.getPenaltyN2=function(t){for(var e=t.size,r=0,o=0;o<e-1;o++)for(var i=0;i<e-1;i++){var a=t.get(o,i)+t.get(o,i+1)+t.get(o+1,i)+t.get(o+1,i+1);4!==a&&0!==a||r++}return r*n.N2},e.getPenaltyN3=function(t){for(var e=t.size,r=0,o=0,i=0,a=0;a<e;a++){o=i=0;for(var u=0;u<e;u++)o=o<<1&2047|t.get(a,u),u>=10&&(1488===o||93===o)&&r++,i=i<<1&2047|t.get(u,a),u>=10&&(1488===i||93===i)&&r++}return r*n.N3},e.getPenaltyN4=function(t){for(var e=0,r=t.data.length,o=0;o<r;o++)e+=t.data[o];var i=Math.abs(Math.ceil(100*e/r/5)-10);return i*n.N4},e.applyMask=function(t,e){for(var n=e.size,o=0;o<n;o++)for(var i=0;i<n;i++)e.isReserved(i,o)||e.xor(i,o,r(t,i,o))},e.getBestMask=function(t,r){for(var n=Object.keys(e.Patterns).length,o=0,i=1/0,a=0;a<n;a++){r(a),e.applyMask(a,t);var u=e.getPenaltyN1(t)+e.getPenaltyN2(t)+e.getPenaltyN3(t)+e.getPenaltyN4(t);e.applyMask(a,t),u<i&&(i=u,o=a)}return o}},205:function(t,e,r){"use strict";var n=r(199),o=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],i=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];e.getBlocksCount=function(t,e){switch(e){case n.L:return o[4*(t-1)+0];case n.M:return o[4*(t-1)+1];case n.Q:return o[4*(t-1)+2];case n.H:return o[4*(t-1)+3];default:return}},e.getTotalCodewordsCount=function(t,e){switch(e){case n.L:return i[4*(t-1)+0];case n.M:return i[4*(t-1)+1];case n.Q:return i[4*(t-1)+2];case n.H:return i[4*(t-1)+3];default:return}}},206:function(t,e,r){"use strict";function n(t){this.genPoly=void 0,this.degree=t,this.degree&&this.initialize(this.degree)}var o=r(196),i=r(207);n.prototype.initialize=function(t){this.degree=t,this.genPoly=i.generateECPolynomial(this.degree)},n.prototype.encode=function(t){if(!this.genPoly)throw new Error("Encoder not initialized");var e=new o(this.degree);e.fill(0);var r=o.concat([t,e],t.length+this.degree),n=i.mod(r,this.genPoly),a=this.degree-n.length;if(a>0){var u=new o(this.degree);return u.fill(0),n.copy(u,a),u}return n},t.exports=n},207:function(t,e,r){"use strict";var n=r(196),o=r(208);e.mul=function(t,e){var r=new n(t.length+e.length-1);r.fill(0);for(var i=0;i<t.length;i++)for(var a=0;a<e.length;a++)r[i+a]^=o.mul(t[i],e[a]);return r},e.mod=function(t,e){for(var r=new n(t);r.length-e.length>=0;){for(var i=r[0],a=0;a<e.length;a++)r[a]^=o.mul(e[a],i);for(var u=0;u<r.length&&0===r[u];)u++;r=r.slice(u)}return r},e.generateECPolynomial=function(t){for(var r=new n([1]),i=0;i<t;i++)r=e.mul(r,[1,o.exp(i)]);return r}},208:function(t,e,r){"use strict";var n=r(196),o=new n(512),i=new n(256);!function(){for(var t=1,e=0;e<255;e++)o[e]=t,i[t]=e,t<<=1,256&t&&(t^=285);for(e=255;e<512;e++)o[e]=o[e-255]}(),e.log=function(t){if(t<1)throw new Error("log("+t+")");return i[t]},e.exp=function(t){return o[t]},e.mul=function(t,e){return 0===t||0===e?0:o[i[t]+i[e]]}},209:function(t,e,r){"use strict";function n(t,r,n){for(var o=1;o<=40;o++)if(r<=e.getCapacity(o,n,t))return o}function o(t,e){return c.getCharCountIndicator(t,e)+4}function i(t,e){var r=0;return t.forEach(function(t){var n=o(t.mode,e);r+=n+t.getBitsLength()}),r}function a(t,r){for(var n=1;n<=40;n++){var o=i(t,n);if(o<=e.getCapacity(n,r,c.MIXED))return n}}var u=r(198),s=r(205),f=r(199),c=r(210),h=r(197),l=7973,g=u.getBCHDigit(l);e.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40},e.from=function(t,r){return e.isValid(t)?parseInt(t,10):r},e.getCapacity=function(t,r,n){if(!e.isValid(t))throw new Error("Invalid QR Code version");"undefined"==typeof n&&(n=c.BYTE);var i=u.getSymbolTotalCodewords(t),a=s.getTotalCodewordsCount(t,r),f=8*(i-a);if(n===c.MIXED)return f;var h=f-o(n,t);switch(n){case c.NUMERIC:return Math.floor(h/10*3);case c.ALPHANUMERIC:return Math.floor(h/11*2);case c.KANJI:return Math.floor(h/13);case c.BYTE:default:return Math.floor(h/8)}},e.getBestVersionForData=function(t,e){var r,o=f.from(e,f.M);if(h(t)){if(t.length>1)return a(t,o);if(0===t.length)return 1;r=t[0]}else r=t;return n(r.mode,r.getLength(),o)},e.getEncodedBits=function(t){if(!e.isValid(t)||t<7)throw new Error("Invalid QR Code version");for(var r=t<<12;u.getBCHDigit(r)-g>=0;)r^=l<<u.getBCHDigit(r)-g;return t<<12|r}},210:function(t,e,r){"use strict";function n(t){if("string"!=typeof t)throw new Error("Param is not a string");var r=t.toLowerCase();switch(r){case"numeric":return e.NUMERIC;case"alphanumeric":return e.ALPHANUMERIC;case"kanji":return e.KANJI;case"byte":return e.BYTE;default:throw new Error("Unknown mode: "+t)}}var o=r(209),i=r(211);e.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},e.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},e.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(t,e){if(!t.ccBits)throw new Error("Invalid mode: "+t);if(!o.isValid(e))throw new Error("Invalid version: "+e);return e>=1&&e<10?t.ccBits[0]:e<27?t.ccBits[1]:t.ccBits[2]},e.getBestModeForData=function(t){return i.testNumeric(t)?e.NUMERIC:i.testAlphanumeric(t)?e.ALPHANUMERIC:i.testKanji(t)?e.KANJI:e.BYTE},e.toString=function(t){if(t&&t.id)return t.id;throw new Error("Invalid mode")},e.isValid=function(t){return t&&t.bit&&t.ccBits},e.from=function(t,r){if(e.isValid(t))return t;try{return n(t)}catch(t){return r}}},211:function(t,e){"use strict";var r="[0-9]+",n="[A-Z $%*+-./:]+",o="(?:[　-〿]|[぀-ゟ]|[゠-ヿ]|[＀-￯]|[一-龯]|[★-☆]|[←-↕]|※|[‐―‘’‥…“”∥≠]|[Α-ё]|[§¨±´×÷])+",i="(?:(?![A-Z0-9 $%*+-./:]|"+o+").)+";e.KANJI=new RegExp(o,"g"),e.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+-./:]+","g"),e.BYTE=new RegExp(i,"g"),e.NUMERIC=new RegExp(r,"g"),e.ALPHANUMERIC=new RegExp(n,"g");var a=new RegExp("^"+o+"$"),u=new RegExp("^"+r+"$"),s=new RegExp("^[A-Z0-9 $%*+-./:]+$");e.testKanji=function(t){return a.test(t)},e.testNumeric=function(t){return u.test(t)},e.testAlphanumeric=function(t){return s.test(t)}},212:function(t,e,r){"use strict";var n=r(198),o=1335,i=21522,a=n.getBCHDigit(o);e.getEncodedBits=function(t,e){for(var r=t.bit<<3|e,u=r<<10;n.getBCHDigit(u)-a>=0;)u^=o<<n.getBCHDigit(u)-a;return(r<<10|u)^i}},213:function(t,e,r){"use strict";function n(t){return unescape(encodeURIComponent(t)).length}function o(t,e,r){for(var n,o=[];null!==(n=t.exec(r));)o.push({data:n[0],index:n.index,mode:e,length:n[0].length});return o}function i(t){var e,r,n=o(v.NUMERIC,h.NUMERIC,t),i=o(v.ALPHANUMERIC,h.ALPHANUMERIC,t);w.isKanjiModeEnabled()?(e=o(v.BYTE,h.BYTE,t),r=o(v.KANJI,h.KANJI,t)):(e=o(v.BYTE_KANJI,h.BYTE,t),r=[]);var a=n.concat(i,e,r);return a.sort(function(t,e){return t.index-e.index}).map(function(t){return{data:t.data,mode:t.mode,length:t.length}})}function a(t,e){switch(e){case h.NUMERIC:return l.getBitsLength(t);case h.ALPHANUMERIC:return g.getBitsLength(t);case h.KANJI:return p.getBitsLength(t);case h.BYTE:return d.getBitsLength(t)}}function u(t){return t.reduce(function(t,e){var r=t.length-1>=0?t[t.length-1]:null;return r&&r.mode===e.mode?(t[t.length-1].data+=e.data,t):(t.push(e),t)},[])}function s(t){for(var e=[],r=0;r<t.length;r++){var o=t[r];switch(o.mode){case h.NUMERIC:e.push([o,{data:o.data,mode:h.ALPHANUMERIC,length:o.length},{data:o.data,mode:h.BYTE,length:o.length}]);break;case h.ALPHANUMERIC:e.push([o,{data:o.data,mode:h.BYTE,length:o.length}]);break;case h.KANJI:e.push([o,{data:o.data,mode:h.BYTE,length:n(o.data)}]);break;case h.BYTE:e.push([{data:o.data,mode:h.BYTE,length:n(o.data)}])}}return e}function f(t,e){for(var r={},n={start:{}},o=["start"],i=0;i<t.length;i++){for(var u=t[i],s=[],f=0;f<u.length;f++){var c=u[f],l=""+i+f;s.push(l),r[l]={node:c,lastCount:0},n[l]={};for(var g=0;g<o.length;g++){var d=o[g];r[d]&&r[d].node.mode===c.mode?(n[d][l]=a(r[d].lastCount+c.length,c.mode)-a(r[d].lastCount,c.mode),r[d].lastCount+=c.length):(r[d]&&(r[d].lastCount=c.length),n[d][l]=a(c.length,c.mode)+4+h.getCharCountIndicator(c.mode,e))}}o=s}for(g=0;g<o.length;g++)n[o[g]].end=0;return{map:n,table:r}}function c(t,e){var r,n=h.getBestModeForData(t);if(r=h.from(e,n),r!==h.BYTE&&r.bit<n.bit)throw new Error('"'+t+'" cannot be encoded with mode '+h.toString(r)+".\n Suggested mode is: "+h.toString(n));switch(r!==h.KANJI||w.isKanjiModeEnabled()||(r=h.BYTE),r){case h.NUMERIC:return new l(t);case h.ALPHANUMERIC:return new g(t);case h.KANJI:return new p(t);case h.BYTE:return new d(t)}}var h=r(210),l=r(214),g=r(215),d=r(216),p=r(217),v=r(211),w=r(198),y=r(218);e.fromArray=function(t){return t.reduce(function(t,e){return"string"==typeof e?t.push(c(e,null)):e.data&&t.push(c(e.data,e.mode)),t},[])},e.fromString=function(t,r){for(var n=i(t,w.isKanjiModeEnabled()),o=s(n),a=f(o,r),c=y.find_path(a.map,"start","end"),h=[],l=1;l<c.length-1;l++)h.push(a.table[c[l]].node);return e.fromArray(u(h))},e.rawSplit=function(t){return e.fromArray(i(t,w.isKanjiModeEnabled()))}},214:function(t,e,r){"use strict";function n(t){this.mode=o.NUMERIC,this.data=t.toString()}var o=r(210);n.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){var e,r,n;for(e=0;e+3<=this.data.length;e+=3)r=this.data.substr(e,3),n=parseInt(r,10),t.put(n,10);var o=this.data.length-e;o>0&&(r=this.data.substr(e),n=parseInt(r,10),t.put(n,3*o+1))},t.exports=n},215:function(t,e,r){"use strict";function n(t){this.mode=o.ALPHANUMERIC,this.data=t}var o=r(210),i=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];n.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){var e;for(e=0;e+2<=this.data.length;e+=2){var r=45*i.indexOf(this.data[e]);r+=i.indexOf(this.data[e+1]),t.put(r,11)}this.data.length%2&&t.put(i.indexOf(this.data[e]),6)},t.exports=n},216:function(t,e,r){"use strict";function n(t){this.mode=i.BYTE,this.data=new o(t)}var o=r(196),i=r(210);n.getBitsLength=function(t){return 8*t},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){for(var e=0,r=this.data.length;e<r;e++)t.put(this.data[e],8)},t.exports=n},217:function(t,e,r){"use strict";function n(t){this.mode=o.KANJI,this.data=t}var o=r(210),i=r(198);n.getBitsLength=function(t){return 13*t},n.prototype.getLength=function(){return this.data.length},n.prototype.getBitsLength=function(){return n.getBitsLength(this.data.length)},n.prototype.write=function(t){var e;for(e=0;e<this.data.length;e++){var r=i.toSJIS(this.data[e]);if(r>=33088&&r<=40956)r-=33088;else{if(!(r>=57408&&r<=60351))throw new Error("Invalid SJIS character: "+this.data[e]+"\nMake sure your charset is UTF-8");r-=49472}r=192*(r>>>8&255)+(255&r),t.put(r,13)}},t.exports=n},218:function(t,e,r){"use strict";var n={single_source_shortest_paths:function(t,e,r){var o={},i={};i[e]=0;var a=n.PriorityQueue.make();a.push(e,0);for(var u,s,f,c,h,l,g,d,p;!a.empty();){u=a.pop(),s=u.value,c=u.cost,h=t[s]||{};for(f in h)h.hasOwnProperty(f)&&(l=h[f],g=c+l,d=i[f],p="undefined"==typeof i[f],(p||d>g)&&(i[f]=g,a.push(f,g),o[f]=s))}if("undefined"!=typeof r&&"undefined"==typeof i[r]){var v=["Could not find a path from ",e," to ",r,"."].join("");throw new Error(v)}return o},extract_shortest_path_from_predecessor_list:function(t,e){for(var r,n=[],o=e;o;)n.push(o),r=t[o],o=t[o];return n.reverse(),n},find_path:function(t,e,r){var o=n.single_source_shortest_paths(t,e,r);return n.extract_shortest_path_from_predecessor_list(o,r)},PriorityQueue:{make:function(t){var e,r=n.PriorityQueue,o={};t=t||{};for(e in r)r.hasOwnProperty(e)&&(o[e]=r[e]);return o.queue=[],o.sorter=t.sorter||r.default_sorter,o},default_sorter:function(t,e){return t.cost-e.cost},push:function(t,e){var r={value:t,cost:e};this.queue.push(r),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return 0===this.queue.length}}};t.exports=n},219:function(t,e,r){"use strict";function n(t,e,r){t.clearRect(0,0,e.width,e.height),e.style||(e.style={}),e.height=r,e.width=r,e.style.height=r+"px",e.style.width=r+"px"}function o(){try{return document.createElement("canvas")}catch(t){throw new Error("You need to specify a canvas element")}}var i=r(220);e.render=function(t,e,r){var a=r,u=e;"undefined"!=typeof a||e&&e.getContext||(a=e,e=void 0),e||(u=o()),a=i.getOptions(a);var s=(t.modules.size+2*a.margin)*a.scale,f=u.getContext("2d"),c=f.createImageData(s,s);return i.qrToImageData(c.data,t,a.margin,a.scale,a.color),n(f,u,s),f.putImageData(c,0,0),u},e.renderToDataURL=function(t,r,n){var o=n;"undefined"!=typeof o||r&&r.getContext||(o=r,r=void 0),o||(o={});var i=e.render(t,r,o),a=o.type||"image/png",u=o.rendererOpts||{};return i.toDataURL(a,u.quality)}},220:function(t,e){"use strict";function r(t){if("string"!=typeof t)throw new Error("Color should be defined as hex string");var e=t.slice().replace("#","").split("");if(e.length<3||5===e.length||e.length>8)throw new Error("Invalid hex color: "+t);3!==e.length&&4!==e.length||(e=Array.prototype.concat.apply([],e.map(function(t){return[t,t]}))),6===e.length&&e.push("F","F");var r=parseInt(e.join(""),16);return{r:r>>24&255,g:r>>16&255,b:r>>8&255,a:255&r}}e.getOptions=function(t){t||(t={}),t.color||(t.color={});var e="undefined"==typeof t.margin||null===t.margin||t.margin<0?4:t.margin;return{scale:t.scale||4,margin:e,color:{dark:r(t.color.dark||"#000000ff"),light:r(t.color.light||"#ffffffff")},type:t.type,rendererOpts:t.rendererOpts||{}}},e.qrToImageData=function(t,e,r,n,o){for(var i=e.modules.size,a=e.modules.data,u=r*n,s=i*n+2*u,f=[o.light,o.dark],c=0;c<s;c++)for(var h=0;h<s;h++){var l=4*(c*s+h),g=o.light;if(c>=u&&h>=u&&c<s-u&&h<s-u){var d=Math.floor((c-u)/n),p=Math.floor((h-u)/n);g=f[a[d*i+p]]}t[l++]=g.r,t[l++]=g.g,t[l++]=g.b,t[l]=g.a}}},221:function(t,e,r){"use strict";function n(t){return'fill="rgb('+[t.r,t.g,t.b].join(",")+')" fill-opacity="'+(t.a/255).toFixed(2)+'"'}var o=r(220);e.render=function(t,e){var r=o.getOptions(e),i=t.modules.size,a=t.modules.data,u=(i+2*r.margin)*r.scale,s='<?xml version="1.0" encoding="utf-8"?>\n';s+='<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n',s+='<svg version="1.1" baseProfile="full"',s+=' width="'+u+'" height="'+u+'"',s+=' viewBox="0 0 '+u+" "+u+'"',s+=' xmlns="http://www.w3.org/2000/svg"',s+=' xmlns:xlink="http://www.w3.org/1999/xlink"',s+=' xmlns:ev="http://www.w3.org/2001/xml-events">\n',s+='<rect x="0" y="0" width="'+u+'" height="'+u+'" '+n(r.color.light)+" />\n",s+='<defs><rect id="p" width="'+r.scale+'" height="'+r.scale+'" /></defs>\n',s+="<g "+n(r.color.dark)+">\n";for(var f=0;f<i;f++)for(var c=0;c<i;c++)if(a[f*i+c]){var h=(r.margin+c)*r.scale,l=(r.margin+f)*r.scale;s+='<use x="'+h+'" y="'+l+'" xlink:href="#p" />\n'}return s+="</g>\n",s+="</svg>"}}})});
//# sourceMappingURL=generateQRCode.js.map