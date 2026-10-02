/* Личный кабинет ИнтеллектКАЗС — демо-данные и логика оболочки */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>n.toLocaleString('ru-RU');

const TANKS=[
 {f:'АИ-92',cap:10000,cur:8400,t:'+4,2 °C',d:'0,745',to:'хватит до 3 октября',s:'ok'},
 {f:'ДТ зимнее',cap:10000,cur:3100,t:'−2,8 °C',d:'0,836',to:'хватит до 24 сентября',s:'late'},
 {f:'АИ-95',cap:5000,cur:2250,t:'+3,9 °C',d:'0,751',to:'хватит до 29 сентября',s:'warn'}
];
const OBJ=[
 {id:'o1',sn:'КАЗС-20 · Карьер Северный',sa:'Оленегорск, карьер',n:'КАЗС-20 «Карьер Северный»',ad:'Мурманская обл., Оленегорск, карьер Северный',sp:['КАЗС 20 м³','двухсекционная','2 ТРК «Топаз-611»','АСУ Топаз'],st:['ok','На гарантии · 214 дн.'],lv:'АИ-92 8 400 л · ДТ 3 100 л'},
 {id:'o2',sn:'КАЗС-20 · Площадка 2',sa:'Оленегорск, промзона',n:'АЗС Оленегорск, площадка 2',ad:'Мурманская обл., Оленегорск, промзона, уч. 2',sp:['КАЗС 20 м³','двухсекционная','ТРК «Топаз-611»','навес'],st:['work','В производстве · 62 %'],lv:'Отгрузка 14.11.2026'},
 {id:'o3',sn:'КАЗС-15 · Ковдор',sa:'Ковдорский ГОК',n:'КАЗС-15 «Ковдорский ГОК»',ad:'Мурманская обл., Ковдор, промплощадка ГОК',sp:['КАЗС 15 м³','односекционная','ТРК «Шельф 200»','АСУ КМАЗС'],st:['warn','Сервисный договор до 31.12.2026'],lv:'ДТ летнее 11 900 л'}
];
const EQ=[
 ['ТРК «Топаз-611» двухрукавная','611-02','ТП611-24188','12.03.2025','ok','Гарантия до 22.04.2027'],
 ['Погружной насос Gilbarco SB-100','SB-100','GB-77412','12.03.2025','ok','Гарантия до 22.04.2027'],
 ['Уровнемер «Струна-М»','СТР-М-2','SM-31904','14.03.2025','ok','Гарантия до 22.04.2027'],
 ['Фильтр-сепаратор RT 260-30','RT260-30','RT-88120','14.03.2025','warn','Расходник, гарантия истекла'],
 ['Система управления «Топаз-АЗС»','186-01','TZ-186-4471','15.03.2025','ok','Гарантия до 22.04.2027'],
 ['Резервуар двухсекционный 20 м³','РГС-20/2','20-1184','28.02.2025','ok','Гарантия 36 мес. до 28.02.2028']
];
const TO=[
 ['ТО-1 — осмотр, протяжка, проверка герметичности','1 раз в 3 мес.','22.06.2026','22.09.2026','ok','Выполнено'],
 ['ТО-2 — замена фильтров тонкой очистки','1 раз в 6 мес.','02.04.2026','02.10.2026','work','Запланировано'],
 ['Поверка ТРК','1 раз в 12 мес.','18.05.2026','18.05.2027','mute','По графику'],
 ['Калибровка уровнемера','1 раз в 12 мес.','14.03.2026','14.03.2027','mute','По графику'],
 ['Гидроиспытание резервуара','1 раз в 5 лет','28.02.2025','28.02.2030','mute','По графику']
];
const HIST=[
 ['22.09.2026','ТО-1 выполнено','Инженер Д. Ефимов. Протяжка фланцевых соединений, проверка заземления. Замечаний нет.','ok'],
 ['08.08.2026','Заявка SR-2511 закрыта','Замена картриджа фильтра тонкой очистки. Расход: картридж RT-30, 1 шт.','ok'],
 ['19.05.2026','Поверка ТРК','Свидетельство №4471/26 от 19.05.2026, погрешность в пределах допуска.','ok'],
 ['03.02.2026','Аварийный выезд','Обрыв связи АСУ после грозы. Заменён блок питания миникомпьютера «Топаз-186».','warn'],
 ['22.04.2025','Ввод в эксплуатацию','Акт приёмки подписан, гарантия 24 мес. с 22.04.2025.','work']
];
const PASS=[['Тип','КАЗС 20 м³, контейнерная, двухсекционная'],['Объём секций','10 000 + 10 000 л'],['Заводской номер','20-1184'],['Дата изготовления','28.02.2025'],['Дата ввода в эксплуатацию','22.04.2025'],['Договор','№2025/087 от 14.01.2025'],['Гарантия','24 мес., до 22.04.2027'],['АСУ на объекте','Топаз-АЗС, Топаз-186']];
const PDOCS=[['Паспорт изделия РГС-20/2','PDF · 2,4 МБ'],['Сертификат соответствия ТР ТС 032','PDF · 810 КБ'],['Протокол гидроиспытаний №118/25','PDF · 640 КБ'],['Схема электрическая принципиальная','PDF · 1,8 МБ'],['Руководство по эксплуатации КАЗС','PDF · 5,1 МБ'],['Руководство оператора «Топаз-АЗС»','PDF · 3,3 МБ']];
const GANTT=[['Проектирование',0,10,'done'],['Закупка комплектующих',8,26,'done'],['Изготовление корпуса',24,48,'done'],['Гидроиспытания',46,54,'done'],['Покраска',52,60,'work'],['Монтаж оборудования',58,72,'plan'],['ПНР на заводе',70,78,'plan'],['Приёмка заказчиком',76,82,'wait'],['Отгрузка и доставка',82,90,'plan'],['Монтаж на площадке',88,96,'plan'],['ПНР и ввод в эксплуатацию',94,100,'plan']];

