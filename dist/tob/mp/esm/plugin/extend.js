const e="mp_launch",t="mp_enter",s="mp_exit",a="purchase",n="query",i="update_level",c="create_gamerole",o="check_out",u="add_to_favourite";let d;const p={mpLaunch:(t,s)=>{t(e,Object.assign({},s))},mpEnter:(e,s)=>{d=+new Date,e(t,Object.assign({},s))},mpExit:(e,t={})=>{const a=getCurrentPages(),n=a[a.length-1].route,i=void 0===d?0:+new Date-d;e(s,Object.assign({duration:i,page_path:n},t)),d=void 0},purchase:(e,t)=>{e(a,Object.assign({},t))},quest:(e,t)=>{e(n,Object.assign({},t))},updateLevel:(e,t)=>{e(i,Object.assign({},t))},createGameRole:(e,t)=>{e(c,Object.assign({},t))},checkout:(e,t)=>{e(o,Object.assign({},t))},addToFavourite:(e,t)=>{e(u,Object.assign({},t))}};class r{apply(e,t){this.sdk=e,this.options=t,Object.keys(p).forEach((e=>{this.sdk[e]=p[e].bind(null,this.sdk.event.bind(this.sdk))}))}}r.pluginName="official:extend";export{r as default};
