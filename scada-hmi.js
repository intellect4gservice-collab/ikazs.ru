(function(){
var CSS=`
.hmi-wrap{margin-top:36px}
.hmi-mon{background:linear-gradient(170deg,#191c24,#0b0d13);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:12px;box-shadow:0 50px 110px rgba(4,8,18,.6)}
.hmi-scr{background:#080a10;border:1px solid rgba(255,255,255,.08);border-radius:10px;overflow:hidden}
.hmi-bar{display:flex;align-items:center;gap:14px;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03)}
.hmi-bar .bc{font-family:var(--font-mono);font-size:11px;letter-spacing:.5px;color:rgba(245,245,247,.42);text-transform:uppercase}
.hmi-bar .bc b{color:rgba(245,245,247,.86);font-weight:600}
.hmi-bar .sp{margin-left:auto;display:flex;gap:14px;align-items:center;font-family:var(--font-mono);font-size:11px;color:rgba(245,245,247,.45)}
.hmi-bar .live{display:flex;align-items:center;gap:6px;color:#7bffe4}
.hmi-bar .live i{width:7px;height:7px;border-radius:50%;background:#25d6c0;box-shadow:0 0 9px rgba(37,214,192,.8);animation:hmiPulse 1.6s infinite}
@keyframes hmiPulse{50%{opacity:.32}}
.hmi-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.09);overflow-x:auto;scrollbar-width:none}
.hmi-tabs::-webkit-scrollbar{display:none}
.hmi-tabs button{flex:none;border:none;background:transparent;font:inherit;font-size:12.5px;font-family:var(--font-mono);letter-spacing:.3px;color:rgba(245,245,247,.5);padding:12px 18px;cursor:pointer;position:relative;transition:color .3s,background .3s;white-space:nowrap}
.hmi-tabs button:hover{color:rgba(245,245,247,.9);background:rgba(255,255,255,.04)}
.hmi-tabs button.on{color:#fff;background:rgba(41,151,255,.13)}
.hmi-tabs button.on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:linear-gradient(90deg,#2997ff,#25d6c0)}
.hmi-page{display:none;padding:14px;gap:12px}
.hmi-page.on{display:grid}
.hmi-p1{grid-template-columns:repeat(12,1fr);grid-auto-rows:minmax(0,auto)}
.w{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:12px 13px;min-width:0}
.w>h6{margin:0 0 10px;font-family:var(--font-mono);font-size:10px;letter-spacing:.7px;text-transform:uppercase;color:rgba(245,245,247,.42);font-weight:500;display:flex;align-items:center;gap:8px}
.w>h6 em{font-style:normal;margin-left:auto;color:rgba(245,245,247,.3)}
.gau{display:flex;gap:10px;justify-content:space-around;align-items:flex-start;flex-wrap:wrap}
.gau>div{text-align:center;min-width:74px}
.gau svg{display:block;margin:0 auto}
.gau .gv{font-family:var(--font-mono);font-size:17px;font-weight:600;fill:#fff}
.gau .gu{font-family:var(--font-mono);font-size:8px;fill:rgba(245,245,247,.5)}
.gau .gl{font-family:var(--font-mono);font-size:9.5px;letter-spacing:.3px;color:rgba(245,245,247,.5);margin-top:5px;line-height:1.35}
.lanes{display:grid;gap:9px}
.lane{display:grid;grid-template-columns:82px 1fr 62px;gap:9px;align-items:center}
.lane .ln{font-family:var(--font-mono);font-size:10.5px;color:rgba(245,245,247,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lane .lt{height:9px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden;position:relative}
.lane .lt i{position:absolute;inset:0 auto 0 0;border-radius:3px;transition:width .9s cubic-bezier(.22,1,.36,1)}
.lane .lv{font-family:var(--font-mono);font-size:10.5px;text-align:right;color:#fff}
.lane.warn .lv{color:#ffc447}
.lane.bad .lv{color:#ff6b6b}
.don{display:flex;align-items:center;gap:14px}
.don-leg{display:grid;gap:6px;font-family:var(--font-mono);font-size:10px;color:rgba(245,245,247,.6)}
.don-leg div{display:flex;align-items:center;gap:7px}
.don-leg i{width:8px;height:8px;border-radius:2px;flex:none}
.don-leg b{color:#fff;margin-left:auto;padding-left:8px}
.tr{position:relative}
.tr svg{display:block;width:100%;height:auto;overflow:visible}
.trleg{display:flex;gap:14px;margin-top:8px;font-family:var(--font-mono);font-size:10px;color:rgba(245,245,247,.55);flex-wrap:wrap}
.trleg span{display:flex;align-items:center;gap:6px}
.trleg i{width:14px;height:2px;flex:none}
.alog{display:grid;gap:1px;background:rgba(255,255,255,.07);border-radius:5px;overflow:hidden;max-height:186px;overflow-y:auto}
.alog>div{background:rgba(8,10,16,.9);display:grid;grid-template-columns:60px 1fr 74px;gap:9px;padding:7px 10px;font-family:var(--font-mono);font-size:10.5px;color:rgba(245,245,247,.65);align-items:center;animation:hmiIn .45s cubic-bezier(.22,1,.36,1)}
@keyframes hmiIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
.alog .t{color:rgba(245,245,247,.4)}
.alog .s{text-align:right;font-size:9.5px;letter-spacing:.4px;text-transform:uppercase}
.alog .warn .s{color:#ffc447}
.alog .err .s{color:#ff6b6b}
.alog .ok .s{color:#25d6c0}
.alog .warn{border-left:2px solid #ffc447}
.alog .err{border-left:2px solid #ff6b6b}
.alog .ok{border-left:2px solid #25d6c0}
.kpit{display:grid;gap:9px}
.kpit>div{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,.07)}
.kpit>div:last-child{border:none;padding:0}
.kpit .k{font-family:var(--font-mono);font-size:10.5px;color:rgba(245,245,247,.5)}
.kpit .v{font-family:var(--font-mono);font-size:14.5px;font-weight:600;color:#fff}
.pumps{display:grid;gap:9px}
.pump{border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:10px 11px;display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;transition:border-color .4s,background .4s}
.pump .ico{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);display:grid;place-items:center;font-family:var(--font-mono);font-size:9px;color:rgba(245,245,247,.6)}
.pump.run{border-color:rgba(37,214,192,.45);background:rgba(37,214,192,.07)}
.pump.run .ico{border-color:#25d6c0;color:#7bffe4;animation:hmiSpin 2.4s linear infinite}
@keyframes hmiSpin{to{transform:rotate(360deg)}}
.pump.err{border-color:rgba(255,107,107,.5);background:rgba(255,107,107,.08)}
.pump.err .ico{border-color:#ff6b6b;color:#ff9d9d}
.pump .nm{display:block;font-family:var(--font-mono);font-size:11.5px;color:#fff}
.pump .sub{display:block;font-family:var(--font-mono);font-size:9.5px;color:rgba(245,245,247,.45);margin-top:3px}
.pump .rt{text-align:right;font-family:var(--font-mono);font-size:12.5px;color:#fff}
.pump .rt em{display:block;font-style:normal;font-size:9px;color:rgba(245,245,247,.4);margin-top:3px}
.posts{display:grid;gap:9px}
.post{border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:11px}
.post .ph{display:flex;align-items:center;gap:9px;font-family:var(--font-mono);font-size:11px;color:#fff}
.post .ph em{font-style:normal;margin-left:auto;font-size:9.5px;color:rgba(245,245,247,.45)}
.post .pbar{height:7px;border-radius:3px;background:rgba(255,255,255,.08);margin:9px 0 7px;overflow:hidden}
.post .pbar i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#2997ff,#25d6c0);transition:width .8s cubic-bezier(.22,1,.36,1)}
.post .pf{display:flex;gap:12px;font-family:var(--font-mono);font-size:9.5px;color:rgba(245,245,247,.5);flex-wrap:wrap}
.post .pf b{color:#fff;font-weight:500}
.chk{display:flex;align-items:center;gap:5px}
.chk i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2)}
.chk.on i{background:#25d6c0;box-shadow:0 0 7px rgba(37,214,192,.7)}
.chk.no i{background:#ff6b6b;box-shadow:0 0 7px rgba(255,107,107,.7)}
.bars{display:flex;align-items:flex-end;gap:7px;height:112px}
.bars>div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;height:100%}
.bars i{width:100%;border-radius:3px 3px 0 0;transition:height .9s cubic-bezier(.22,1,.36,1)}
.bars span{font-family:var(--font-mono);font-size:9px;color:rgba(245,245,247,.45)}
.hmi-foot{display:flex;align-items:center;gap:12px;padding:9px 16px;border-top:1px solid rgba(255,255,255,.09);font-family:var(--font-mono);font-size:10px;letter-spacing:.4px;color:rgba(245,245,247,.35);text-transform:uppercase;flex-wrap:wrap}
.hmi-foot .rt{margin-left:auto}
.hmi-note{margin-top:16px;font-size:13.5px;line-height:1.6;color:rgba(245,245,247,.5);max-width:88ch}
.sp3{grid-column:span 3}.sp4{grid-column:span 4}.sp5{grid-column:span 5}.sp6{grid-column:span 6}.sp7{grid-column:span 7}.sp8{grid-column:span 8}.sp9{grid-column:span 9}.sp12{grid-column:span 12}
@media(max-width:1080px){.hmi-p1{grid-template-columns:repeat(6,1fr)}.sp3,.sp4{grid-column:span 3}.sp5,.sp6,.sp7,.sp8,.sp9,.sp12{grid-column:span 6}}
@media(max-width:640px){.hmi-p1{grid-template-columns:1fr}.sp3,.sp4,.sp5,.sp6,.sp7,.sp8,.sp9,.sp12{grid-column:span 1}.lane{grid-template-columns:70px 1fr 56px}}
`;
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

var mount=document.getElementById('hmi');if(!mount)return;
var C={blue:'#2997ff',teal:'#25d6c0',mint:'#7bffe4',amber:'#ffc447',red:'#ff6b6b',violet:'#a78bfa'};
function rnd(a,b){return a+Math.random()*(b-a)}
function fmt(n,d){return n.toLocaleString('ru-RU',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}

/* ---------- widgets ---------- */
function gauge(id,label,unit,min,max,col){
  return '<div><svg viewBox="0 0 84 84" width="84" height="84">'+
    '<circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="7"></circle>'+
    '<circle id="'+id+'-arc" cx="42" cy="42" r="34" fill="none" stroke="'+col+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="213.6" transform="rotate(-90 42 42)" style="transition:stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)"></circle>'+
    '<text id="'+id+'-v" class="gv" x="42" y="43" text-anchor="middle">—</text>'+
    '<text class="gu" x="42" y="55" text-anchor="middle">'+unit+'</text></svg>'+
    '<div class="gl">'+label+'</div></div>';
}
function setGauge(id,v,min,max,dec){
  var a=document.getElementById(id+'-arc'),t=document.getElementById(id+'-v');if(!a)return;
  var p=Math.max(0,Math.min(1,(v-min)/(max-min)));
  a.setAttribute('stroke-dashoffset',(213.6*(1-p)).toFixed(1));
  t.textContent=v.toFixed(dec||0).replace('.',',');
}
function lanes(id,rows){
  return '<div class="lanes" id="'+id+'">'+rows.map(function(r){
    return '<div class="lane"><span class="ln">'+r.n+'</span><span class="lt"><i style="background:'+r.c+'"></i></span><span class="lv">—</span></div>';
  }).join('')+'</div>';
}
function setLanes(id,rows){
  var box=document.getElementById(id);if(!box)return;
  [].forEach.call(box.children,function(el,i){
    var r=rows[i];if(!r)return;
    el.querySelector('i').style.width=Math.max(1,Math.min(100,r.p))+'%';
    el.querySelector('.lv').textContent=r.t;
    el.className='lane'+(r.s?' '+r.s:'');
  });
}
function donut(id,segs){
  var R=30,CIRC=2*Math.PI*R,off=0;
  var s=segs.map(function(g){var len=CIRC*g.v/100,el='<circle cx="40" cy="40" r="'+R+'" fill="none" stroke="'+g.c+'" stroke-width="11" stroke-dasharray="'+len.toFixed(1)+' '+(CIRC-len).toFixed(1)+'" stroke-dashoffset="'+(-off).toFixed(1)+'" transform="rotate(-90 40 40)"></circle>';off+=len;return el}).join('');
  return '<div class="don"><svg viewBox="0 0 80 80" width="98" height="98">'+s+
    '<text x="40" y="38" text-anchor="middle" style="font-family:var(--font-mono);font-size:14px;font-weight:600;fill:#fff" id="'+id+'-c">'+segs[0].v+'</text>'+
    '<text x="40" y="49" text-anchor="middle" style="font-family:var(--font-mono);font-size:7px;fill:rgba(245,245,247,.5)">'+(segs[0].u||'%')+'</text></svg>'+
    '<div class="don-leg">'+segs.map(function(g){return '<div><i style="background:'+g.c+'"></i>'+g.n+'<b>'+g.v+'%</b></div>'}).join('')+'</div></div>';
}
function trend(id,series,h){
  h=h||120;
  return '<div class="tr"><svg id="'+id+'" viewBox="0 0 420 '+h+'" preserveAspectRatio="none" style="height:'+h+'px">'+
    '<g stroke="rgba(255,255,255,.07)">'+[0,.25,.5,.75,1].map(function(k){var y=(h-14)*k+7;return '<line x1="0" y1="'+y+'" x2="420" y2="'+y+'"></line>'}).join('')+'</g>'+
    series.map(function(s,i){return '<polyline id="'+id+'-p'+i+'" fill="none" stroke="'+s.c+'" stroke-width="1.6" stroke-linejoin="round" points=""></polyline>'}).join('')+
    '</svg><div class="trleg">'+series.map(function(s){return '<span><i style="background:'+s.c+'"></i>'+s.n+'</span>'}).join('')+'</div></div>';
}
function setTrend(id,series,h){
  h=h||120;
  series.forEach(function(s,i){
    var el=document.getElementById(id+'-p'+i);if(!el)return;
    var d=s.d,n=d.length,mn=s.min,mx=s.max;
    var pts=d.map(function(v,k){var x=420*k/(n-1),y=(h-14)*(1-(v-mn)/(mx-mn))+7;return x.toFixed(1)+','+y.toFixed(1)}).join(' ');
    el.setAttribute('points',pts);
  });
}
function push(arr,v,min,max){arr.push(Math.max(min,Math.min(max,v)));if(arr.length>60)arr.shift()}
function seed(n,f){var a=[];for(var i=0;i<n;i++)a.push(f(i));return a}

/* ---------- state ---------- */
var S={
  tT:[11.4,11.5,11.3],pIn:2.4,pOut:5.8,q:42,gas:2,
  tanks:[{n:'РВС-1 · АИ-95',c:C.blue,p:62,v:618400},{n:'РВС-2 · ДТ',c:C.amber,p:48,v:482600},{n:'РВС-3 · мазут',c:C.violet,p:29,v:96800,s:'warn'},{n:'РВС-4 · ДТ зим.',c:C.amber,p:74,v:742100}],
  pumps:[{n:'Н-1 · приём',sub:'ЧРП 0 Гц · маршрут не задан',st:'',q:0,mh:3820},{n:'Н-2 · отпуск',sub:'ЧРП 44 Гц · РВС-2 → пост 3',st:'run',q:42,mh:4180},{n:'Н-3 · внутр. перекачка',sub:'резерв · готов к пуску',st:'',q:0,mh:2410},{n:'Н-4 · зачистной',sub:'отказ пускателя · выведен',st:'err',q:0,mh:5960}],
  posts:[{n:'Пост 1 · АИ-95',dose:24000,done:24000,st:'завершён',gnd:1,ovf:1},{n:'Пост 2 · ДТ',dose:28000,done:16240,st:'налив',gnd:1,ovf:1},{n:'Пост 3 · ДТ',dose:32000,done:4180,st:'налив',gnd:1,ovf:1},{n:'Пост 4 · мазут',dose:0,done:0,st:'нет связи',gnd:0,ovf:0}],
  trLvl:seed(60,function(i){return 480+Math.sin(i/7)*14+Math.random()*6}),
  trQ:seed(60,function(i){return 38+Math.sin(i/5)*7+Math.random()*3}),
  trP:seed(60,function(i){return 5.6+Math.sin(i/9)*.5+Math.random()*.2}),
  trT:seed(60,function(i){return 11.2+Math.sin(i/11)*.7+Math.random()*.2}),
  shipped:184260,avail:97,
  alarms:[
    {t:'09:41:12',m:'РВС-3 · мазут: остаток ниже неснижаемого (96 800 л)',s:'ПРЕДУПР',c:'warn'},
    {t:'09:38:04',m:'Пост 4 налива: нет связи с контроллером поста',s:'ОТКАЗ',c:'err'},
    {t:'09:22:47',m:'Н-4 зачистной: отказ пускателя, агрегат выведен',s:'ОТКАЗ',c:'err'},
    {t:'09:05:30',m:'РВС-2 · приём завершён, партия закрыта: +118 400 л',s:'НОРМА',c:'ok'},
    {t:'08:52:16',m:'Обогрев РВС-3: температура ниже уставки 42 °C',s:'ПРЕДУПР',c:'warn'},
    {t:'08:31:02',m:'Задвижка ЗД-4: маршрут «РВС-2 → пост 3» подтверждён',s:'НОРМА',c:'ok'}
  ]
};

/* ---------- markup ---------- */
var P1='<div class="hmi-page hmi-p1 on" data-hp="0">'+
  '<div class="w sp5"><h6>Резервуарный парк · заполнение<em>уровнемеры · 5 с</em></h6>'+lanes('lnTanks',S.tanks)+
    '<div style="margin-top:12px">'+donut('donStock',[{n:'ДТ',v:54,c:C.amber},{n:'АИ-95',v:29,c:C.blue},{n:'Мазут',v:17,c:C.violet}])+'</div></div>'+
  '<div class="w sp3"><h6>Температура продукта<em>°C</em></h6><div class="gau">'+gauge('gT1','РВС-1<br>АИ-95','°C',-10,40,C.blue)+gauge('gT2','РВС-2<br>ДТ','°C',-10,40,C.amber)+gauge('gT3','РВС-3<br>мазут','°C',0,90,C.violet)+'</div></div>'+
  '<div class="w sp4"><h6>Технологические параметры</h6><div class="gau">'+gauge('gPin','Давление<br>приём','МПа',0,10,C.mint)+gauge('gPout','Давление<br>нагнетание','МПа',0,10,C.teal)+gauge('gQ','Расход<br>отгрузка','м³/ч',0,120,C.blue)+'</div>'+
    '<div class="kpit" style="margin-top:12px"><div><span class="k">Загазованность в каре</span><span class="v" id="kGas">2% НКПР</span></div><div><span class="k">Доступность оборудования</span><span class="v" id="kAv">97%</span></div><div><span class="k">Отгружено за смену</span><span class="v" id="kShip">184 260 л</span></div></div></div>'+
  '<div class="w sp8"><h6>Тренды · последние 60 минут<em>уровень РВС-2 · расход · давление</em></h6>'+trend('trMain',[{n:'Уровень РВС-2, см',c:C.amber},{n:'Расход, м³/ч',c:C.blue},{n:'Давление, МПа',c:C.mint}],150)+'</div>'+
  '<div class="w sp4"><h6>Журнал тревог<em>активные</em></h6><div class="alog" id="alog1"></div></div>'+
'</div>';

var P2='<div class="hmi-page hmi-p1" data-hp="1">'+
  '<div class="w sp5"><h6>Насосные агрегаты<em>пуск · останов · наработка</em></h6><div class="pumps" id="pumps"></div></div>'+
  '<div class="w sp3"><h6>Гидравлика линии</h6><div class="gau">'+gauge('gP2in','Вход<br>Н-2','МПа',0,10,C.mint)+gauge('gP2out','Выход<br>Н-2','МПа',0,10,C.teal)+'</div>'+
    '<div class="kpit" style="margin-top:12px"><div><span class="k">Частота ЧРП Н-2</span><span class="v" id="kHz">44 Гц</span></div><div><span class="k">Ток двигателя</span><span class="v" id="kA">38,4 А</span></div><div><span class="k">Перепад на фильтре</span><span class="v" id="kDp">0,18 МПа</span></div></div></div>'+
  '<div class="w sp4"><h6>Потребление электроэнергии<em>по агрегатам</em></h6>'+donut('donPow',[{n:'Н-2 отпуск',v:58,c:C.teal},{n:'Обогрев РВС-3',v:26,c:C.violet},{n:'Прочее',v:16,c:C.blue}])+
    '<div class="bars" id="barsPow" style="margin-top:14px"></div></div>'+
  '<div class="w sp7"><h6>Расход и давление на линии отгрузки</h6>'+trend('trPump',[{n:'Расход, м³/ч',c:C.blue},{n:'Давление нагнетания, МПа',c:C.teal}],140)+'</div>'+
  '<div class="w sp5"><h6>Ресурс и обслуживание<em>ТОиР по наработке</em></h6><div class="kpit" id="kMh"></div></div>'+
'</div>';

var P3='<div class="hmi-page hmi-p1" data-hp="2">'+
  '<div class="w sp6"><h6>Посты налива в автоцистерны<em>дозирование по объёму</em></h6><div class="posts" id="posts"></div></div>'+
  '<div class="w sp3"><h6>Узел учёта отгрузки</h6><div class="gau">'+gauge('gQm','Мгновенный<br>расход','м³/ч',0,120,C.blue)+gauge('gDens','Плотность<br>при 15 °C','кг/м³',780,900,C.amber)+'</div>'+
    '<div class="kpit" style="margin-top:12px"><div><span class="k">Отгружено за смену</span><span class="v" id="kShip2">184 260 л</span></div><div><span class="k">Приведено к 15 °C</span><span class="v" id="kShip15">183 410 л</span></div><div><span class="k">Баланс с уровнемерами</span><span class="v" id="kBal">0,08%</span></div></div></div>'+
  '<div class="w sp3"><h6>Приём с ж/д эстакады</h6><div class="kpit"><div><span class="k">Маршрут</span><span class="v">8 цистерн</span></div><div><span class="k">Слито</span><span class="v" id="kRecv">265 700 л</span></div><div><span class="k">Насос Н-1</span><span class="v" id="kN1">остановлен</span></div><div><span class="k">Температура слива</span><span class="v" id="kTr">+9,8 °C</span></div></div>'+
    '<div class="lanes" style="margin-top:12px">'+lanes('lnRecv',[{n:'Цистерна 6',c:C.teal},{n:'Цистерна 7',c:C.teal},{n:'Цистерна 8',c:C.teal}])+'</div></div>'+
  '<div class="w sp12"><h6>Отгрузка по постам за смену<em>литры</em></h6><div class="bars" id="barsShip"></div></div>'+
'</div>';

var P4='<div class="hmi-page hmi-p1" data-hp="3">'+
  '<div class="w sp8"><h6>Тренды параметров · 60 минут<em>архив хранится не менее 12 месяцев</em></h6>'+trend('trBig',[{n:'Уровень РВС-2, см',c:C.amber},{n:'Температура ДТ, °C',c:C.blue},{n:'Расход отгрузки, м³/ч',c:C.mint}],200)+'</div>'+
  '<div class="w sp4"><h6>Сводка смены</h6><div class="kpit"><div><span class="k">Операций приёма</span><span class="v">3</span></div><div><span class="k">Операций отгрузки</span><span class="v" id="kOps">17</span></div><div><span class="k">Внутренних перекачек</span><span class="v">2</span></div><div><span class="k">Тревог за смену</span><span class="v" id="kAl">6</span></div><div><span class="k">Квитировано оператором</span><span class="v" id="kAck">4</span></div><div><span class="k">Доступность системы</span><span class="v">99,7%</span></div></div>'+
    '<div class="bars" id="barsAl" style="margin-top:16px"></div></div>'+
  '<div class="w sp12"><h6>Журнал событий и тревог<em>с квитированием и выгрузкой в отчёт смены</em></h6><div class="alog" id="alog2" style="max-height:230px"></div></div>'+
'</div>';

mount.innerHTML='<div class="hmi-mon"><div class="hmi-scr">'+
  '<div class="hmi-bar"><span class="bc">АРМ диспетчера / <b>Нефтебаза «Северная» · перевалка</b></span><span class="sp"><span class="live"><i></i>онлайн</span><span id="hmiClock">—</span></span></div>'+
  '<div class="hmi-tabs" id="hmiTabs"><button class="on" data-h="0">Обзор объекта</button><button data-h="1">Насосная</button><button data-h="2">Приём и отгрузка</button><button data-h="3">Тренды и тревоги</button></div>'+
  P1+P2+P3+P4+
  '<div class="hmi-foot"><span>Опрос парка 5 с · эстакада 1 с</span><span>МастерСКАДА 4D · ПЛК Регул R500</span><span class="rt">данные условные · демонстрация интерфейса</span></div>'+
'</div></div>';

/* tabs */
var pages=[].slice.call(mount.querySelectorAll('.hmi-page'));
document.getElementById('hmiTabs').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  [].forEach.call(this.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
  pages.forEach(function(p){p.classList.toggle('on',p.dataset.hp===b.dataset.h)});
  render();
});

/* renderers */
function renderAlarms(id){
  var box=document.getElementById(id);if(!box)return;
  box.innerHTML=S.alarms.map(function(a){return '<div class="'+a.c+'"><span class="t">'+a.t+'</span><span>'+a.m+'</span><span class="s">'+a.s+'</span></div>'}).join('');
}
function renderPumps(){
  var box=document.getElementById('pumps');if(!box)return;
  box.innerHTML=S.pumps.map(function(p){
    return '<div class="pump '+p.st+'"><span class="ico">'+(p.st==='run'?'▶':p.st==='err'?'!':'■')+'</span><span><span class="nm">'+p.n+'</span><span class="sub">'+p.sub+'</span></span><span class="rt">'+(p.q?fmt(p.q)+' м³/ч':'—')+'<em>'+fmt(p.mh)+' ч наработки</em></span></div>';
  }).join('');
  var mh=document.getElementById('kMh');
  if(mh)mh.innerHTML=S.pumps.map(function(p){
    var left=Math.max(0,4500-p.mh%4500);
    return '<div><span class="k">'+p.n+'</span><span class="v" style="color:'+(left<400?'#ffc447':'#fff')+'">ТО через '+fmt(left)+' ч</span></div>';
  }).join('');
}
function renderPosts(){
  var box=document.getElementById('posts');if(!box)return;
  box.innerHTML=S.posts.map(function(p){
    var pct=p.dose?Math.round(p.done/p.dose*100):0;
    return '<div class="post"><div class="ph"><span>'+p.n+'</span><em>'+p.st+'</em></div><div class="pbar"><i style="width:'+pct+'%"></i></div>'+
      '<div class="pf"><span>доза <b>'+(p.dose?fmt(p.dose)+' л':'—')+'</b></span><span>налито <b>'+fmt(p.done)+' л</b></span>'+
      '<span class="chk '+(p.gnd?'on':'no')+'"><i></i>заземление</span><span class="chk '+(p.ovf?'on':'no')+'"><i></i>переполнение</span></div></div>';
  }).join('');
  var b=document.getElementById('barsShip');
  if(b)b.innerHTML=S.posts.map(function(p,i){
    var mx=Math.max.apply(null,S.posts.map(function(x){return x.done}))||1;
    return '<div><i style="height:'+Math.max(2,p.done/mx*100)+'%;background:'+[C.blue,C.amber,C.teal,C.violet][i]+'"></i><span>'+p.n.split(' · ')[0]+'</span></div>';
  }).join('');
}
function renderBars(){
  var b=document.getElementById('barsPow');
  if(b)b.innerHTML=[58,26,9,7].map(function(v,i){return '<div><i style="height:'+v+'%;background:'+[C.teal,C.violet,C.blue,'rgba(255,255,255,.25)'][i]+'"></i><span>'+['Н-2','обогрев','КИП','прочее'][i]+'</span></div>'}).join('');
  var a=document.getElementById('barsAl');
  if(a)a.innerHTML=[2,1,3,0,4,2,1,3].map(function(v,i){return '<div><i style="height:'+(v*22+4)+'%;background:'+(v>2?C.amber:C.teal)+'"></i><span>'+(i*3)+'ч</span></div>'}).join('');
}

function render(){
  setLanes('lnTanks',S.tanks.map(function(t){return {n:t.n,p:t.p,t:fmt(t.v)+' л',s:t.s}}));
  setGauge('gT1',S.tT[0],-10,40,1);setGauge('gT2',S.tT[1],-10,40,1);setGauge('gT3',S.tT[2]*4.6,0,90,0);
  setGauge('gPin',S.pIn,0,10,1);setGauge('gPout',S.pOut,0,10,1);setGauge('gQ',S.q,0,120,0);
  setGauge('gP2in',S.pIn,0,10,1);setGauge('gP2out',S.pOut,0,10,1);
  setGauge('gQm',S.q,0,120,0);setGauge('gDens',842,780,900,0);
  var el;
  if(el=document.getElementById('kGas'))el.textContent=S.gas.toFixed(0)+'% НКПР';
  if(el=document.getElementById('kAv'))el.textContent=S.avail+'%';
  if(el=document.getElementById('kShip'))el.textContent=fmt(S.shipped)+' л';
  if(el=document.getElementById('kShip2'))el.textContent=fmt(S.shipped)+' л';
  if(el=document.getElementById('kShip15'))el.textContent=fmt(Math.round(S.shipped*0.9954))+' л';
  if(el=document.getElementById('kHz'))el.textContent=(38+S.q/8).toFixed(0)+' Гц';
  if(el=document.getElementById('kA'))el.textContent=(30+S.q/5).toFixed(1).replace('.',',')+' А';
  if(el=document.getElementById('kDp'))el.textContent=(0.12+S.q/600).toFixed(2).replace('.',',')+' МПа';
  setTrend('trMain',[{d:S.trLvl,min:440,max:540},{d:S.trQ,min:0,max:70},{d:S.trP,min:4.5,max:7}],150);
  setTrend('trPump',[{d:S.trQ,min:0,max:70},{d:S.trP,min:4.5,max:7}],140);
  setTrend('trBig',[{d:S.trLvl,min:440,max:540},{d:S.trT,min:9,max:14},{d:S.trQ,min:0,max:70}],200);
  setLanes('lnRecv',[{n:'Цистерна 6',p:100,t:'слито'},{n:'Цистерна 7',p:100,t:'слито'},{n:'Цистерна 8',p:64,t:'64%'}]);
  renderPumps();renderPosts();renderBars();renderAlarms('alog1');renderAlarms('alog2');
}

function tick(){
  S.pIn=Math.max(1.8,Math.min(3.2,S.pIn+rnd(-.08,.08)));
  S.pOut=Math.max(5,Math.min(6.8,S.pOut+rnd(-.12,.12)));
  S.q=Math.max(34,Math.min(58,S.q+rnd(-2,2)));
  S.tT=S.tT.map(function(t){return Math.max(8,Math.min(14,t+rnd(-.08,.08)))});
  S.gas=Math.max(0,Math.min(6,S.gas+rnd(-.6,.6)));
  S.tanks[1].v-=Math.round(S.q*2.4);S.tanks[1].p=Math.max(5,S.tanks[1].v/1000000*100);
  S.shipped+=Math.round(S.q*2.4);
  S.posts[1].done=Math.min(S.posts[1].dose,S.posts[1].done+Math.round(rnd(300,700)));
  S.posts[2].done=Math.min(S.posts[2].dose,S.posts[2].done+Math.round(rnd(400,900)));
  if(S.posts[1].done>=S.posts[1].dose)S.posts[1].st='завершён';
  if(S.posts[2].done>=S.posts[2].dose)S.posts[2].st='завершён';
  push(S.trLvl,S.tanks[1].v/1000+rnd(-2,2),440,540);
  push(S.trQ,S.q,0,70);push(S.trP,S.pOut,4.5,7);push(S.trT,S.tT[1],9,14);
  if(Math.random()<0.16){
    var pool=[
      {m:'Пост 2 налива: доза выполнена, операция закрыта',s:'НОРМА',c:'ok'},
      {m:'Н-2 отпуск: расход в пределах уставки',s:'НОРМА',c:'ok'},
      {m:'РВС-2 · ДТ: остаток '+fmt(S.tanks[1].v)+' л',s:'НОРМА',c:'ok'},
      {m:'Обогрев РВС-3: выход на уставку 45 °C',s:'НОРМА',c:'ok'},
      {m:'Загазованность в каре: '+S.gas.toFixed(0)+'% НКПР',s:'ПРЕДУПР',c:'warn'},
      {m:'Задвижка ЗД-7: время хода превышено на 3 с',s:'ПРЕДУПР',c:'warn'}
    ];
    var a=pool[Math.floor(Math.random()*pool.length)];
    var d=new Date();
    S.alarms.unshift({t:d.toLocaleTimeString('ru-RU'),m:a.m,s:a.s,c:a.c});
    if(S.alarms.length>14)S.alarms.pop();
  }
  var vis=mount.getBoundingClientRect();
  if(vis.top<window.innerHeight&&vis.bottom>0)render();
}
render();setInterval(tick,2400);
setInterval(function(){var c=document.getElementById('hmiClock');if(c)c.textContent=new Date().toLocaleString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'})},1000);
})();
