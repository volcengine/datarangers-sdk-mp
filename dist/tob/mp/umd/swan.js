!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).$$LOGSDK=t()}(this,(function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function n(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),Object.defineProperty(e,"prototype",{writable:!1}),e}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&o(e,t)}function r(e){return r=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},r(e)}function o(e,t){return o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},o(e,t)}function s(e,t){if(t&&("object"==typeof t||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e)}function a(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,i=r(e);if(t){var o=r(this).constructor;n=Reflect.construct(i,arguments,o)}else n=i.apply(this,arguments);return s(this,n)}}function u(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=r(e)););return e}function c(){return c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var i=u(e,t);if(!i)return;var r=Object.getOwnPropertyDescriptor(i,t);if(r.get)return r.get.call(arguments.length<3?e:n);return r.value},c.apply(this,arguments)}function f(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var i,r,o=[],s=!0,a=!1;try{for(n=n.call(e);!(s=(i=n.next()).done)&&(o.push(i.value),!t||o.length!==t);s=!0);}catch(e){a=!0,r=e}finally{try{s||null==n.return||n.return()}finally{if(a)throw r}}return o}(e,t)||l(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function h(e){return function(e){if(Array.isArray(e))return p(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||l(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){if(!e)return;if("string"==typeof e)return p(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);if("Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return p(e,t)}function p(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}function d(e,t){var n={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(i=Object.getOwnPropertySymbols(e);r<i.length;r++)t.indexOf(i[r])<0&&Object.prototype.propertyIsEnumerable.call(e,i[r])&&(n[i[r]]=e[i[r]])}return n}var v,m=void 0,y="cn",g={cn:"https://mcs.volceapplog.com",va:"https://mcs.itobsnssdk.com",sg:"https://mcs.tobsnssdk.com"},k={appOnShow:"app_launch",appOnHide:"app_terminate",appOnError:"on_error",pageOnShow:"predefine_pageview",pageOnHide:"predefine_pageview_hide",pageOnShareAppMessage:"on_share",pageOnAddToFavorites:"on_addtofavorites"},_=["utm_source","utm_medium","utm_campaign","utm_term","utm_content"],b=["__profile_set","__profile_set_once","__profile_increment","__profile_unset","__profile_append"],w=function(e){return null!=e&&"[object Object]"==Object.prototype.toString.call(e)},O=function(e){return"function"==typeof e},P=function(e){return"number"==typeof e&&!isNaN(e)},S=function(){return+new Date},A=function(){function t(n){e(this,t),this.sdk=n,this.env=this.init()}return n(t,[{key:"init",value:function(){return{user:{web_id:m,user_unique_id:m,user_id:m,user_type:m,user_is_auth:m,user_is_login:m,ip_addr_id:m,device_id:m},header:{app_id:m,app_name:m,app_install_id:m,install_id:m,app_package:m,app_channel:m,app_version:m,os_name:m,os_version:m,device_model:m,device_brand:m,traffic_type:m,client_ip:m,os_api:m,access:m,language:m,app_language:m,creative_id:m,ad_id:m,campaign_id:m,ab_client:m,ab_version:m,platform:m,sdk_version:m,sdk_lib:m,app_region:m,region:m,province:m,city:m,timezone:m,tz_offset:m,tz_name:m,sim_region:m,carrier:m,resolution:m,screen_width:m,screen_height:m,browser:m,browser_version:m,referrer:m,referrer_host:m,utm_source:m,utm_medium:m,utm_campaign:m,utm_term:m,utm_content:m,custom:{},ab_sdk_version:m,_sdk_version:m,_sdk_name:m,wechat_openid:m,wechat_unionid:m}}}},{key:"set",value:function(e){var t=this;this.sdk.emit(this.sdk.types.EnvTransform,e),Object.keys(e).forEach((function(n){if("evtParams"===n)t.evtParams=Object.assign(Object.assign({},t.evtParams||{}),e.evtParams||{});else if("_staging_flag"===n)t.evtParams=Object.assign(Object.assign({},t.evtParams||{}),{_staging_flag:e._staging_flag});else{var i=n,r=e[n];if(null===r)return!1;var o="";if(i.indexOf(".")>-1){var s=f(i.split("."),2);o=s[0],i=s[1]}"platform"===i&&(r="mp"),"os_version"!==i&&"mp_platform"!==i||(r="".concat(r)),o?("headers"===o&&(o="header"),"user"===o||"header"===o?t.env[o][i]=r:t.env.header.custom[i]=r):t.env.user.hasOwnProperty(i)?["user_type","ip_addr_id"].indexOf(i)>-1?t.env.user[i]=Number(r):["user_id","web_id","user_unique_id"].indexOf(i)>-1?t.env.user[i]=String(r):["user_is_auth","user_is_login"].indexOf(i)>-1?t.env.user[i]=Boolean(r):["device_id"].indexOf(i)>-1&&(t.env.user[i]=r):t.env.header.hasOwnProperty(i)?t.env.header[i]=r:t.env.header.custom[i]=r}}))}},{key:"get",value:function(e){if(!e||"env"===e)return this.clone(this.env);if("evtParams"===e)return Object.assign({},this[e]);if(this.env.hasOwnProperty(e))return this.clone(this.env[e]);if(this.env.user.hasOwnProperty(e))return this.clone(this.env.user[e]);if(this.env.header.hasOwnProperty(e))return this.clone(this.env.header[e]);if(this.env.header.custom.hasOwnProperty(e))return this.clone(this.env.header.custom[e])}},{key:"compose",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=this.env,i=n.user,r=n.header,o=this.evtParams,s=e.map((function(e){return e.event&&!t.includes(e.event)&&o&&Object.keys(o).forEach((function(t){void 0===e.params[t]&&(e.params[t]=o[t])})),e.params=JSON.stringify(e.params),e}));return this.clone({events:s,user:i,header:r})}},{key:"merge",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=this.compose(e,t);return n.local_time=Math.floor(S()/1e3),[n]}},{key:"clone",value:function(e){if(w(e))return JSON.parse(JSON.stringify(e));return e}}]),t}(),I=function(){function t(){e(this,t),this.domains=g,this.init()}return n(t,[{key:"init",value:function(){this.option={caller:"",log:!1,channel:y,report_channel:y,channel_domain:"",report_url:"",auto_report:false,auto_profile:false,profile_channel:"cn",enable_profile:false,enable_ab_test:false,ab_channel_domain:"",clear_ab_cache_on_user_change:true,enable_et_test:false,event_verify_url:"",enable_buffer:false,buffer_interval:5e3,buffer_number:5,enable_storage_only:false,enable_filter_list:false,enable_third:false,enable_filter_crawler:false,request_timeout:0,enable_initiative_launch:false,enable_custom_webid:false,disable_sdk_monitor:false},this.cloneOption=Object.assign({},this.option),this.initDomain()}},{key:"initDomain",value:function(){if(this.option.channel_domain)return this.domain=this.option.channel_domain,void 0;var e=this.option.report_channel;Object.keys(this.domains).includes(e)||(e=y),this.domain=this.domains[e]}},{key:"set",value:function(e){var t=this;if(!w(e))return;Object.keys(e).forEach((function(n){t.option.hasOwnProperty(n)&&("channel"===n||"report_channel"===n?(t.option.report_channel=t.option.channel=e[n]?e[n]:t.cloneOption[n],t.initDomain()):(t.option[n]=void 0===e[n]?t.cloneOption[n]:e[n],"channel_domain"===n&&t.initDomain()))}))}},{key:"get",value:function(e){if(e){if(this.hasOwnProperty(e))return this[e];if(this.option.hasOwnProperty(e))return this.option[e];return}return Object.assign({},this.option)}}]),t}(),C=function(){function t(){e(this,t),this.hooks={}}return n(t,[{key:"on",value:function(e,t){if(!e||!t||"function"!=typeof t)return;this.hooks[e]||(this.hooks[e]=[]),this.hooks[e].push(t)}},{key:"once",value:function(e,t){var n=this;if(!e||!t||"function"!=typeof t)return;this.on(e,(function i(r){t(r),n.off(e,i)}))}},{key:"off",value:function(e,t){if(!e||!this.hooks[e]||!this.hooks[e].length)return;if(t){var n=this.hooks[e].indexOf(t);-1!==n&&this.hooks[e].splice(n,1)}else this.hooks[e]=[]}},{key:"emit",value:function(e,t){if(!e||!this.hooks[e]||!this.hooks[e].length)return;h(this.hooks[e]).forEach((function(e){try{e(t)}catch(e){}}))}}]),t}(),x=function(){function t(n){e(this,t),this.ready=!1,this.sdk=n}return n(t,[{key:"setLog",value:function(e){e&&O(e.log)&&(this._log=e)}},{key:"setRequest",value:function(e){if(O(e)){var t=e(this.sdk);O(t)&&(this._request=t)}}},{key:"setStorage",value:function(e){w(e)&&O(e.get)&&O(e.set)&&O(e.remove)&&(this._storage=e)}},{key:"check",value:function(){if(!this._request||!this._storage)return;this.ready=!0}},{key:"log",value:function(){if(!this._log)return;try{var e;this.sdk.option.get("log")&&(e=this._log).log.apply(e,arguments)}catch(e){}}},{key:"request",value:function(e){var t;if(!this.ready)return Promise.reject();try{return null===(t=this._request)||void 0===t?void 0:t.call(this,e)}catch(e){}}},{key:"get",value:function(e){if(!this.ready)return Promise.reject(null);return this._storage.get(e)}},{key:"set",value:function(e,t){if(!this.ready)return Promise.reject(!1);return this._storage.set(e,t)}},{key:"remove",value:function(e){if(!this.ready)return Promise.reject(!1);return this._storage.remove(e)}}]),t}();!function(e){e.Init="$init",e.Config="$config",e.Send="$send",e.Ready="$ready",e.TokenComplete="$token-complete",e.TokenStorage="$token-storage",e.TokenFetch="$token-fetch",e.TokenGet="$token-get",e.LaunchComplete="$launch-complete",e.ConfigUuid="$config-uuid",e.ConfigWebId="$config-webid",e.ConfigTransform="$config-transform",e.UuidChangeBefore="$uuid-change-before",e.UuidChangeAfter="$uuid-change-after",e.EnvTransform="$env-transform",e.Event="$event",e.Report="$report",e.AppOpen="$app-open",e.AppClose="$app-close",e.AppShowStart="$app-show-start",e.AppShow="$app-show",e.AppHide="$app-hide",e.AppError="$app-error",e.AppShare="$app-share",e.AppOnShare="$app-on-share",e.PageShow="$page-show",e.PageHide="$page-hide",e.PageShare="$page-share",e.SubmitBefore="$submit-before",e.SubmitAfter="$submit-after",e.SubmitError="$submit-error",e.FilterCrawler="$filter-crawler",e.LaunchInfo="$launch-info",e.AbVar="$ab-var",e.AbAllVars="$ab-all-vars",e.AbExternalVersion="$ab-external-version",e.AbVersionChangeOn="$ab-version-change-on",e.AbVersionChangeOff="$ab-version-change-off",e.AbRefresh="$ab-refresh",e.AbFetchAfter="$ab-fetch-After",e.ProfileSet="$profile-set",e.ProfileSetOnce="$profile-set-once",e.ProfileUnset="$profile-unset",e.ProfileIncrement="$profile-increment",e.ProfileAppend="$profile-append",e.ProfileClear="$profile-clear",e.ProfileSubmitAfter="$profile-submit-after",e.ProfileSubmitError="$profile-submit-error",e.TransformInfo="$transform-info",e.ExtendAppLaunch="$extend-app-launch",e.ExtendAppTerminate="$extend-app-terminate",e.ExtendAppError="$extend-app-error",e.ExtendPageShow="$extend-page-show",e.ExtendPageHide="$extend-page-hide",e.ExtendPageShare="$extend-page-share",e.ExtendPageFavorite="$extend-page-favorite"}(v||(v={}));var j=v,E=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}))},U=function(){function t(){e(this,t),this.types=j,this.EventType=k,this.ProfileType=b,this.UtmType=_,this.SdkHook=j,this.inited=!1,this.sended=!1,this.pluginInstances=[],this.data=new Map,this.ready=!1,this.sessionId="",this.env=new A(this),this.option=new I,this.hook=new C,t.instances.push(this);try{this.adapter=new x(this),this.adapter.setLog(t._log),this.adapter.setRequest(t._request),this.adapter.setStorage(t._storage),this.adapter.check(),t.plugins.reduce((function(e,t){var n=t.plugin;return e.push(new n),e}),this.pluginInstances)}catch(e){}}return n(t,[{key:"on",value:function(e,t){var n;null===(n=this.hook)||void 0===n?void 0:n.on(e,t)}},{key:"once",value:function(e,t){var n;null===(n=this.hook)||void 0===n?void 0:n.once(e,t)}},{key:"off",value:function(e,t){var n;if(!t&&this.types[e])return;null===(n=this.hook)||void 0===n?void 0:n.off(e,t)}},{key:"emit",value:function(e,t){var n;this.adapter.log("emit ".concat(e),t||""),null===(n=this.hook)||void 0===n||n.emit(e,t)}},{key:"appId",get:function(){return this._appId}},{key:"checkUsePlugin",value:function(e){return!!t.plugins.find((function(t){return t.name===e}))}},{key:"init",value:function(e){var t=this;if(this.inited||!w(e))return;var n=e.app_id,i=e.log,r=d(e,["app_id","log"]);if(void 0!==i&&this.option.set({log:i}),!(P(n)&&n>0))return this.adapter.log("app_id invalid"),void 0;this._appId=n,this.option.set(r),this.env.set({app_id:n}),Promise.all([new Promise((function(e){t.once(j.TokenComplete,(function(){e(!0)}))})),new Promise((function(e){t.checkUsePlugin("official:auto")?t.on(j.LaunchComplete,(function(){e(!0)})):e(!0)})),new Promise((function(e){t.sended?e(!0):t.once(j.Send,(function(){e(!0)}))}))]).then((function(){t.ready=!0,t.emit(j.Ready)}));var o=this.option.get();if(this.pluginInstances.forEach((function(e){e.apply(t,o)})),this.get("is-crawler"))return;this.inited=!0,this.emit(j.Init),this.sessionId=E(),this.on(j.AppShowStart,(function(){t.sessionId=E()}))}},{key:"config",value:function(e){if(!this.inited||!w(e))return;this.emit(j.Config,e);var t=e.web_id,n=e.user_unique_id,i=d(e,["web_id","user_unique_id"]);void 0!==t&&this.emit(j.ConfigWebId,t),void 0!==n&&this.emit(j.ConfigUuid,n),this.env.set(i)}},{key:"send",value:function(){if(!this.inited||this.sended)return;this.sended=!0,this.emit(j.Send)}},{key:"event",value:function(e,t){var n=this;if(this.get("is-crawler"))return;if(Array.isArray(e)){var i=S(),r=[];e.forEach((function(e){var t,o,s;if(Array.isArray(e)){var a=f(e,3);t=a[0],o=a[1],s=a[2]}else w(e)&&(t=e.event,o=e.params,s=e.local_time_ms);if(!t)return;(!P(s)||s<0||s>i)&&(s=i),r.push(n.createEvent({event:t,params:o,time:s}))})),r.length>0&&this.emit(j.Event,r)}else this.emit(j.Event,this.createEvent({event:e,params:t}))}},{key:"createEvent",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=Object.assign({event:e.event,params:e.params||{},local_time_ms:e.time||S()},this.sessionId?{session_id:this.sessionId}:{});if(!t)return n;var i="",r=this.get("ab_sdk_version");r&&(i+=r);var o=this.get("ab_sdk_version_external");return o&&(i?i+=","+o:i=o),Object.assign(Object.assign({},n),i?{ab_sdk_version:i}:{})}},{key:"set",value:function(e,t){this.data.set(e,t)}},{key:"get",value:function(e){return this.data.get(e)}},{key:"getKey",value:function(e){var t=this.appId;if("ab_version"===e||"ab_version_external"===e)return"__tea_sdk_".concat(e,"_").concat(t);var n={token:"tokens",report:"reports",event:"events",utm:"utm",first:"first",compensate:"compensate"};return n[e]?"__tea_cache_".concat(n[e],"_").concat(t):void 0}},{key:"getUrl",value:function(e){var t=this.option,n=this.env,i=n.get("_sdk_version"),r=(n.get("_sdk_name")||"").replace(/@.+\//,""),o="".concat(t.get("domain")).concat(e,"?sdk_version=").concat(i,"&sdk_name=").concat(r),s=t.get("caller");if(s)return"".concat(o,"&app_id=").concat(this.appId,"&caller=").concat(s);return o}},{key:"getToken",value:function(e){var t=this;if(e)return this.emit(j.TokenGet,{callback:e}),void 0;return new Promise((function(e){t.emit(j.TokenGet,{callback:function(t){e(t)}})}))}},{key:"getConfig",value:function(e){return this.env.get(e||"header")}},{key:"stash",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n="stash";this.set(n,[].concat(h(this.get(n)||[]),[this.createEvent({event:e,params:t})]))}},{key:"commit",value:function(){var e="stash",t=this.get(e)||[];t.length>0&&(this.event(t),this.set(e,[]))}},{key:"getVar",value:function(e,t,n){var i=this;if(n)return this.emit(j.AbVar,{name:e,defaultValue:t,callback:n}),void 0;return new Promise((function(n){i.emit(j.AbVar,{name:e,defaultValue:t,callback:function(e){n(e)}})}))}},{key:"getAllVars",value:function(e){var t=this;if(e)return this.emit(j.AbAllVars,e),void 0;return new Promise((function(e){t.emit(j.AbAllVars,(function(t){e(t)}))}))}},{key:"getAbSdkVersion",value:function(){var e=this.get("ab_versions")||[];return e.length>0?e[e.length-1].ab:""}},{key:"onAbSdkVersionChange",value:function(e){var t=this;return this.emit(j.AbVersionChangeOn,e),function(){t.emit(j.AbVersionChangeOff,e)}}},{key:"offAbSdkVersionChange",value:function(e){this.emit(j.AbVersionChangeOff,e)}},{key:"setExternalAbVersion",value:function(e){this.emit(j.AbExternalVersion,"string"==typeof e&&e?"".concat(e).trim():null)}},{key:"getAbConfig",value:function(e,t){var n=this;if(t)return this.emit(j.AbRefresh,{params:e,callback:t}),void 0;return new Promise((function(t){n.emit(j.AbRefresh,{params:e,callback:function(e){t(e)}})}))}},{key:"profileSet",value:function(e){this.emit(j.ProfileSet,e)}},{key:"profileSetOnce",value:function(e){this.emit(j.ProfileSetOnce,e)}},{key:"profileUnset",value:function(e){this.emit(j.ProfileUnset,e)}},{key:"profileIncrement",value:function(e){this.emit(j.ProfileIncrement,e)}},{key:"profileAppend",value:function(e){this.emit(j.ProfileAppend,e)}},{key:"autoInitializationRangers",value:function(e){var t=e.onTokenReady,n=d(e,["onTokenReady"]);return this.init(Object.assign(Object.assign({},n),{log:!1,enable_third:!0})),this.send(),this.getToken().then((function(e){var n=e.web_id;try{if("function"==typeof t)return t("".concat(n)),void 0}catch(e){}return"".concat(n)}))}}],[{key:"useAdapterLog",value:function(e){t._log=e}},{key:"useAdapterRequest",value:function(e){t._request=e}},{key:"useAdapterStorage",value:function(e){t._storage=e}},{key:"usePlugin",value:function(e,n){var i=n||e.pluginName;if(i){for(var r=!1,o=0,s=t.plugins.length;o<s;o++){if(t.plugins[o].name===i){t.plugins[o].plugin=e,r=!0;break}}r||t.plugins.push({name:i,plugin:e})}else t.plugins.push({plugin:e});if("function"==typeof e.init)try{e.init(t)}catch(e){}}}]),t}();U.plugins=[],U.instances=[];var $,q="2.1.2",T=function(){function t(){e(this,t)}return n(t,[{key:"apply",value:function(e,t){e.env.set({sdk_version:q,_sdk_version:q,_sdk_name:"@datarangers/sdk-mp"})}}]),t}();T.pluginName="official:info",function(e){e.Default="default",e.Custom="custom"}($||($={}));var R=function(){function t(n,i){e(this,t),this.wrap=n,this.sdk=i,this.url="/webid/"}return n(t,[{key:"storageNoData",value:function(){this.fetch()}},{key:"storageHasData",value:function(e){return this.wrap.dataComplete(e)}},{key:"fetch",value:function(){var e=this,t=this.sdk,n=t.adapter,i=t.appId;n.request({url:this.sdk.getUrl("".concat(this.url)),method:"POST",data:{app_id:i,url:"-",user_agent:"-",referer:"-",user_unique_id:""}}).then((function(t){try{var i=t.data,r=(i=void 0===i?{}:i).e,o=void 0===r?-1e4:r,s=i.web_id,a=void 0===s?"":s;if(0===o)return e.fetchComplete(a),void 0;n.log("parse web_id error",o)}catch(e){n.log("parse web_id error",e)}e.fetchComplete()})).catch((function(t){e.fetchComplete(),n.log("fetch web_id error",t)}))}},{key:"fetchComplete",value:function(e){if(!e)return;this.wrap.webIdComplete(e)}},{key:"storageComplete",value:function(e){if(!e)return this.storageNoData(),void 0;try{if(e[this.wrap.typeKey]===$.Default){var t=this.storageHasData(e);this.wrap.complete(t)}else this.storageNoData()}catch(e){}}}]),t}(),N=function(){function t(n,i){var r=this;e(this,t),this.wrap=n,this.sdk=i,this.sdk.on(this.sdk.types.ConfigWebId,(function(e){e="".concat(e),r.wrap.tokenComplete?r.waitComplete(e):r.waitResolve?r.waitResolve(e):r.tmpWebId=e}))}return n(t,[{key:"storageNoData",value:function(){this.wait()}},{key:"storageHasData",value:function(e){return this.wrap.dataComplete(e,this.tmpWebId)}},{key:"wait",value:function(){var e=this;new Promise((function(t){void 0!==e.tmpWebId?(t(e.tmpWebId),e.tmpWebId=void 0):e.waitResolve=t})).then((function(t){e.waitComplete(t)}))}},{key:"waitComplete",value:function(e){this.wrap.webIdComplete(e)}},{key:"storageComplete",value:function(e){if(!e)return this.storageNoData(),void 0;try{if(e[this.wrap.typeKey]===$.Custom){var t=this.storageHasData(e);this.wrap.complete(t)}else this.storageNoData()}catch(e){}}}]),t}(),D=function(){function t(){e(this,t),this.tokenComplete=!1,this.tobid="",this.tobidUrl="/tobid/",this.tobidKey="",this.isCustom=!1,this.typeKey="_type_"}return n(t,[{key:"apply",value:function(e,t){var n=this;this.sdk=e,this.options=t,this.key=this.sdk.getKey("token"),this.tobidKey="diss".split("").reverse().join(""),this.options.enable_custom_webid?(this.isCustom=!0,this.token=new N(this,this.sdk)):(this.isCustom=!1,this.token=new R(this,this.sdk));var i=this.sdk.types;this.sdk.on(i.ConfigUuid,(function(e){n.setUserUniqueId(e)})),this.sdk.on(i.TokenGet,(function(e){var t=e.callback,r=function(){n.fetchTobid().then((function(){var e=n.sdk.env.get("user"),i=Object.assign(Object.assign({},e),{web_id:n.webId,user_unique_id:n.userUniqueId});i[n.tobidKey]=n.tobid,"function"==typeof t&&t(i)}))};n.sdk.ready?r():n.sdk.once(i.Ready,(function(){r()}))})),this.storage()}},{key:"storage",value:function(){var e=this,t=this.sdk.adapter;t.get(this.key).then((function(n){if(!w(n)||!n.web_id)return e.storageComplete(null),void 0;n[e.typeKey]&&!n[e.tobidKey]&&n.user_unique_id||(n={web_id:n.web_id,user_unique_id:n.user_unique_id||n.web_id},t.set(e.key,n)),e.storageComplete(n)})).catch((function(n){e.storageComplete(null),t.log("get token error",n)}))}},{key:"storageComplete",value:function(e){this.token.storageComplete(e)}},{key:"dataComplete",value:function(e,t){var n=e.web_id;void 0!==t&&t!==n&&(n=t),this.webId=n;var i=e.web_id===e.user_unique_id?n:e.user_unique_id;return void 0!==this.tmpUserUniqueId&&this.tmpUserUniqueId!==i&&(i=this.tmpUserUniqueId?this.tmpUserUniqueId:n,this.tmpUserUniqueId=void 0),this.userUniqueId=i,n!==e.web_id||i!==e.user_unique_id}},{key:"webIdComplete",value:function(e){this.webId=e,this.tmpUserUniqueId?(this.userUniqueId=this.tmpUserUniqueId,this.tmpUserUniqueId=void 0):this.userUniqueId=e,this.complete(!0)}},{key:"complete",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=this.sdk.types,n={web_id:this.webId,user_unique_id:this.userUniqueId};this.sdk.env.set(n),n[this.typeKey]=this.isCustom?$.Custom:$.Default,e&&this.sdk.adapter.set(this.key,n),this.tokenComplete=!0,this.sdk.emit(t.TokenComplete)}},{key:"setUserUniqueId",value:function(e){var t,n,i,r=this.sdk,o=r.adapter,s=r.env,a=r.types;if(this.tokenComplete){if(this.userUniqueId===e)return;this.sdk.emit(a.UuidChangeBefore),this.userUniqueId=e||this.webId,s.set({user_unique_id:this.userUniqueId});var u=(t={web_id:this.webId,user_unique_id:this.userUniqueId},n=this.typeKey,i=this.isCustom?$.Custom:$.Default,n in t?Object.defineProperty(t,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[n]=i,t);o.set(this.key,u),this.sdk.emit(a.UuidChangeAfter)}else this.tmpUserUniqueId=e}},{key:"fetchTobid",value:function(){var e=this,t=this.sdk,n=t.adapter,i=t.appId;return n.request({url:this.sdk.getUrl("".concat(this.tobidUrl)),method:"POST",data:{app_id:i,web_id:this.webId,user_unique_id:this.userUniqueId}}).then((function(t){try{var n=t.data,i=(n=void 0===n?{}:n).e,r=void 0===i?-1e4:i,o=n.tobid,s=void 0===o?"":o;if(0===r)return e.tobid=s,void 0}catch(e){}})).catch((function(e){n.log("fetch tobid error",e)}))}}]),t}();D.pluginName="official:token";var V=function(){function t(){e(this,t),this.url="/list/",this.cache=[]}return n(t,[{key:"apply",value:function(e,t){var n=this;this.sdk=e,this.options=t,this.key=this.sdk.getKey("report"),this.reportUrl=this.sdk.getUrl("".concat(this.url)),this.sdk.set("report_url",this.reportUrl);var i=this.sdk.types;this.sdk.on(i.Report,(function(e){if(Array.isArray(e)||(e=[e]),!n.sdk.ready)return e.forEach((function(e){return n.cache.push(e)})),void 0;n.report(e)})),this.sdk.on(i.Ready,(function(){n.cache.length>0&&(n.report(h(n.cache)),n.cache.length=0)}));var r=this.sdk.adapter;this.sdk.on(i.AppOpen,(function(){r.get(n.key).then((function(){}))})),this.sdk.on(i.AppClose,(function(){n.cache.length>0&&(r.set(n.key,h(n.cache)),n.cache.length=0)}))}},{key:"report",value:function(e){this.submit(e)}},{key:"submit",value:function(e){var t=this,n=this.sdk.types;this.sdk.emit(n.SubmitBefore,e),this.sdk.adapter.request({url:this.reportUrl,method:"POST",data:e}).then((function(i){t.sdk.emit(n.SubmitAfter,{isError:!1,response:i,event:e})})).catch((function(i){t.sdk.emit(n.SubmitAfter,{isError:!0,error:i,event:e}),t.sdk.emit(n.SubmitError,{event:e})}))}}]),t}();V.pluginName="official:report";var W=function(){function t(){e(this,t),this.buffer=[],this.timer=0,this.unReadyCache=[]}return n(t,[{key:"apply",value:function(e,t){var n,i,r=this;this.sdk=e,this.options=t,this.enable=!!this.options.enable_buffer;var o=!0===this.options.enable_storage||!1===this.options.disable_storage;if(o&&(this.enable=!0),this.enable){this.interval=this.options.buffer_interval,this.number=this.options.buffer_number,o&&((null===(n=this.options)||void 0===n?void 0:n.report_interval)>0&&(this.interval=this.options.report_interval),(null===(i=this.options)||void 0===i?void 0:i.max_batch_event)>0&&(this.number=this.options.max_batch_event));try{this.interval=Number(this.interval),this.number=Number(this.number)}catch(e){}}this.sdk.set("enable_storage",this.enable);var s=this.sdk.types;this.sdk.on(s.Event,(function(e){if(!r.sdk.ready)return r.unReadyCache=[].concat(h(r.unReadyCache),h(Array.isArray(e)?e:[e])),void 0;r.process(Array.isArray(e)?e:[e])})),this.sdk.on(s.Ready,(function(){r.unReadyCache.length>0&&(r.process(r.unReadyCache),r.unReadyCache=[])})),this.sdk.on(s.AppClose,(function(){r.buffer.length>0&&(r.report(r.buffer),r.buffer.length=0)}))}},{key:"process",value:function(e){var t=this.sdk.env.compose(e);if(!this.enable)return this.report(t),void 0;this.buffer=[].concat(h(this.buffer),[t]),this.refresh()}},{key:"refresh",value:function(){var e=this;this.timer&&clearTimeout(this.timer),this.buffer.length>=this.number?(this.report(h(this.buffer)),this.buffer.length=0):this.timer=setTimeout((function(){e.report(h(e.buffer)),e.buffer.length=0}),this.interval)}},{key:"report",value:function(e){this.sdk.emit(this.sdk.types.Report,e)}}]),t}();W.pluginName="official:buffer";var H=function(){function t(){e(this,t)}return n(t,[{key:"apply",value:function(e,t){var n=this;this.sdk=e,this.options=t;var i=this.sdk,r=i.types,o=i.env,s=function(){try{var e=(new Date).getTimezoneOffset();return{timezone:Math.floor(Math.abs(e)/60),offset:60*e}}catch(e){return{timezone:8,offset:-28800}}}();o.set({timezone:s.timezone,tz_offset:s.offset}),this.sdk.on(r.ConfigTransform,(function(e){if(void 0!==e.gender&&([1,2,"1","2"].includes(e.gender)?e.gender=e.gender<2?"male":"female":delete e.gender),!!n.options.enable_profile){var t={};["nick_name","gender","avatar_url"].forEach((function(n){void 0!==e[n]&&(t[n]=e[n],delete e[n])})),n.sdk.emit(r.ProfileSet,t)}})),this.sdk.on(r.EnvTransform,(function(e){if(!!n.options.enable_profile){var t={};["$mp_from_uuid"].forEach((function(n){void 0!==e[n]&&(t[n]=e[n],delete e[n])})),Object.keys(t).length>0&&n.sdk.emit(r.ProfileSetOnce,t)}}))}}]),t}();H.pluginName="official:transform";var K=function(){function t(){e(this,t),this.url="/profile/list",this.lastId=0,this.lastOnceId=0,this.duration=6e4,this.cache={},this.buffer=[]}return n(t,[{key:"apply",value:function(e,t){var n=this;this.sdk=e,this.options=t;var i=this.sdk.types;this.sdk.on(i.ProfileSet,(function(e){n.check()&&n.setProfile(e)})),this.sdk.on(i.ProfileSetOnce,(function(e){n.check()&&n.setOnceProfile(e)})),this.sdk.on(i.ProfileUnset,(function(e){n.check()&&n.unsetProfile(e)})),this.sdk.on(i.ProfileIncrement,(function(e){n.check()&&n.incrementProfile(e)})),this.sdk.on(i.ProfileAppend,(function(e){n.check()&&n.appendProfile(e)})),this.sdk.on(i.ProfileClear,(function(){n.cache={}})),this.sdk.on(i.Ready,(function(){if(!n.buffer.length)return;n.reportMore(h(n.buffer)),n.buffer=[]}))}},{key:"check",value:function(){return!!this.options.enable_profile}},{key:"setProfile",value:function(e){var t=this,n=this.debounce(e);if(!n)return;this.putCache(n);var i=this.filter(n,(function(e){return t.isString(e)||t.isNumber(e)||t.isArray(e)}));this.report(this.sdk.createEvent({event:"__profile_set",params:i}))}},{key:"setOnceProfile",value:function(e){var t=this,n=this.debounce(e,!0);if(!n)return;this.putCache(n);var i=this.filter(n,(function(e){return t.isString(e)||t.isNumber(e)||t.isArray(e)}));this.report(this.sdk.createEvent({event:"__profile_set_once",params:i}))}},{key:"incrementProfile",value:function(e){var t=this;if(!e)return;var n=this.filter(e,(function(e){return t.isNumber(e)}));this.report(this.sdk.createEvent({event:"__profile_increment",params:n}))}},{key:"unsetProfile",value:function(e){if(!e||!this.isString(e))return;var t={};t[e]="1",this.report(this.sdk.createEvent({event:"__profile_unset",params:t}))}},{key:"appendProfile",value:function(e){var t=this;if(!e||!this.isObject(e)||this.isEmpty(e))return;var n=this.filter(e,(function(e){return t.isString(e)||t.isArray(e)}));this.report(this.sdk.createEvent({event:"__profile_append",params:n}))}},{key:"reportMore",value:function(e){var t=this;if(this.sdk.ready){var n=this.sdk.env.merge(e,this.sdk.ProfileType),i=this.sdk,r=i.adapter,o=i.option;r.request({url:"".concat(o.get("domain")).concat(this.url),method:"POST",data:n}).then((function(e){t.sdk.emit(t.sdk.types.ProfileSubmitAfter,{isError:!0,response:e,event:n})})).catch((function(e){t.sdk.emit(t.sdk.types.ProfileSubmitError,{isError:!0,error:e,event:n})}))}else e.forEach((function(e){t.buffer.push(e)}))}},{key:"report",value:function(e){this.reportMore([e])}},{key:"ms",value:function(){return S()}},{key:"debounce",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!e||!this.isObject(e)||this.isEmpty(e))return;var i=Object.keys(e),r=this.ms(),o=i.filter((function(i){var o=t.cache[i];if(o&&(n||t.compare(o.val,e[i])&&r-o.timestamp<t.duration))return!1;return!0})).reduce((function(t,n){return t[n]=e[n],t}),{});if(!(i=Object.keys(o)).length)return;return o}},{key:"putCache",value:function(e){var t=this,n=this.ms();Object.keys(e).forEach((function(i){t.cache[i]={val:t.clone(e[i]),timestamp:n}}))}},{key:"clone",value:function(e){try{return JSON.parse(JSON.stringify(e))}catch(t){return e}}},{key:"compare",value:function(e,t){return JSON.stringify(e)===JSON.stringify(t)}},{key:"filter",value:function(e,t){return Object.keys(e).reduce((function(n,i){var r=e[i];return t(r)&&(n[i]=r),n}),{})}},{key:"isObject",value:function(e){return w(e)}},{key:"isArray",value:function(e){return function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===Object.prototype.toString.call(e)}(e)}},{key:"isNumber",value:function(e){return P(e)}},{key:"isString",value:function(e){return function(e){return"string"==typeof e}(e)}},{key:"isEmpty",value:function(e){return!Object.keys(e).length}}]),t}();function L(e){for(var t=0,n=0,i=(e+="").length,r=0;r<i;r++)((t=31*t+e.charCodeAt(n++))>0x7fffffffffff||t<-0x800000000000)&&(t&=0xffffffffffff);return t<0&&(t+=0x7ffffffffffff),t}K.pluginName="official:profile";U.usePlugin(T),U.usePlugin(D),U.usePlugin(V),U.usePlugin(W),U.usePlugin(H),U.usePlugin(K);var M=function(t){i(o,t);var r=a(o);function o(){return e(this,o),r.apply(this,arguments)}return n(o,[{key:"appLaunch",value:function(){this.appShow()}},{key:"appTerminate",value:function(){this.appHide()}},{key:"appShow",value:function(){var e;void 0!==this.target.getLaunchOptionsSync&&(e=this.target.getLaunchOptionsSync()),this.emit(this.types.AppShow,e)}},{key:"appHide",value:function(){this.emit(this.types.AppHide)}},{key:"appError",value:function(e){this.emit(this.types.AppError,e)}},{key:"predefinePageview",value:function(){this.emit(this.types.PageShow)}},{key:"predefinePageviewHide",value:function(){this.emit(this.types.PageHide)}},{key:"shareAppMessage",value:function(e){try{var t=this.pluginInstances.find((function(e){return"official:auto"===e.constructor.pluginName}));if(t&&"function"==typeof t.pageShare)return t.pageShare(e)}catch(e){}return e}},{key:"setWebIDviaUnionID",value:function(e){if(!e||!this.option.get("enable_custom_webid"))return;var t=L(String(e).trim());this.config({web_id:t,wechat_unionid:e})}},{key:"setWebIDviaOpenID",value:function(e){if(!e||!this.option.get("enable_custom_webid"))return;var t=L(String(e).trim());this.config({web_id:t,wechat_openid:e})}},{key:"createWebViewUrl",value:function(e){if(!e||!this.ready)return e;var t=this.env.get("web_id");if(!t)return e;return this.processWebViewUrl(e,t)}},{key:"createWebViewUrlAsync",value:function(e){var t=this;if(!e)return Promise.resolve(e);return this.ready?Promise.resolve(this.processWebViewUrl(e,this.env.get("web_id"))):new Promise((function(n){t.on(t.types.Ready,(function(){n(t.processWebViewUrl(e,t.env.get("web_id")))}))}))}},{key:"processWebViewUrl",value:function(e,t){e=function(e){var t=e;try{t=decodeURIComponent(e)}catch(e){}return t}(e);var n=/([^?#]+)(\?[^#]*)?(#.*)?/.exec(e),i=n[1]||"",r=n[2]||"",o=n[3]||"",s=r?function(e){var t={};return e&&e.split("&").forEach((function(e){if(e){var n=e.split("=");n[0]&&(t[n[0]]=n[1]||"")}})),t}(r.substring(1)):{};return s.Web_ID=t,e=i+function(e,t){var n=e;if(t){var i=[];Object.keys(t).forEach((function(e){i.push("".concat(e,"=").concat(t[e]))})),i.length>0&&(n+="?".concat(i.join("&")))}return n}("",s)+o,e}}]),o}(U),z=console,B=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return function(n){return function(i){var r=i.timeout||n.option.get("request_timeout"),o="number"==typeof r&&r>0;return new Promise((function(n,s){var a=e.request(Object.assign(Object.assign(Object.assign({},i),o&&!t?{timeout:r}:{}),{dataType:i.dataType||"json",success:function(e){n(e)},fail:function(e){s(e)}}));o&&t&&setTimeout((function(){try{a&&a.abort()}catch(e){}}),r)}))}}}(swan,!0),J=new(function(){function t(n){e(this,t),this.target=n}return n(t,[{key:"get",value:function(e){var t=this;return new Promise((function(n,i){try{n(t.target.getStorageSync(e))}catch(e){i(e)}}))}},{key:"set",value:function(e,t){var n=this;return new Promise((function(i,r){try{n.target.setStorageSync(e,t),i(!0)}catch(e){r(!1)}}))}},{key:"remove",value:function(e){var t=this;return new Promise((function(n,i){try{t.target.removeStorageSync(e),n(!0)}catch(e){i(!1)}}))}}]),t}())(swan),F=function(){function t(){e(this,t)}return n(t,[{key:"apply",value:function(e,t){var n=this;this.sdk=e,this.options=t,this.boost();var i=this.sdk.types;this.getInfo(),this.sdk.on(i.AppOpen,(function(){n.getInfo()}))}},{key:"boost",value:function(){}},{key:"getInfo",value:function(){var e=this,t=this.sdk,n=t.target,i=t.env;n&&(n.getSystemInfo&&n.getSystemInfo({success:function(t){var n={device_brand:t.brand,device_model:t.model,os_version:t.system,os_name:t.platform,platform:t.platform,resolution:"".concat(t.screenWidth,"x").concat(t.screenHeight),screen_width:t.screenWidth,screen_height:t.screenHeight};e.overlap(t,n),i.set(n)}}),n.getNetworkType&&n.getNetworkType({success:function(e){var t={access:e.networkType};i.set(t)}}))}},{key:"overlap",value:function(e,t){t.language=e.language,t.mp_platform_app_version=e.version,t.mp_platform_basic_version=e.SDKVersion}}]),t}();F.pluginName="official:device";var G=function(t){i(s,t);var o=a(s);function s(){return e(this,s),o.apply(this,arguments)}return n(s,[{key:"boost",value:function(){c(r(s.prototype),"boost",this).call(this),this.sdk.target=swan,this.sdk.targetEnvConfig=null,this.sdk.env.set({sdk_lib:"mp_common",custom_platform:"swanMiniProduct",mp_platform:5})}},{key:"overlap",value:function(e,t){c(r(s.prototype),"overlap",this).call(this,e,t)}}],[{key:"init",value:function(e){e.platform=swan}}]),s}(F);return M.useAdapterLog(z),M.useAdapterRequest(B),M.useAdapterStorage(J),M.usePlugin(G),M}));