/* ── рендер ── */
function renderTanks(){
 $('#tanks').innerHTML=TANKS.map(t=>{const p=Math.round(t.cur/t.cap*100);return `<div class="lvl"><div class="top"><span>${t.f} · ${fmt(t.cap)} л</span><b>${fmt(t.cur)} л</b></div><div class="bar"><i class="${t.s}" data-w="${p}"></i></div><div class="fo">${t.to} · ${t.t} · плотность ${t.d} · свободно ${fmt(t.cap-t.cur)} л</div></div>`}).join('');
 animBars();
}
function animBars(){requestAnimationFrame(()=>$$('.bar i[data-w]').forEach(i=>i.style.width=i.dataset.w+'%'))}
function renderGantt(el,rows){
 el.innerHTML=rows.map(([n,a,b,s])=>`<div class="row"><span class="nmx">${n}</span><div class="track">${el.id==='ganttMini'?'':''}<span class="b ${s}" style="left:${a}%;width:0" data-w="${b-a}"></span><span class="today" style="left:62%"></span></div></div>`).join('');
 requestAnimationFrame(()=>$$('.b[data-w]',el).forEach(b=>b.style.width=b.dataset.w+'%'));
}
function renderObjects(){
 $('#objCards').innerHTML=OBJ.map((o,i)=>`<div class="card obj rise" style="animation-delay:${.04*i}s" data-obj="${o.id}"><div class="ph-img"><span class="tag chip ${o.st[0]}">${o.st[1]}</span>Фото объекта</div><div class="bd"><div class="nm">${o.n}</div><div class="ad">${o.ad}</div><div class="sp">${o.sp.map(s=>`<span class="spec">${s}</span>`).join('')}</div><div class="kv" style="margin-top:12px"><span class="k">${o.lv}</span><span class="v" style="color:var(--link-blue)">Открыть →</span></div></div></div>`).join('');
 $('#objTbl').innerHTML=`<thead><tr><th>Объект</th><th>Адрес</th><th>Тип</th><th>Статус</th><th>Остатки / срок</th><th></th></tr></thead><tbody>${OBJ.map(o=>`<tr data-obj="${o.id}"><td style="font-weight:600">${o.n}</td><td>${o.ad}</td><td class="w">${o.sp[0]}</td><td><span class="chip ${o.st[0]}">${o.st[1]}</span></td><td class="w">${o.lv}</td><td class="w"><button class="btn btn-sec btn-sm">Открыть</button></td></tr>`).join('')}</tbody>`;
}
function renderSubs(){
 $('#objSubs').innerHTML='<div>'+OBJ.map(o=>`<button class="sub-b" data-obj="${o.id}" data-sub="${o.id}"><span class="dt ${o.st[0]}"></span><span class="tx"><b>${o.sn}</b><span>${o.sa}</span></span></button>`).join('')+'<button class="add">+ Добавить объект</button></div>';
}
function renderPassport(){
 $('#passMain').innerHTML=PASS.map(([k,v])=>`<div class="kv"><span class="k">${k}</span><span class="v mono">${v}</span></div>`).join('');
 $('#passDocs').innerHTML=PDOCS.map(([n,m])=>`<div class="kv"><span class="k">${n}</span><span class="v"><span class="hint mono" style="margin-right:10px">${m}</span><a href="#">Скачать</a></span></div>`).join('');
 $('#eqTbl').innerHTML=`<thead><tr><th>Оборудование</th><th>Модель</th><th>Серийный номер</th><th>Установлено</th><th>Гарантия</th><th></th></tr></thead><tbody>${EQ.map(r=>`<tr><td style="font-weight:500">${r[0]}</td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td><td class="w mono">${r[3]}</td><td><span class="chip ${r[4]}">${r[5]}</span></td><td class="w"><button class="btn btn-ghost btn-sm">Заявка</button></td></tr>`).join('')}</tbody>`;
 $('#toTbl').innerHTML=`<thead><tr><th>Работа</th><th>Периодичность</th><th>Выполнено</th><th>Следующее</th><th>Статус</th></tr></thead><tbody>${TO.map(r=>`<tr><td>${r[0]}</td><td class="w hint">${r[1]}</td><td class="w mono">${r[2]}</td><td class="w mono">${r[3]}</td><td><span class="chip ${r[4]}">${r[5]}</span></td></tr>`).join('')}</tbody>`;
 $('#hist').innerHTML=HIST.map(([d,t,x,s])=>`<div style="display:grid;grid-template-columns:86px 1fr;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)"><span class="hint mono">${d}</span><div><div style="font-weight:600;font-size:13px;display:flex;align-items:center;gap:8px">${t}<span class="chip ${s} plain" style="font-weight:600">${s==='ok'?'выполнено':s==='warn'?'аварийно':'веха'}</span></div><div class="hint" style="margin-top:3px">${x}</div></div></div>`).join('');
}

