/* Встраивание мастер-виджета «3D-витрина терминалов» (3d/terminals/) на страницы сайта.
   Разметка: <section class="tw" data-terminals data-model="orion5">…запасной блок с фото…</section>
   Виджет один — все страницы показывают одну и ту же копию, обновления видны везде сразу. */
(function(){
var SRC=(document.currentScript&&document.currentScript.dataset.src)||'3d/terminals/index.html';
var css='.tw{position:relative;background:radial-gradient(ellipse 60% 65% at 50% 45%,#e3e6ea 0%,#c9ced4 75%);background-color:#c9ced4;overflow:hidden}'+
'.tw iframe{display:block;width:100%;height:min(900px,calc(100svh / var(--z,1)));min-height:640px;border:0;background:transparent}'+
'.tw .of{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:48px;align-items:center;padding:80px 0}'+
'.tw .of img{width:100%;max-width:640px;margin:0 auto;mix-blend-mode:multiply}.tw .of h2{margin:10px 0 16px}.tw .of p.t-sub{color:#3a434e}'+
'.tw:not(.fb) .of-wrap{display:none}.tw.fb iframe{display:none}'+
'@media(max-width:760px){.tw iframe{height:600px;min-height:0}.tw .of{grid-template-columns:1fr;padding:56px 0;gap:24px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var gl=false;try{var cv=document.createElement('canvas');gl=!!(cv.getContext('webgl2')||cv.getContext('webgl'))}catch(e){}
document.querySelectorAll('[data-terminals]').forEach(function(s){
  s.classList.add('tw');
  if(!gl||location.protocol==='file:'){s.classList.add('fb');return}
  var f=document.createElement('iframe');f.title='3D-витрина терминалов ИнтеллектКАЗС';f.allow='fullscreen';
  s.insertBefore(f,s.firstChild);
  var ok=false,tm=0,started=false;
  function fb(){if(!ok)s.classList.add('fb')}
  addEventListener('message',function(e){if(e.source!==f.contentWindow||!e.data)return;
    if(e.data.orion==='ok'){ok=true;clearTimeout(tm)}else if(e.data.orion==='err'&&!ok)fb()});
  new IntersectionObserver(function(en){var v=en[0].isIntersecting;
    if(v&&!started){started=true;f.src=SRC+'?embed=site'+(s.dataset.model?'#'+s.dataset.model:'');tm=setTimeout(fb,45000)}
    if(started&&f.contentWindow)f.contentWindow.postMessage({orion:v?'play':'pause'},'*')},{rootMargin:'600px 0px'}).observe(s);
});
})();
