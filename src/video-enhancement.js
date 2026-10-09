(function(){
  function posterFor(text){
    text=String(text||'').toLowerCase();
    if(text.indexOf('adeniyi')>-1)return '/assets/adeniyi-olajide-temitope.jpg?v=2';
    if(text.indexOf('mary')>-1||text.indexOf('abosede')>-1)return '/assets/mary-olaoye-abosede.jpg';
    return '';
  }
  function enhance(){
    document.querySelectorAll('video').forEach(function(v){
      if(v.getAttribute('preload')!=='none')v.setAttribute('preload','none');
      
      if(!v.getAttribute('poster')){
        var card=v.closest('article')||v.closest('[class*="video-card"]');
        var p=posterFor(card?card.textContent:'');
        if(p)v.setAttribute('poster',p);
      }
    });
  }
  function jump(){
    var r=document.querySelector('.bridge-result-card,[class*="result-card"]');
    if(r)r.scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('button'):null;
    if(b&&b.closest('.bridge-search-hints')){setTimeout(jump,50);setTimeout(jump,350);}
  },true);
  enhance();
  document.addEventListener('DOMContentLoaded',enhance);
  new MutationObserver(enhance).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['preload','poster']});
  setInterval(enhance,800);
})();