!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(e="undefined"!=typeof globalThis?globalThis:e||self).$$LOGSDK_PLUGIN_EXTEND=n()}(this,(function(){"use strict";function e(e,n){for(var t=0;t<n.length;t++){var i=n[t];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var n,t="mp_launch",i="mp_enter",o="mp_exit",a="purchase",c="query",u="update_level",r="create_gamerole",s="check_out",f="add_to_favourite",l={mpLaunch:function(e,n){e(t,Object.assign({},n))},mpEnter:function(e,t){n=+new Date,e(i,Object.assign({},t))},mpExit:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=getCurrentPages(),a=i[i.length-1].route,c=void 0===n?0:+new Date-n;e(o,Object.assign({duration:c,page_path:a},t)),n=void 0},purchase:function(e,n){e(a,Object.assign({},n))},quest:function(e,n){e(c,Object.assign({},n))},updateLevel:function(e,n){e(u,Object.assign({},n))},createGameRole:function(e,n){e(r,Object.assign({},n))},checkout:function(e,n){e(s,Object.assign({},n))},addToFavourite:function(e,n){e(f,Object.assign({},n))}},d=function(){function n(){!function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,n)}var t,i,o;return t=n,(i=[{key:"apply",value:function(e,n){var t=this;this.sdk=e,this.options=n,Object.keys(l).forEach((function(e){t.sdk[e]=l[e].bind(null,t.sdk.event.bind(t.sdk))}))}}])&&e(t.prototype,i),o&&e(t,o),Object.defineProperty(t,"prototype",{writable:!1}),t,n}();return d.pluginName="official:extend",d}));