/* ── заглушки разделов (фаза 2–3) ── */
const STUBS={
 production:['Производство','Диаграмма Ганта по 12 этапам, лента отчётов с фотогалереей, чек-лист готовности площадки, логистика и кнопка «Задать вопрос по этапу»','Фаза 1 · в работе'],
 docs:['Документы','Группировка по договорам, фильтры по типу и периоду, статусы ЭДО, график платежей, акт сверки и выгрузка пакета архивом','Фаза 1 · в работе'],
 service:['Сервис','Статус сервисного договора, заявки с SLA-таймером, карточка заявки с перепиской и фото, создание заявки в 3 тапа, плановое ТО','Фаза 2'],
 fuel:['Заказ топлива','Заказ бензовоза с автоподстановкой объёма до полного резервуара, автозаказ по порогу остатка, статусы и история поставок','Фаза 3'],
 reports:['Отчётность','Сводные отчёты по всем объектам: отпуск по ТРК, сменам, операторам, подразделениям и технике заказчика, приёмки с расхождениями, расход по периодам, выгрузка в Excel и рассылка по расписанию','Фаза 3'],
 shop:['Магазин ЗИП','Каталог под оборудование объекта, рекомендованный склад на год, корзина, история заказов и повтор в один клик','Фаза 2'],
 profile:['Профиль и доступы','Реквизиты компании, пользователи и роли, приглашения по email, настройка уведомлений, журнал действий','Фаза 1'],
 kb:['База знаний','Типовые неисправности, что оператор устраняет сам, инструкции и видео, поиск','Фаза 2']
};
Object.entries(STUBS).forEach(([k,[t,d,ph]])=>{
 $('#v-'+k).innerHTML=`<div class="ph"><div><h1>${t}</h1><div class="sub">${ph}</div></div></div><div class="card"><div class="empty"><div class="ico">◫</div><h4>Макет раздела в работе</h4><p>${d}.</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn btn-sec btn-sm" data-goto="svodka">Вернуться в сводку</button></div></div></div>`;
});

