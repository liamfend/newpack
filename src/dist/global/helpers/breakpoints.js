!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["microapp-frontend-base"]=t():e["microapp-frontend-base"]=t()}(this,function(){return function(e){function t(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return e[i].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}({0:function(e,t,n){e.exports=n(75)},49:function(e,t){(function(t){"use strict";var n;n="undefined"!=typeof window?window:"undefined"!=typeof t?t:"undefined"!=typeof self?self:{},e.exports=n}).call(t,function(){return this}())},75:function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function r(){return f.default.innerWidth<c.default["medium-breakpoint"]}function o(){return f.default.innerWidth>=c.default["medium-breakpoint"]&&f.default.innerWidth<c.default["large-breakpoint"]}function u(){return f.default.innerWidth>=c.default["large-breakpoint"]}function d(){var e=f.default.devicePixelRatio||f.default.screen.deviceXDPI/f.default.screen.logicalXDPI;return e>1}Object.defineProperty(t,"__esModule",{value:!0}),t.isSmallScreen=r,t.isMediumScreen=o,t.isLargeScreen=u,t.isRetinaScreen=d;var a=n(49),f=i(a),l=n(76),c=i(l)},76:function(e,t){e.exports={"medium-breakpoint":"768","large-breakpoint":"1025","extra-large-breakpoint":"1440","medium-max-width":"646px","large-max-width":"1008px","mobile-side-margin":"8%","grid-column-count-small":"6","grid-column-count-medium":"12","grid-column-count-large":"12","input-height":"48px","label-height":"32px"}}})});
//# sourceMappingURL=breakpoints.js.map