!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports["microapp-frontend-base"]=n():e["microapp-frontend-base"]=n()}(this,function(){return function(e){function n(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,n),o.loaded=!0,o.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}({0:function(e,n,t){e.exports=t(223)},42:function(e,n){"use strict";function t(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(n,"__esModule",{value:!0});var r=function e(){var n=this;t(this,e);for(var r=arguments.length,o=Array(r),a=0;a<r;a++)o[a]=arguments[a];o.forEach(function(e){if("string"!=typeof e)throw new Error("Enum helper: "+e+" is not a string");Object.defineProperty(n,e,{value:e,writable:!1,enumerable:!0,configurable:!1})})};n.default=r;n.NamespacedEnum=function e(n,r){var o=this;if(t(this,e),"string"!=typeof n)throw new Error("NamespacedEnum helper: namespace is not a string");if(!Array.isArray(r))throw new Error('NamespacedEnum helper: "values" must be an array');r.forEach(function(e){if("string"!=typeof e)throw new Error("NamespacedEnum helper: "+e+" is not a string");Object.defineProperty(o,e,{value:n+":"+e,writable:!1,enumerable:!0,configurable:!1})})}},47:function(e,n,t){"use strict";function r(){f=null}function o(){var e=window.location.hostname;return e.includes("uat1")?l.UAT1:e.includes("uat2")?l.UAT2:e.includes("uat3")?l.UAT3:"unknow"}function a(){var e="";return i("student.com")?e="student.com":i("xuelujia.xyz")?e="xuelujia.xyz":i("dandythrust.com")&&(e="dandythrust.com"),e}function u(){var e=s();return e===l.PROD?"//gateway.student.com/graphql":e===l.STAGE?"//gateway.dandythrust.com/graphql":e===l.UAT1||e===l.UAT2||e===l.UAT3?"//gateway-"+e+".dandythrust.com/graphql":"//gateway.dandythrust.com/graphql"}function i(e){if("undefined"==typeof window)return!1;var n=window.location.hostname;return n.substring(n.length-e.length)===e}function d(){return!!window.location.hostname.match(/.*cn.*\.com/i)}function s(){return f?f:f="undefined"==typeof window?l.PROD:i("student.com")?l.PROD:i("dandythrust.com")&&m()?o():i("dandythrust.com")&&!m()?l.STAGE:l.DEV}Object.defineProperty(n,"__esModule",{value:!0}),n.environments=void 0,n.clearCache=r,n.getEnvironmentUAT=o,n.getCookieDomain=a,n.getGraphQlDomain=u,n.isChinaSubdomain=d,n.default=s;var c=t(42),f=void 0,l=n.environments=new c.NamespacedEnum("ENVIRONMENT",["PROD","STAGE","UAT","UAT1","UAT2","UAT3","DEV"]),m=function(){if(window.location&&window.location.hostname){var e=window.location.hostname;return e.includes("uat")}return!1}},145:function(e,n){e.exports={urls:{dev:"/resources/",prod:"//cdn.student.com/",stage:"//storm-frontend-cdn.dandythrust.com/",uat:"//storm-frontend-cdn.dandythrust.com/"},imgCdnUrls:{dev:"//image.dandythrust.com",prod:"//image.student.com",stage:"//image.dandythrust.com",uat:"//image.dandythrust.com"}}},223:function(e,n,t){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(){return f[(0,c.default)()]}Object.defineProperty(n,"__esModule",{value:!0});var u;n.default=a;var i=t(145),d=r(i),s=t(47),c=r(s),f=(u={},o(u,s.environments.DEV,d.default.imgCdnUrls.dev),o(u,s.environments.PROD,d.default.imgCdnUrls.prod),o(u,s.environments.STAGE,d.default.imgCdnUrls.stage),o(u,s.environments.UAT,d.default.imgCdnUrls.uat),u);e.exports=n.default}})});
//# sourceMappingURL=imgCdn.js.map