(function(){
/* counters */
var cio=new IntersectionObserver(function(en){en.forEach(function(e){
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  var el=e.target,to=+el.dataset.cnt,num=el.querySelector('.num')||el,t0=null;
  function step(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/1100),v=Math.round(to*(1-Math.pow(1-p,3)));
    num.textContent=v.toLocaleString('ru-RU');if(p<1)requestAnimationFrame(step)}
  requestAnimationFrame(step);
})},{threshold:.4});
document.querySelectorAll('[data-cnt]').forEach(function(el){cio.observe(el)});

/* ---- architecture map ---- */
var ND=[
 {tag:'Офис · рабочее место',h:'«Топаз-Офис» — расчётный центр',p:'Менеджер безналичных расчётов: заполнение базы данных лимитов, справочники водителей, подразделений и контрагентов, регистрация карт, лимитные схемы, отчёты и их выгрузка.',
  l:['База карт с кодом и внешним кодом каждой','Лимиты сотрудника и подразделения','Преднастроенные отчёты и редактор форм','Выгрузка XML, Excel, Word и печать'],ports:['TCP 3050 → Firebird','TCP 4005 → сервер ключей']},
 {tag:'Офис · рабочее место',h:'«Клиент-186» — команды на синхронизацию',p:'Клиентская часть: позволяет пользователю с удалённого компьютера подавать команды серверному приложению для выполнения синхронизации базы данных. Оператору не нужен доступ к компьютеру с устройством.',
  l:['Работа по локальной сети предприятия','Запуск синхронизации вручную','Контроль результата обмена'],ports:['TCP 7410 → Сервер-186']},
 {tag:'Офис · рабочее место',h:'«Монитор ёмкостей»',p:'Приложение контроля остатков в резервуарах. Оператор видит уровень и объём продукта рядом с данными об отпуске — потребность в завозе становится видна заранее.',
  l:['Остатки по каждой ёмкости','Контроль вместе с журналом наливов','Работает в составе того же комплекса'],ports:['TCP 3050 → Firebird']},
 {tag:'Сервер',h:'СУБД «Firebird» 2.5',p:'База данных комплекса. Требуется установка на сервере и на клиентском компьютере — без неё приложения не запускаются. Именно к этой базе 1С может обращаться напрямую.',
  l:['Хранение карт, водителей, лимитов и журналов','Единая база для всех рабочих мест','Прямой доступ для 1С заказчика'],ports:['TCP 3050']},
 {tag:'Сервер',h:'«Сервер-186» — синхронизация',p:'Серверная часть: осуществляет синхронизацию базы между компьютером и устройством «Топаз-186» — считывает журнал наливов из устройства и записывает базу лимитов в устройство. Устанавливается на компьютере, к которому подключено устройство.',
  l:['Чтение журнала наливов из миникомпьютера','Запись актуальной базы лимитов в устройство','Защищён файлом лицензии с ID ключа','В файле лицензии перечислены номера миникомпьютеров'],ports:['TCP 7410','TCP 3186 · 3187 → сеть АТЗ']},
 {tag:'Сервер',h:'Сервер ключей «Guardant Net»',p:'Работает совместно с аппаратным ключом «Guardant», подключённым по USB. При их совместной работе защищённые приложения можно запускать на любом компьютере в пределах локальной сети — ключ не нужно носить между рабочими местами.',
  l:['Аппаратный ключ Guardant по USB','Нужен драйвер ключей на компьютере','Тип лицензии: онлайн или оффлайн','Лицензии на доп. миникомпьютеры и рабочие места'],ports:['TCP 4005','USB → ключ защиты']},
 {tag:'Площадка · сеть АТЗ',h:'Миникомпьютер «Топаз-186»',p:'Устройство на площадке: обслуживает прокси-карты, проверяет лимиты по локальной базе, разрешает налив и пишет журнал операций. Работает автономно — при отсутствии связи с офисом отпуск продолжается.',
  l:['Локальная база лимитов в памяти устройства','Журнал наливов с картой, временем и дозой','Несколько типов считывателей прокси-карт','Управление отпуском на АТЗ или колонке'],ports:['TCP 3186 · 3187','RS-485 · радиоканал · GSM']},
 {tag:'Площадка · сеть АТЗ',h:'Второй миникомпьютер',e:1,p:'Каждое дополнительное устройство добавляется лицензией «Обслуживание дополнительного миникомпьютера» и вносится в файл лицензии сервера. Так сеть АТЗ расширяется без замены основного комплекса.',
  l:['Отдельный пост отпуска на той же базе карт','Общие отчёты по всем устройствам','Единый расчётный центр в офисе'],ports:['TCP 3186 · 3187']},
 {tag:'Площадка · сеть АТЗ',h:'Третий миникомпьютер',e:1,p:'Комплекс масштабируется на несколько площадок предприятия: удалённые АТЗ подключаются по радиоканалу или через интернет, а лимиты и отчёты остаются в одной базе.',
  l:['Удалённые площадки в одной системе','Разные каналы связи для разных объектов','Сквозные отчёты по всем постам'],ports:['радиоканал · GSM']}
];
var panel=document.getElementById('apanel'),nodes=[].slice.call(document.querySelectorAll('.nd'));
function setNode(i){
  nodes.forEach(function(el,k){el.classList.toggle('on',k===i)});
  var d=ND[i];
  panel.innerHTML='<div class="tag">'+d.tag+'</div><h3>'+d.h+'</h3><p>'+d.p+'</p><ul>'+d.l.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><div class="ports">'+d.ports.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div>';
}
nodes.forEach(function(el,i){el.addEventListener('click',function(){setNode(i)});el.addEventListener('mouseenter',function(){setNode(i)})});
setNode(0);

/* ---- fuelling simulator: real Топаз-Офис windows ---- */
var CARDS=[['0088','D2E569AB'],['0879KH10','856B42AB'],['0943KA10','0C876AAB'],['1784KH10','81EA69AB'],['M366HT10','52A743AB'],['1989KM10','DEA642AB'],['2973KM10','4B896AAB']];
var LIM=[['АИ-92','Запрещен','0','1'],['Дт','Календарный день','5000','1'],['Масло','Календарный день','400','1'],['Руб.','Запрещен','0','1']];
var JRN=[
 ['25.08.2017 07:18:39','Дебетование','35,00','АИ-92','M366HT10','52A743AB','Гайдэй С.В.','5','5','97 519,17'],
 ['25.08.2017 07:15:42','Дебетование','60,00','Дт','E413KY10','A7B642AB','Шинкевич Г.Г.','4','4','570 193,45'],
 ['25.08.2017 07:14:05','Дебетование','50,00','Дт','E247TB10','B38342AB','Алексеев О.Г.','4','3','505 953,00']
];
var S=[
 {t:'Ожидание карты',h:'Миникомпьютер готов, база лимитов из расчётного центра загружена',w:'jrn',st:'Готов. Последний сеанс обмена: 25.08.2017 07:19',note:'журнал операций · офис'},
 {t:'Чтение прокси-карты',h:'Считыватель передаёт код карты в «Топаз-186»',w:'cards',card:4,st:'Карта 52A743AB — найдена в справочнике контрагента КО',hint:'Комментарий к выделенной карте: Автоколонна 2',note:'справочник карт · офис'},
 {t:'Идентификация владельца',h:'Карта привязана к водителю и контрагенту',w:'cards',card:4,st:'M366HT10 · Гайдэй С.В. · контрагент КО · карта используется',hint:'Наименование карты — гос. номер техники, за которой она закреплена',note:'справочник карт · офис'},
 {t:'Проверка лимита по кошельку',h:'Разрешённый вид ГСМ и размер лимита в литрах',w:'cards',card:4,lim:1,st:'Кошелек «Дт»: календарный день, размер 5000',hint:'Лимитные ограничения задаются по каждому кошельку отдельно',note:'лимитные ограничения'},
 {t:'Запрещённые кошельки',h:'По кошелькам с типом «Запрещен» карта не обслуживается',w:'cards',card:4,lim:0,st:'Кошелек «АИ-92»: Запрещен — отпуск по этому виду ГСМ невозможен',hint:'Тип "Запрещен" - с данным кошельком карта не обслуживается.',note:'лимитные ограничения'},
 {t:'Разрешение дозы',h:'Устройство разрешает налив в пределах остатка лимита',w:'jrn',live:['25.08.2017 07:21:04','Дебетование','—','Дт','M366HT10','52A743AB','Гайдэй С.В.','4','1','—'],st:'Доза разрешена: до 148,00 л по кошельку «Дт»',note:'операция открыта'},
 {t:'Налив',h:'Контроль дозы по счётчику колонки в реальном времени',w:'jrn',live:['25.08.2017 07:21:04','Дебетование','96,42','Дт','M366HT10','52A743AB','Гайдэй С.В.','4','1','570 289,87'],st:'Идёт налив по колонке 4, рукав 1',note:'операция выполняется'},
 {t:'Запись в журнал',h:'Операция дебетования пишется в память устройства',w:'jrn',live:['25.08.2017 07:21:44','Дебетование','96,42','Дт','M366HT10','52A743AB','Гайдэй С.В.','4','1','570 289,87'],commit:1,st:'Операция закрыта. Дебетование 96,42 — записано',note:'запись в журнале'},
 {t:'Синхронизация с офисом',h:'«Сервер-186» забирает журнал и отдаёт обновлённую базу лимитов',w:'jrn',live:['25.08.2017 07:21:44','Дебетование','96,42','Дт','M366HT10','52A743AB','Гайдэй С.В.','4','1','570 289,87'],commit:1,st:'Обмен с «Топаз-186»: журнал принят, база лимитов передана',hint:'Выгрузить в CSV — журнал за период целиком, для 1С или Excel',note:'сеанс обмена'},
 {t:'Работа без связи',h:'Канал недоступен — отпуск идёт по локальной базе устройства',w:'jrn',live:['25.08.2017 07:34:12','Дебетование','40,00','Дт','K779YP10','ACA743AB','Себер А.Л.','3','1','570 329,87'],offline:1,st:'Нет связи с «Топаз-186». Операции будут получены при следующем сеансе',note:'автономный режим'},
 {t:'Отказ по лимиту',h:'Лимит исчерпан или карта заблокирована в расчётном центре',w:'cards',card:0,lim:0,warn:1,st:'Карта 0088: лимит по кошельку исчерпан — отпуск запрещён',hint:'Блокировка карты в расчётном центре действует с первого же сеанса обмена',note:'отпуск запрещён'}
];
var idx=0,timer=null;
var steps=document.getElementById('simsteps');
if(steps){
  steps.innerHTML=S.map(function(s,i){return '<button class="si'+(i?'':' on')+'" data-i="'+i+'"><i>'+String(i+1).padStart(2,'0')+'</i><span><b>'+s.t+'</b><span>'+s.h+'</span></span><span class="prg"></span></button>'}).join('');
  var jrnBody=document.getElementById('jrnBody'),cardBody=document.getElementById('cardBody'),limBody=document.getElementById('limBody');
  function td(v,i){return '<td'+([2,9].indexOf(i)>-1?' class="n"':'')+'>'+v+'</td>'}
  function draw(){
    var s=S[idx];
    document.getElementById('paneJrn').classList.toggle('on',s.w==='jrn');
    document.getElementById('paneCards').classList.toggle('on',s.w==='cards');
    document.getElementById('oswT').textContent=(s.w==='jrn'?'Журнал операций':'Карты')+'. Расчетный центр. - Топаз-Офис';
    var rows='';
    if(s.live)rows+='<tr class="live new'+(s.offline?' dim':'')+'">'+s.live.map(td).join('')+'</tr>';
    rows+=JRN.map(function(r){return '<tr>'+r.map(td).join('')+'</tr>'}).join('');
    jrnBody.innerHTML=rows;
    document.getElementById('jrnCount').textContent='Операций: '+(JRN.length+(s.live?1:0))+(s.offline?' · ожидают приёма из устройства':'');
    cardBody.innerHTML=CARDS.map(function(c,i){return '<tr'+(i===s.card?' class="sel"':'')+'><td>'+c[0]+'</td><td>'+c[1]+'</td></tr>'}).join('');
    limBody.innerHTML=LIM.map(function(l,i){return '<tr'+(i===s.lim?(s.warn?' class="live warn"':' class="sel"'):'')+'><td>'+l[0]+'</td><td>'+l[1]+'</td><td class="n">'+l[2]+'</td><td class="n">'+l[3]+'</td></tr>'}).join('');
    if(s.hint)document.getElementById(s.w==='jrn'?'jrnHint':'cardHint').textContent=s.hint;
    document.getElementById('oswSt').textContent=s.st;
    document.getElementById('tzMode').textContent=(s.note||'')+' · шаг '+(idx+1)+' из '+S.length;
    [].forEach.call(steps.children,function(el,i){el.classList.toggle('on',i===idx)});
  }
  function set(i,manual){idx=(i+S.length)%S.length;draw();if(manual)restart()}
  function restart(){clearInterval(timer);timer=setInterval(function(){set(idx+1)},4000)}
  steps.addEventListener('click',function(e){var el=e.target.closest('.si');if(el)set(+el.dataset.i,true)});
  document.getElementById('simnext').addEventListener('click',function(){set(idx+1,true)});
  var sw=document.querySelector('.sim2');
  sw.addEventListener('mouseenter',function(){clearInterval(timer)});
  sw.addEventListener('mouseleave',restart);
  draw();restart();
}

/* ---- screens gallery ---- */
var SH=[
 {n:'Водители · расчётный центр',s:'База карт с кодом и внешним кодом',win:'Водители Расчётный центр — Топаз-Офис',img:'assets/topaz-drivers.jpg',cap:'Справочник водителей выбранного контрагента: наименование, код карты и внешний код для сопоставления с учётной системой. В действующей инсталляции — 7 172 карты в одной базе.'},
 {n:'Журнал операций',s:'Все наливы с картой, временем и дозой',win:'Журнал операций — Топаз-Офис',img:'assets/topaz-journal.jpg',cap:'Журнал наливов, считанный из миникомпьютера: карта, водитель, дата и время, вид ГСМ, заданная и фактическая доза. Основной источник для разбора спорных заправок.'},
 {n:'Сменный отчёт',s:'Итоги смены по картам и видам ГСМ',win:'Сменный отчёт — Топаз-Офис',img:'assets/topaz-shift.jpg',cap:'Сменный отчёт формируется по выбранному периоду и объекту: сквозные итоги и детализация по видам топлива, подразделениям и картам.'},
 {n:'Настройка лимитных схем',s:'Виды ГСМ, объём и период',win:'Настройка лимитных схем — Топаз-Офис',img:'assets/topaz-limits.jpg',cap:'Лимитные схемы задают, какие виды топлива, в каком объёме и на какой период разрешены группе карт. Схема применяется к сотруднику и к подразделению одновременно.'},
 {n:'Структура сети',s:'Схема инсталляции комплекса',win:'Структура сети комплекса',img:'assets/topaz-network.jpeg',cap:'Типовая структура сети: офисные приложения и база Firebird, сервер ключей Guardant Net, «Сервер-186» и сеть АТЗ с миникомпьютерами «Топаз-186».'}
];
var shotl=document.getElementById('shotl');
if(shotl){
  shotl.innerHTML=SH.map(function(s,i){return '<button class="sh'+(i?'':' on')+'" data-i="'+i+'"><b>'+s.n+'</b><span>'+s.s+'</span></button>'}).join('');
  function setShot(i){
    [].forEach.call(shotl.children,function(el,k){el.classList.toggle('on',k===i)});
    var s=SH[i],img=document.getElementById('shotImg');
    img.src=s.img;img.alt='Экран программы: '+s.n;
    img.style.animation='none';void img.offsetWidth;img.style.animation='';
    document.getElementById('shotWin').textContent=s.win;
    document.getElementById('shotCap').textContent=s.cap;
  }
  shotl.addEventListener('click',function(e){var el=e.target.closest('.sh');if(el)setShot(+el.dataset.i)});
  setShot(0);
}

/* ---- comms tabs ---- */
var L=[
 {n:'Проводная линия RS-485',p:'Классический вариант, когда офис и площадка рядом: миникомпьютер подключается к компьютеру с «Сервер-186» по интерфейсу RS-485. Связь стабильная, абонентской платы нет.',
  l:['Кабельная линия до площадки и конвертер интерфейса','Обмен по команде оператора или по расписанию','Несколько устройств на одной линии — сеть АТЗ','Наиболее предсказуемый по стоимости владения вариант'],
  sp:[['Канал','RS-485'],['Абонплата','нет'],['Дальность','по линии связи'],['Когда','офис и АТЗ на одной территории']]},
 {n:'Радиоканал на блоках «Топаз-185»',p:'Обмен данными по радиоканалу с использованием блоков беспроводной связи «Топаз-185». Применяется, когда прокладка кабеля невозможна или неоправданно дорога, а объект в пределах прямой видимости.',
  l:['Пара блоков «Топаз-185»: у устройства и у сервера','Нет земляных работ и кабельных трасс','Не нужна сотовая связь и SIM-карта','Удобно для площадок на территории предприятия'],
  sp:[['Канал','радио'],['Оборудование','«Топаз-185»'],['Абонплата','нет'],['Когда','кабель проложить нельзя']]},
 {n:'Интернет через GSM-модем',p:'Обмен через сеть Интернет с использованием GSM-модема, подключённого к миникомпьютеру, и компьютера в офисе, имеющего постоянный IP-адрес. Основной вариант для удалённых площадок.',
  l:['GSM-модем на объекте и статический IP в офисе','Подходит для нескольких удалённых площадок','Работает вместе с типом лицензии «онлайн»','При обрыве связи отпуск идёт по локальной базе'],
  sp:[['Канал','GSM · Интернет'],['Требование','постоянный IP в офисе'],['Абонплата','тариф оператора'],['Когда','площадка удалена от офиса']]}
];
var lp=document.getElementById('lpanes');
if(lp){
  lp.innerHTML=L.map(function(d,i){
    return '<div class="dpane'+(i?'':' on')+'" data-p="'+i+'"><div class="dgrid2"><div><h3>'+d.n+'</h3><p class="lede">'+d.p+'</p><ul class="vlist">'+d.l.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div><div class="vspec">'+d.sp.map(function(s){return '<div><span class="k">'+s[0]+'</span><span class="v">'+s[1]+'</span></div>'}).join('')+'</div></div></div>';
  }).join('');
  document.getElementById('ltabs').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    [].forEach.call(this.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
    [].forEach.call(lp.children,function(x){x.classList.toggle('on',x.dataset.p===b.dataset.l)});
  });
}

