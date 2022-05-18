const t=()=>+new Date,s={cn:"https://abtest.volceapplog.com",va:"https://toblog.itobsnssdk.com",sg:"https://toblog.tobsnssdk.com"};class e{constructor(){this.expire=2592e6,this.domains=s,this.url="/service/2/abtest_config/",this.message={cb:"回调函数必须为一个函数",var:"变量名不能为空",value:"变量没有默认值"},this.fetchStatus=0,this.callbacks=[],this.data=null,this.versions=[],this.externalVersions=null,this.hasOn=!1,this.onHandler=()=>{},this.changeListener=new Map,this.exposureName="abtest_exposure",this.clear=!1}apply(s,e){this.sdk=s,this.options=e;const{adapter:i,types:a,appId:n}=this.sdk;if(this.appId=n,this.externalKey=this.sdk.getKey("ab_version_external"),this.sdk.on(a.AbExternalVersion,(t=>{this.processExternal(t);const{adapter:s}=this.sdk;t?s.set(this.externalKey,t):s.remove(this.externalKey)})),i.get(this.externalKey).then((t=>{if(!t)return;try{this.processExternal(t)}catch(t){}})),!this.options.enable_ab_test)return;this.dataKey=this.sdk.getKey("ab_version"),this.clear=this.options.clear_ab_cache_on_user_change,this.domain=this.getDomain(),this.sdk.on(a.UuidChangeAfter,(()=>{if(!this.sdk.ready)return;this.clear&&(this.versions=[],this.data={},this.updateVersions(),this.emitChange())})),this.sdk.once(a.Ready,(()=>{this.preFetch(),this.sdk.on(a.UuidChangeAfter,(()=>{this.preFetch()}))})),this.sdk.on(a.AbVar,(({name:t,defaultValue:s,callback:e})=>{this.getVar(t,s,e)})),this.sdk.on(a.AbAllVars,(t=>{this.getAllVars(t)})),this.sdk.on(a.AbVersionChangeOn,(t=>{this.changeListener.set(t,t)})),this.sdk.on(a.AbVersionChangeOff,(t=>{this.changeListener.get(t)&&this.changeListener.delete(t)})),this.sdk.on(a.AbRefresh,(({params:t,callback:s})=>{this.preFetch(t,s)})),i.get(this.dataKey).then((s=>{if(!s)return;const e=s.timestamp;if(t()-e>=this.expire)return this.sdk.adapter.remove(this.dataKey),void 0;try{const{ab_version:t,data:e}=s;2!==this.fetchStatus&&(this.versions=t||[],this.data=e,this.configVersions())}catch(t){}}))}output(t){this.sdk.adapter.log(t)}processExternal(t){this.externalVersions=t,this.sdk.set("ab_sdk_version_external",t)}getAllVars(t){if("function"!=typeof t)return this.output(this.message.cb);const s={callback:t,type:1};2===this.fetchStatus?this._getAllVars(s):this.callbacks.push(s)}getVar(t,s,e){if(!t)return this.output(this.message.var);if(void 0===s)return this.output(this.message.value);if("function"!=typeof e)return this.output(this.message.cb);const i={name:t,defaultValue:s,callback:t=>{try{e(t)}catch(t){}},type:0};2===this.fetchStatus?this._getVar(i):this.callbacks.push(i)}fetchComplete(t){if(t){this.data=t;const s=[];Object.keys(t).forEach((e=>{const{vid:i}=t[e];i&&s.push(i)}));const e=this.versions.length;e?(this.versions=this.versions.filter((t=>s.includes(t))),this.versions.length!==e&&this.updateVersions()):this.updateVersions()}this.callbacks.forEach((t=>this[0===t.type?"_getVar":"_getAllVars"](t))),this.callbacks=[]}_getAllVars(t){const{callback:s}=t;s(this.data?JSON.parse(JSON.stringify(this.data)):{})}_getVar(t){const{name:s,defaultValue:e,callback:i}=t,{data:a}=this;if(!a)return i(e),void 0;if(null!=(n=a[s])&&"[object Object]"==Object.prototype.toString.call(n)){const{vid:t,val:e}=a[s];return t&&(this.versions.includes(t)||(this.versions.push(t),this.updateVersions(),this.emitChange()),this.sdk.emit(this.sdk.types.Event,Object.assign(Object.assign({},this.sdk.createEvent({event:this.exposureName},!1)),{ab_sdk_version:t}))),i(e),void 0}var n;i(e)}updateVersions(){this.configVersions(),this.sdk.adapter.set(this.dataKey,{data:this.data,ab_version:this.versions,timestamp:t()})}configVersions(){const s=this.versions.join(",");this.sdk.set("ab_sdk_version",s);const e="ab_versions";this.sdk.set(e,[...this.sdk.get(e)||[],{time:t(),ab:s}])}emitChange(){const t=this.versions.join(",");this.changeListener.size>0&&this.changeListener.forEach((s=>{"function"==typeof s&&setTimeout((()=>{try{s(t)}catch(t){}}),0)}))}getDomain(){var t;const{channel_domain:s,ab_channel_domain:e}=this.options,{option:i}=this.sdk,a=null===(t=i.get("cloneOption"))||void 0===t?void 0:t.report_channel;let n="";if(e)n=e;else if(s)n=s;else{let{report_channel:t}=this.options;Object.keys(this.domains).includes(t)||(t=a),n=this.domains[t]}return n}preFetch(t={},s){if(!this.domain)return this.fetchStatus=2,this.fetchComplete(null),s&&s(null),void 0;const{env:e}=this.sdk,{user:i,header:a}=e.get(),{headers:n}=a,h=function(t,s){var e={};for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&s.indexOf(i)<0&&(e[i]=t[i]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(i=Object.getOwnPropertySymbols(t);a<i.length;a++)s.indexOf(i[a])<0&&Object.prototype.propertyIsEnumerable.call(t,i[a])&&(e[i[a]]=t[i[a]])}return e}(a,["headers"]);this.user=Object.assign({},i),this.fetch(Object.assign(Object.assign(Object.assign({},h),n),t||{})).then((t=>s&&s(t)))}fetch(t){this.fetchStatus=1;const{user_unique_id:s}=this.user;return this.sdk.adapter.request({url:`${this.domain}${this.url}`,method:"POST",data:{header:Object.assign(Object.assign({aid:this.appId},this.user||{}),t||{})}}).then((t=>{var e;if(this.user.user_unique_id!==s)return null;this.fetchStatus=2;const i=null===(e=null==t?void 0:t.data)||void 0===e?void 0:e.data;return this.sdk.emit(this.sdk.types.AbFetchAfter,i),this.fetchComplete(i),i})).catch((()=>(this.fetchStatus=2,this.fetchComplete(null),null)))}}e.pluginName="official:ab";export{s as DOMAINS,e as default};
