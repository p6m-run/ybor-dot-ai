(function(){
var M=window.yborMotion||{later:function(f,t){return setTimeout(f,t);}};
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var TERM=[
 ['c','archetect render python-fastapi-service --name orders-api'],
 ['o','<span class="d">  fetching ybor-studio/archetypes/python-fastapi-service@2.0.1</span>'],
 ['o','<span class="ok">✓</span> generated 19 files · .github/workflows · app · deploy/platform-application.yaml'],
 ['c','cd orders-api && git push -u origin main'],
 ['o','<span class="ok">✓</span> CI  test · build · sign · scan        <span class="d">2m 14s</span>'],
 ['c','kubectl get platformapplication orders-api -n demo-org-orders-api-dev'],
 ['o','<span class="k">NAME         ENV   VERSION   HEALTH    SYNC</span>\norders-api   dev   v1.0.0    <span class="ok">Healthy</span>   <span class="ok">Synced</span>']];
function runTerm(el){var t=0,i=0,timers=[];el.innerHTML='';
 function step(){if(i>=TERM.length){timers.push(M.later(function(){runTerm(el);},4200));return;}
  var L=TERM[i++],line=document.createElement('div');el.appendChild(line);
  if(L[0]==='o'){line.innerHTML=L[1];timers.push(M.later(step,500));return;}
  line.innerHTML='<span class="p">$</span> <span class="tx"></span>';var tx=line.querySelector('.tx'),k=0;
  (function ty(){if(k<=L[1].length){tx.textContent=L[1].slice(0,k++);timers.push(M.later(ty,28));}else timers.push(M.later(step,450));})();}
 if(rm){el.innerHTML=TERM.map(function(L){return L[0]==='c'?'<div><span class="p">$</span> '+L[1]+'</div>':'<div>'+L[1]+'</div>';}).join('');return;}
 step();}
function runIde(el){var adds=el.querySelectorAll('.add'),toast=el.querySelectorAll('.md-toast');
 adds.forEach(function(a){a.classList.remove('in');});toast.forEach(function(x){x.classList.remove('in');});
 if(rm){adds.forEach(function(a){a.classList.add('in');});toast[toast.length-1].classList.add('in');return;}
 adds.forEach(function(a,i){M.later(function(){a.classList.add('in');},700+i*500);});
 var t=700+adds.length*500+600;
 M.later(function(){toast[0].classList.add('in');},t);
 M.later(function(){toast[0].classList.remove('in');toast[1].classList.add('in');},t+2200);
 M.later(function(){runIde(el);},t+6000);}
function init(){
 var root=document.querySelector('[data-modes]');if(!root)return;
 var started={};
 function start(k){if(started[k])return;started[k]=1;var p=root.querySelector('.md-panel[data-k="'+k+'"]');var tm=p.querySelector('.md-term');if(tm)runTerm(tm);var ide=p.querySelector('.md-ide');if(ide)runIde(ide);}
 root.querySelectorAll('.md-tab').forEach(function(b){b.addEventListener('click',function(){root.querySelectorAll('.md-tab').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b);});root.querySelectorAll('.md-panel').forEach(function(p){p.classList.toggle('on',p.dataset.k===b.dataset.k);});start(b.dataset.k);window.dispatchEvent(new Event('resize'));});});
 new IntersectionObserver(function(e){if(e[0].isIntersecting){var on=root.querySelector('.md-tab.on');on&&start(on.dataset.k);}},{threshold:.2}).observe(root);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