/* ---- licence configurator ---- */
var st={mini:1,wp:1,lic:0,mon:0};
function licOut(){
  var rows=[
    ['ПО «Топаз-Автономный налив. Базовая часть»','1 лицензия'],
    ['Обслуживание дополнительного миникомпьютера',(st.mini-1)+(st.mini-1===1?' лицензия':' лицензий')],
    ['Дополнительное рабочее место офиса',(st.wp-1)+(st.wp-1===1?' лицензия':' лицензий')],
    ['Тип лицензии сервера',st.lic?'оффлайн (перевыпуск файла)':'онлайн (стандартно)'],
    ['Аппаратный ключ «Guardant» + Guardant Net','1 комплект'],
    ['СУБД «Firebird» 2.5',st.wp+(st.wp===1?' установка':' установки')],
    ['«Монитор ёмкостей»',st.mon?'не требуется':'входит в состав']
  ].filter(function(r){return !/^0 лиценз/.test(r[1])});
  var apps=['Топаз-Офис','Сервер-186','Клиент-186','ServiceManager','Мастер первоначальной настройки','сервисные программы'];
  if(!st.mon)apps.splice(3,0,'Монитор ёмкостей');
  document.getElementById('licout').innerHTML=
    '<div class="tag">Состав поставки</div><h3>'+st.mini+(st.mini===1?' миникомпьютер':st.mini<5?' миникомпьютера':' миникомпьютеров')+' · '+st.wp+(st.wp===1?' рабочее место':' рабочих места')+'</h3>'+
    rows.map(function(r){return '<div class="licrow"><span class="k">'+r[0]+'</span><span class="v">'+r[1]+'</span></div>'}).join('')+
    '<p class="licnote"><b>Приложения в поставке:</b> '+apps.join(', ')+'.'+(st.lic?' Тип лицензии «оффлайн» запрещает серверу обрабатывать запросы на обслуживание карт от миникомпьютеров — карты обслуживаются только по локальной базе; изменение типа возможно только при перевыпуске файла лицензии на заводе-изготовителе, поэтому его указывают при заказе.':' Стандартный тип лицензии — «онлайн»: карты можно обслуживать и по локальной, и по удалённой базе.')+'</p>'+
    '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap"><a href="contacts.html" class="pill pill-primary">Запросить цену комплекта</a></div>';
}
var licq=document.querySelector('.licq');
if(licq){
  licq.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.s){
      var s=b.dataset.s;
      if(s==='mini+')st.mini=Math.min(12,st.mini+1);
      if(s==='mini-')st.mini=Math.max(1,st.mini-1);
      if(s==='wp+')st.wp=Math.min(8,st.wp+1);
      if(s==='wp-')st.wp=Math.max(1,st.wp-1);
      document.getElementById('vMini').textContent=st.mini;
      document.getElementById('vWp').textContent=st.wp;
      licOut();return;
    }
    var grp=b.parentElement;
    [].forEach.call(grp.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b)});
    if(grp.id==='qLic')st.lic=+b.dataset.i;
    if(grp.id==='qMon')st.mon=+b.dataset.i;
    licOut();
  });
  licOut();
}

/* bars in view */
var io2=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io2.unobserve(e.target)}})},{threshold:.3});
document.querySelectorAll('.stage,.pb').forEach(function(el){io2.observe(el)});

/* subnav */
var links=[].slice.call(document.querySelectorAll('.snav a'));
var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
function spy(){var y=window.scrollY+180,best=0;secs.forEach(function(s,i){if(s&&s.offsetTop<=y)best=i});links.forEach(function(a,i){a.classList.toggle('on',i===best)})}
window.addEventListener('scroll',spy,{passive:true});spy();
links.forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();window.scrollTo({top:t.offsetTop-108,behavior:'smooth'})})});
})();