/* ── навигация ── */
function go(v){
 if(v==='more'){$('#side').classList.add('open');$('#scrim').classList.add('on');return}
 $$('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
 $$('.nav-b').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 $$('#mtab button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
 if(v!=='object')$$('.sub-b').forEach(b=>b.classList.remove('on'));
 if(v==='objects')$('#objTree').classList.add('open');
 $('#side').classList.remove('open');$('#scrim').classList.remove('on');
 window.scrollTo({top:0,behavior:'instant'});
 $$('#v-'+v+' .rise').forEach((e,i)=>{e.style.animation='none';e.offsetHeight;e.style.animation='';e.style.animationDelay=(i*.035)+'s'});
 animBars();
 localStorage.setItem('lk-view',v);
}
document.addEventListener('click',e=>{
 const nb=e.target.closest('[data-v]'); if(nb&&(nb.closest('.side')||nb.closest('.mtab'))){if(nb.hasAttribute('data-tree')&&$('#objTree').classList.contains('open')&&$('#v-objects').classList.contains('on')){$('#objTree').classList.remove('open');return}go(nb.dataset.v);return}
 const g=e.target.closest('[data-goto]'); if(g){go(g.dataset.goto);return}
 const o=e.target.closest('[data-obj]'); if(o){openObject(o.dataset.obj);return}
 const t=e.target.closest('.tab'); if(t){$$('.tab',t.parentElement).forEach(x=>x.classList.toggle('on',x===t));objTab(t.dataset.ot);return}
});
function openObject(id){
 const o=OBJ.find(x=>x.id===id)||OBJ[0];
 $('#obName').textContent=o.n;$('#obCrumb').textContent=o.n;$('#obAddr').textContent=o.ad+' · '+o.sp.slice(0,2).join(', ');
 $('#obChip').className='chip '+o.st[0];$('#obChip').textContent=o.st[1];
 $('#objSelV').textContent=o.n;
 $$('.tab',$('#obTabs')).forEach((x,i)=>x.classList.toggle('on',i===0));objTab('pass');
 $('#objTree').classList.add('open');
 $$('.sub-b').forEach(b=>b.classList.toggle('on',b.dataset.sub===id));
 go('object');
}
function objTab(k){
 const other=$('#ot-other'),pass=$('#ot-pass');
 if(k==='pass'){pass.style.display='';other.style.display='none';return}
 pass.style.display='none';other.style.display='';
 const map={prod:['Производство объекта','Гант по этапам, отчёты с фото, чек-лист площадки','production'],docs:['Документы объекта','Договор, спецификации, счета, УПД, акты','docs'],srv:['Сервис по объекту','Заявки, регламент ТО, история выездов','service'],tel:['Телеметрия объекта','Резервуары с уровнем, температурой и прогнозом, график уровня, отпуск по ТРК и сменам, листинг заправок, приёмки и алерты','reports'],rep:['Отчёты по объекту','Отпуск по периодам, по технике и подразделениям, выгрузка в Excel','reports']}[k];
 other.innerHTML=`<div class="card"><div class="empty"><div class="ico">◫</div><h4>${map[0]}</h4><p>${map[1]}. Раздел раскрывается на общем экране — там же фильтры и экспорт.</p><button class="btn btn-sec btn-sm" data-goto="${map[2]}">Открыть раздел</button></div></div>`;
}

/* ── роли ── */
const ROLES={rk:['Алексей Кузнецов','Руководитель','АК',{fin:1,prod:1,fuel:1,docs:1}],
 ing:['Игорь Мартынов','Главный инженер','ИМ',{fin:0,prod:1,fuel:1,docs:1}],
 buh:['Елена Соболева','Бухгалтер','ЕС',{fin:1,prod:0,fuel:0,docs:1}],
 op:['Сергей Панин','Оператор АЗС','СП',{fin:0,prod:0,fuel:1,docs:0}],
 obs:['Мария Ильина','Наблюдатель','МИ',{fin:0,prod:1,fuel:1,docs:1}]};
function setRole(r){
 const [nm,rl,ini,p]=ROLES[r];
 $('#avNm').textContent=nm;$('#avRl').textContent=rl;$('#avIni').textContent=ini;
 $$('.fin').forEach(e=>e.style.display=p.fin?'':'none');
 $$('.nav-b').forEach(b=>{const v=b.dataset.v;
  const hide=(v==='production'&&!p.prod)||(v==='docs'&&!p.docs)||(v==='fuel'&&!p.fuel)||(v==='reports'&&!p.fuel)||(v==='shop'&&r==='obs')||(v==='profile'&&(r==='op'||r==='obs'));
  b.style.display=hide?'none':''});
 const ro=r==='obs';
 $$('.btn-pri').forEach(b=>b.classList.toggle('soon',ro));
}

/* ── состояния ── */
function setState(s){
 const full=s==='full';
 $('#svFull').style.display=s==='empty'?'none':'';
 $('#svEmpty').style.display=s==='empty'?'':'none';
 $('#objCards').style.display=s==='empty'?'none':'';
 $('#objEmpty').style.display=s==='empty'?'':'none';
 $('#svOffline').style.display=s==='error'?'':'none';
 $('#tkTime').textContent=s==='error'?'данные от 14:20, связь потеряна':'обновлено 09:38';
 $('#tanks').style.opacity=s==='error'?.55:1;
 $('#svSub').textContent=s==='empty'?'Новый клиент · договор №2026/114 в работе':'Северная горнорудная компания · 3 объекта · данные на сегодня, 09:40';
}

/* ── init ── */
renderTanks();renderObjects();renderSubs();renderPassport();renderGantt($('#ganttMini'),GANTT);
$('#roleSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',e.currentTarget).forEach(x=>x.classList.toggle('on',x===b));setRole(b.dataset.role)});
$('#stateSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',e.currentTarget).forEach(x=>x.classList.toggle('on',x===b));setState(b.dataset.state);animBars()});
$('#objViewSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',e.currentTarget).forEach(x=>x.classList.toggle('on',x===b));const v=b.dataset.ov;$('#objCards').style.display=v==='cards'?'':'none';$('#objTable').style.display=v==='table'?'':'none';$('#objMap').style.display=v==='map'?'':'none'});
$('#burger').addEventListener('click',()=>{$('#side').classList.toggle('open');$('#scrim').classList.toggle('on')});
$('#scrim').addEventListener('click',()=>{$('#side').classList.remove('open');$('#scrim').classList.remove('on')});
$('#themeBtn').addEventListener('click',()=>{const d=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=d?'light':'dark';localStorage.setItem('lk-theme',d?'light':'dark')});
if(localStorage.getItem('lk-theme')==='dark')document.documentElement.dataset.theme='dark';
const saved=localStorage.getItem('lk-view');if(saved&&$('#v-'+saved))go(saved);
