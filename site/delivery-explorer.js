(function(){
var M=window.yborMotion||{later:function(f,t){return setTimeout(f,t);},clear:function(i){clearTimeout(i);}};
function init(){document.querySelectorAll('[data-dx]').forEach(setup);}
function setup(root){
 var items=[].slice.call(root.querySelectorAll('.dx-item')),panes=root.querySelectorAll('.dx-pane'),i=0,tm,vis=false,DUR=6500;
 var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function show(k,auto){i=k;items.forEach(function(b,n){b.classList.toggle('on',n===k);var bar=b.querySelector('.dx-bar i');if(bar){bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';}});
  panes.forEach(function(p,n){p.classList.remove('play');p.classList.toggle('on',n===k);});
  var p=panes[k];void p.offsetWidth;p.classList.add('play');
  M.clear(tm);var d=p.querySelector('.sf')?24000:DUR;items[k].style.setProperty('--dur',d+'ms');if(!rm)tm=M.later(function(){if(vis)show((i+1)%items.length,true);},d);}
 items.forEach(function(b,n){b.addEventListener('click',function(){show(n);});});
 root.style.setProperty('--dur',DUR+'ms');
 new IntersectionObserver(function(e){var was=vis;vis=e[0].isIntersecting;if(vis&&!was)show(i);},{threshold:.3}).observe(root);
 if(rm)panes.forEach(function(p){p.classList.add('play');});
 window.dispatchEvent(new Event('resize'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
