/* Игра «Лес». Изображения — assets/img/forest, звуки — assets/audio (CC0). */
function plural(n,a,b,c){n=Math.abs(n)%100;const k=n%10;if(n>10&&n<20)return c;if(k>1&&k<5)return b;if(k===1)return a;return c;}
const A={m_star:'assets/img/m_star.webp'};
const UI_FONT='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
/* ===== Игра «Лес» ===== */
// Медведь (Петр, старший сын), подарки и препятствия — PNG с прозрачным фоном из папки assets/img/forest/.
// Пока какого-то файла нет, на его месте рисуется прежняя векторная графика — игра работает и без картинок.
//   bear_run_1.png … bear_run_6.png — кадры бега по кругу
//   bear_idle.png, bear_jump.png, bear_fall.png, bear_hit.png — стойка до старта, прыжок вверх, падение, столкновение
//   gift_1.png … gift_4.png — варианты подарков
//   obstacle_log.png, obstacle_stump.png, obstacle_drift.png — бревно, пень, сугроб
//   tree_1.png … tree_3.png — ели: ближний ряд как есть, дальний — те же ели, затемненные под ночное небо
//   lamp.png — фонарь на столбе; теплое свечение вокруг рисует игра
//   platform_log.png, platform_hill.png — огромное бревно и снежная гора: на них запрыгивают и бегут поверху
//   heart.png — сердечко жизни на панели в углу поля
const FOREST_DIR='assets/img/forest/';
// Сколько кадров бега и вариантов подарков. Если файлов будет другое число — поменять здесь
const FOREST_RUN_FRAMES=6, FOREST_GIFT_KINDS=4, FOREST_TREE_KINDS=3;
// Отдельные кадры медведя. Если какого-то не будет — убрать его из списка: вместо прыжка и стойки покажется первый кадр бега, вместо падения — прыжок, вместо столкновения — бег с миганием
const FOREST_BEAR_EXTRA=['idle','jump','fall','hit'];
// Препятствия: h — высота в игре (поле — 400 единиц в высоту, медведь — около 110), ширина — по пропорциям PNG; w — ширина векторной заглушки.
// stand — на препятствие можно приземлиться сверху и пробежать по нему (бревно, пень): где верх, на котором стоит медведь, — доля высоты картинки от ее верхнего края.
// На сугроб встать нельзя — кристаллы, любое касание — удар. Новое препятствие — строка здесь и файл obstacle_<k>.png; пока файла нет, оно рисуется сугробом
const FOREST_OBSTACLES=[{k:'log',h:34,w:72,stand:.25},{k:'stump',h:48,w:42,stand:.04},{k:'drift',h:38,w:96}];
// Платформы: на них надо запрыгнуть и бежать поверху. Врезался в бок — минус жизнь, медведь всё равно забирается наверх.
// h — высота площадки, по которой бежит медведь; img — во сколько раз картинка выше площадки (кристаллы и снег сверху); ширина — по пропорциям PNG (w — для векторной заглушки).
// top — профиль верха в 24 точках слева направо, в долях h. Стоять можно там, где верх выше половины h; ниже — склон, в него медведь врезается.
// Профиль снят с картинок; если их заменить — его нужно пересчитать.
// Длинные платформы собираются из той же картинки: левый край, середина — повторяется сколько нужно (через раз зеркально, стыки — плавным переходом) — и правый край.
// cut — где на картинке начинается правый край (доля ширины); mids — куски середины для повторов, доли ширины (кристаллы в них не попадают); seam — ширина перехода на стыке, px картинки
const FOREST_PLATFORMS=[
  {k:'log',h:80,img:1.035,w:360,cut:.80,mids:[[.14,.80]],seam:40,top:[.94,.98,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,.99,.98]},
  {k:'hill',h:88,img:1.12,w:342,cut:.86,mids:[[.20,.40],[.54,.86]],seam:44,top:[.38,.75,1,1,.99,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,.97,.93,.66]}
];
const FOREST_TOP_LOG_H=56;   // верхнее бревно двухэтажного препятствия — тоньше нижнего
// Где на картинке фонаря горит свет: доли ширины и высоты от левого верхнего угла; туда игра ставит свечение
const FOREST_LAMP_LIGHT=[0.68,0.30];
// Фон и передний план — дополнительные картинки; нет файла — нет и элемента.
// izba_1…: избушки (FOREST_IZBA_WIN — центры окон, там теплое свечение; FOREST_IZBA_PIPE — верх трубы, оттуда дым; доли картинки);
// tree_deco — наряженная елка, birch — береза, snowman — снеговик, bush — куст; fg_1…: детали в снегу у нижнего края экрана (передний план)
const FOREST_IZBA_KINDS=2, FOREST_FG_KINDS=8;
const FOREST_IZBA_WIN=[[[.366,.749],[.630,.749]],[[.338,.745]]], FOREST_IZBA_PIPE=[[.763,.08],[.723,.01]];
// Огоньки гирлянды на наряженной елке (доли картинки): игра заставляет их мерцать
const FOREST_DECO_LIGHTS=[[.54,.17],[.47,.18],[.37,.25],[.41,.26],[.47,.28],[.53,.30],[.59,.31],[.29,.41],[.58,.42],[.66,.44],[.51,.45],[.38,.46],[.44,.46],[.22,.54],[.71,.57],[.25,.58],[.30,.60],[.35,.62],[.40,.64],[.21,.69],[.25,.71],[.76,.74],[.84,.76],[.55,.76],[.60,.78],[.66,.80],[.73,.80],[.45,.82],[.52,.85],[.70,.92]];
// Хеш номера ячейки → число 0…1. Фон собирается из бесконечной цепочки ячеек: что стоит в ячейке, решает хеш ее номера, поэтому узор не повторяется, а кадр стабилен
function forestHash(i,s){let t=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0; t=Math.imul(t^(t>>>13),1274126177); t^=t>>>16; return (t>>>0)/4294967296;}
const FOREST_ART={run:[],idle:null,jump:null,fall:null,hit:null,gifts:[],ob:{},pf:{},pfSl:{},trees:[],treesFar:[],lamp:null,heart:null,izba:[],fg:[],treeDeco:null,birch:null,snowman:null,bush:null};
let forestArtReq=null;
function forestImg(name){return new Promise(res=>{const i=new Image();i.onload=()=>res(i.naturalWidth?i:null);i.onerror=()=>res(null);i.src=FOREST_DIR+name;});}
// Нумерованные файлы _1 … _count. Нет первого — остальные не запрашиваем
async function forestSeq(prefix,count,into){
  const first=await forestImg(prefix+'1.png'); if(!first)return;
  const rest=await Promise.all([...Array(Math.max(0,count-1))].map((_,i)=>forestImg(prefix+(i+2)+'.png')));
  into.push(first,...rest.filter(Boolean));
}
// Дальние ели — те же картинки, затемненные под цвет ночного неба: так лес выглядит глубже
function forestTint(img){
  const h=Math.min(320,img.naturalHeight), w=Math.round(img.naturalWidth*h/img.naturalHeight);
  const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.drawImage(img,0,0,w,h); x.globalCompositeOperation='source-atop'; x.fillStyle='rgba(12,26,72,.6)'; x.fillRect(0,0,w,h);
  return c;
}
// Куски для длинных платформ: середина (обычная и зеркальная) и правый край. У каждого слева — плавное появление: положенный внахлест, он перетекает в соседний без шва
function forestSlices(d,img){
  const W=img.naturalWidth, H=img.naturalHeight, b=Math.round(d.cut*W), o=d.seam;
  const piece=(x0,x1,flip)=>{
    const w=x1-x0, c=document.createElement('canvas'); c.width=w; c.height=H; const g=c.getContext('2d');
    if(flip){g.translate(w,0);g.scale(-1,1);} g.drawImage(img,x0,0,w,H,0,0,w,H); g.setTransform(1,0,0,1,0,0);
    const m=g.createLinearGradient(0,0,o,0); m.addColorStop(0,'rgba(0,0,0,0)'); m.addColorStop(1,'rgba(0,0,0,1)');
    g.globalCompositeOperation='destination-in'; g.fillStyle=m; g.fillRect(0,0,w,H); return c;
  };
  // куски середины по очереди: обычный, зеркальный, следующий обычный…
  const mid=[]; d.mids.forEach(([m0,m1])=>{const x0=Math.round(m0*W)-o, x1=Math.round(m1*W); mid.push(piece(x0,x1,false),piece(x0,x1,true));});
  return {b,o,mid,cap:piece(b-o,W,false)};
}
function loadForestArt(){
  if(forestArtReq)return forestArtReq;
  const F=FOREST_ART;
  const bear=forestSeq('bear_run_',FOREST_RUN_FRAMES,F.run).then(()=>F.run.length?Promise.all(FOREST_BEAR_EXTRA.map(k=>forestImg('bear_'+k+'.png').then(i=>{F[k]=i;}))):null);
  const trees=forestSeq('tree_',FOREST_TREE_KINDS,F.trees).then(()=>{F.treesFar=F.trees.map(forestTint);});
  const extra=[forestSeq('izba_',FOREST_IZBA_KINDS,F.izba),forestSeq('fg_',FOREST_FG_KINDS,F.fg),
    ...[['tree_deco','treeDeco'],['birch','birch'],['snowman','snowman'],['bush','bush']].map(([f,k])=>forestImg(f+'.png').then(i=>{F[k]=i;}))];
  forestArtReq=Promise.all([bear,trees,...extra,forestSeq('gift_',FOREST_GIFT_KINDS,F.gifts),forestImg('lamp.png').then(i=>{F.lamp=i;}),forestImg('heart.png').then(i=>{F.heart=i;}),
    ...FOREST_OBSTACLES.map(o=>forestImg('obstacle_'+o.k+'.png').then(i=>{F.ob[o.k]=i;})),...FOREST_PLATFORMS.map(o=>forestImg('platform_'+o.k+'.png').then(i=>{F.pf[o.k]=i; if(i)try{F.pfSl[o.k]=forestSlices(o,i);}catch(e){}}))]);
  return forestArtReq;
}
// На странице «Леса» картинки грузятся сразу, пока игрок читает правила
if(document.body&&document.body.dataset.page==='forest')loadForestArt();

/* ===== Звуки «Леса» =====
   Эффекты и музыка — из бесплатных наборов с лицензией CC0 (список и источники — в README, раздел 6.5).
   Эффекты играет Web Audio: без задержки и по нескольку сразу. Музыка — элемент <audio>: длинный файл не раскодируется в память целиком,
   идет по кругу. Браузеры дают звук только после касания или клика, поэтому звук «включается» на кнопке старта (unlock).
   Выключатель — кнопка на поле; выбор запоминается на устройстве. Страница открыта прямо с диска (file://) — эффекты через <audio>. */
// имя → [файл, громкость]; громкость музыки задана в самом файле (на iPhone громкость элемента <audio> не меняется)
const FOREST_SFX={jump:['jump',.5],jump2:['jump2',.55],land:['land',.3],gift:['gift',.55],heart:['heart',.6],hit:['hit',.85],fall:['fall',.7],boost:['boost',.55],over:['over',.7],record:['record',.75]};
const ForestSound=(()=>{
  const DIR='assets/audio/', AC=window.AudioContext||window.webkitAudioContext, WA=!!AC&&location.protocol!=='file:';
  let ctx=null, out=null, music=null, on=true, want=false;
  const bufs={};
  try{on=localStorage.getItem('psb-sound')!=='0';}catch(e){}
  // звук можно включать только сразу после касания или клика (иначе браузер ругается в консоли), музыку — после первого касания страницы
  const UA=navigator.userActivation, now=()=>!UA||UA.isActive, ever=()=>!UA||UA.hasBeenActive;
  // у MP3 в начале бывают миллисекунды тишины: играем с первого звучащего сэмпла
  const lead=b=>{const d=b.getChannelData(0),n=Math.min(d.length,8192);let i=0;while(i<n&&Math.abs(d[i])<.0015)i++;return i<n?i/b.sampleRate:0;};
  function load(){
    Object.values(FOREST_SFX).forEach(([f])=>{
      if(f in bufs) return; bufs[f]=null;
      fetch(DIR+f+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status))
        .then(a=>new Promise((res,rej)=>ctx.decodeAudioData(a,res,rej))).then(b=>{bufs[f]={b,off:lead(b)};}).catch(()=>{});
    });
  }
  // вызывать из обработчика касания или клика
  function unlock(){
    if(!now()) return;
    if(WA&&!ctx){
      try{ctx=new AC(); out=ctx.createGain(); out.connect(ctx.destination);
        const s=ctx.createBufferSource(); s.buffer=ctx.createBuffer(1,1,22050); s.connect(out); s.start(0);   // iPhone: «разогреть» звук внутри касания
        load();}catch(e){ctx=null;}
    }
    if(ctx&&ctx.state==='suspended') ctx.resume().catch(()=>{});
  }
  function play(name,o){
    const d=FOREST_SFX[name]; if(!on||!d) return;
    const vol=d[1]*((o&&o.vol)||1), rate=(o&&o.rate)||1;
    if(ctx){
      const x=bufs[d[0]]; if(!x) return;
      const s=ctx.createBufferSource(), g=ctx.createGain(); s.buffer=x.b; s.playbackRate.value=rate; g.gain.value=vol;
      s.connect(g); g.connect(out); s.start(0,x.off); return;
    }
    if(WA||!ever()) return;   // Web Audio есть, но звук еще не включен касанием
    try{const a=new Audio(DIR+d[0]+'.mp3'); a.volume=Math.min(1,vol); a.preservesPitch=false; a.playbackRate=rate; const p=a.play(); if(p&&p.catch)p.catch(()=>{});}catch(e){}
  }
  function musicPlay(){
    want=true; if(!on||!ever()) return;
    if(!music){ music=new Audio(DIR+'music.mp3'); music.loop=true; music.preload='auto'; }
    const p=music.play(); if(p&&p.catch)p.catch(()=>{});
  }
  function musicPause(){ want=false; if(music) music.pause(); }
  function set(v){
    on=!!v; try{localStorage.setItem('psb-sound',on?'1':'0');}catch(e){}
    if(on&&want) musicPlay(); else if(music) music.pause();   // включили посреди забега — музыка продолжается
  }
  return {unlock,play,musicPlay,musicPause,set,get on(){return on;}};
})();

function ForestGame(canvas, hooks){
  const ctx=canvas.getContext('2d'), F=FOREST_ART; loadForestArt();
  const sfx=(n,o)=>{if(hooks.sfx)hooks.sfx(n,o);};
  const hud=s=>{if(hooks.hud)hooks.hud(s);};   // жизни и подарки — на самом поле; страница может подписаться, но не обязана
  // подарки подряд (меньше чем через GIFT_RUN секунды) звучат всё выше — по ступеням мажорной пентатоники
  const GIFT_RUN=1.1, GIFT_STEPS=[1,1.122,1.26,1.498,1.682,2];
  let giftT=-9, giftN=0;
  const head=new Image(); head.src=A.m_star; // векторная заглушка медведя: бюст Петра + дорисованные ноги и руки
  const LH=400, GROUND=328, PX=96;
  // PNG в единицах игры: кадр медведя — BEAR_H в высоту, лапы на земле; RUN_CYCLE — сколько медведь пробегает за все кадры бега; подарок — GIFT_D по большей стороне
  const BEAR_H=124, BEAR_SINK=4, RUN_CYCLE=150, GIFT_D=40, OB_SINK=3;
  // Фонарь — LAMP_H в высоту; ели — по росту из ячеек фона (см. draw), ширина по пропорциям PNG
  const LAMP_H=96;
  // «Ускорение»: нажал — бег сразу в BOOST_KICK раз быстрее; пока держишь — разгоняется дальше, но медленно: +BOOST_GROW в секунду, до ×BOOST_MAX.
  // Отпустил — за полсекунды возвращается к обычной скорости. Врезался — ускорение сбрасывается
  const BOOST_KICK=2, BOOST_GROW=.1, BOOST_MAX=4.5, BOOST_FALL=.22;
  // Расстановка рассчитана на обычный бег с запасом ×SAFE_BOOST: всё можно перепрыгнуть и поймать. С «Ускорением» события идут плотнее — это риск, который игрок выбирает сам
  const SAFE_BOOST=1.5;
  // Ноги медведя мелькают не быстрее, чем на ANIM_V единицах в секунду: на большом ускорении кадры бега не сливаются в кашу
  const ANIM_V=900;
  const STEP=10;   // ступенька, на которую медведь забегает без прыжка; выше — это стена
  const FOOT=14;   // полступни: на бревно и пень медведь встает, даже если над ними только передние или задние лапы
  // Дополнительная жизнь — сердечко высоко, ловится прыжком. Появляется, только если жизней меньше трех: не чаще раза в LIFE_EVERY секунд бега,
  // не раньше чем через LIFE_AFTER_HIT секунд после удара, с шансом LIFE_CHANCE вместо высокого подарка. На поле — не больше одного, жизней — не больше трех
  const LIFE_EVERY=15, LIFE_AFTER_HIT=6, LIFE_CHANCE=.3, LIFE_D=34;
  let LW=800, TOP=0, sc=1, dpr=1, raf=0, last=0, alive=true;
  const S={run:false,done:false,lives:3,out:false,t:0,dist:0,gifts:0,score:0,cleared:0,py:GROUND,vy:0,ground:true,stun:0,inv:0,boost:false,objs:[],parts:[],next:520,jumpAt:-1e9,lowAt:-1e9,lifeAt:-1e9,hitAt:-1e9,bk:1,best:0,paused:false,ph:0,rt:0,v0:280,dj:false,flip:0};
  // Лес бесконечный: скорость плавно растет со временем бега — каждые RAMP_EVERY секунд на RAMP от стартовой V0, без потолка
  // (через 30 секунд — в 2,5 раза быстрее, через минуту — в 4). Забег идет, пока есть жизни, — рано или поздно скорость становится непосильной
  const V0=280, RAMP=.25, RAMP_EVERY=5;
  const speedAt=t=>V0*(1+RAMP*t/RAMP_EVERY);
  const AHEAD=4;   // расстановка считается по скорости через AHEAD секунд бега: к тому времени медведь добежит до новых событий
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const stars=[...Array(70)].map(()=>({x:Math.random(),y:Math.random()*0.55,r:Math.random()*1.4+.3,p:Math.random()*6}));
  const flakes=[...Array(60)].map(()=>({x:Math.random(),y:Math.random(),r:Math.random()*2+.6,v:Math.random()*30+20,w:Math.random()*2}));
  const hsh=forestHash, SEED=Math.floor(Math.random()*1e6);   // у каждого забега свой лес
  // Ближний слой фона: ячейки по 130 единиц. В ячейке — ель (три формы), иногда береза или наряженная елка, изредка избушка, снеговик или куст; бывают просветы
  const NEAR=130;
  const rawKind=i=>{const r=hsh(i,SEED+21); return r<.09?'gap':r<.14?'izba':r<.18?'deco':r<.28?'birch':r<.31?'snowman':r<.40?'bush':'fir';};
  // редкие — избушка, наряженная елка, снеговик — не ближе GAP ячеек к такому же; иначе в ячейке обычная ель
  const GAP={izba:10,deco:10,snowman:12};
  const nearKind=i=>{const k=rawKind(i), g=GAP[k]; if(g) for(let j=1;j<=g;j++) if(rawKind(i-j)===k) return 'fir'; return k;};
  const isIzba=i=>F.izba.length>0&&nearKind(i)==='izba';
  const lampRaw=i=>hsh(i,SEED+22)<.14;
  const hasLamp=i=>{if(!lampRaw(i))return false; for(let j=1;j<=4;j++) if(lampRaw(i-j)) return false; return true;};          // фонари — по одному, между ними не меньше 4 ячеек
  function resize(){
    // высота поля — от ширины (data-ratio) и не больше свободного места: на телефоне — коробка игрового режима,
    // на компьютере — высота окна минус шапка и кнопки (data-vfit), иначе data-maxh. Ширина обзора не меньше data-lw — сверху добавляется небо
    const w=canvas.clientWidth||canvas.parentElement.clientWidth, ratio=+(canvas.dataset.ratio||.5), box=canvas.closest('.gm-mid');
    if(!w) return;   // поле скрыто (телефон вертикально — экран «Поверните телефон»): размеры пересчитаются, когда оно появится
    const vfit=+(canvas.dataset.vfit||0), minLW=+(canvas.dataset.lw||0);
    const maxH=box&&box.clientHeight>0?box.clientHeight-16:vfit?Math.max(360,innerHeight-vfit):+(canvas.dataset.maxh||440);
    const h=Math.max(180,Math.min(maxH,Math.round(w*ratio)));
    dpr=Math.min(2,window.devicePixelRatio||1); canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr); canvas.style.height=h+'px';
    // data-lh — сколько единиц в высоту видно минимум: над верхней точкой двойного прыжка остается небо, медведь не уходит за край
    const minLH=+(canvas.dataset.lh||0);
    sc=h/LH; if(minLW&&w/sc<minLW)sc=w/minLW; if(minLH&&h/sc<minLH)sc=h/minLH; LW=w/sc; TOP=Math.max(0,h/sc-LH);
  }
  resize(); window.addEventListener('resize',resize);
  // Телефон: поле меняет размер при повороте и когда появляется из-под подсказки «Поверните телефон» — следим за его коробкой
  let ro=null, boxW=0, boxH=0;
  const gmBox=canvas.closest('.gm-mid');
  if(gmBox&&window.ResizeObserver){ ro=new ResizeObserver(()=>{ if(gmBox.clientWidth!==boxW||gmBox.clientHeight!==boxH){ boxW=gmBox.clientWidth; boxH=gmBox.clientHeight; resize(); } }); ro.observe(gmBox); }
  // Прыжок: с опоры — обычный (0,8 с, до 184 вверх). В воздухе — один невысокий второй: до +60 к высоте (если нажать в верхней точке; раньше — меньше), с сальто.
  // Третьего нет; приземлился — второй снова доступен. Сорвался с края без прыжка — второй тоже можно
  const J1=920, J2=525, FLIP=.5;
  function jump(){
    if(!S.run||S.paused) return;
    if(S.ground){S.vy=-J1;S.ground=false;S.dj=false;sfx('jump');return;}
    if(S.dj) return;
    S.dj=true; S.vy=-Math.max(J2,-S.vy*1.1); S.flip=FLIP; sfx('jump2');
    for(let i=0;i<9;i++)S.parts.push({k:'sp',x:PX+rnd(-18,18),y:S.py-6,vx:rnd(-110,110),vy:rnd(30,140),life:rnd(.3,.55)});   // снежная пыль из-под лап
  }
  // Размер и зона столкновения препятствия: из PNG, если он уже загружен, иначе — векторные
  function obSize(type){
    const d=FOREST_OBSTACLES.find(o=>o.k===type)||FOREST_OBSTACLES[0], img=F.ob[type];
    // top — высота, на которой медведь стоит на бревне или пне (у векторных — по снежной шапке)
    if(!img) return {w:d.w,h:d.h,png:false,stand:!!d.stand,top:GROUND-d.h+2,hb:{x:6,y:6,w:d.w-12}};
    const w=Math.round(Math.max(24,Math.min(140,d.h*img.naturalWidth/img.naturalHeight))); // шире 140 не бывает: перепрыгнуть можно и на старте, и на полной скорости
    return {w,h:d.h,png:true,stand:!!d.stand,top:GROUND-d.h+OB_SINK+d.h*(d.stand||0),hb:{x:w*.12,y:d.h*.15,w:w*.76}};
  }
  // Трасса — цепочка событий по одному: прыжок (препятствие или подарок высоко) либо подарок у земли.
  // Расстояния считаются от скорости следующего отрезка пути с запасом ×SAFE_BOOST, поэтому на обычном бегу любое препятствие можно перепрыгнуть, а любой подарок — поймать.
  // Прыжок длится 0,8 с: медведь пролетает 0,8 скорости, в верхней точке — посередине. Подарок высоко ловится прыжком с верхней точкой у подарка
  function giftAt(cx,elev){S.objs.push({k:'gift',x:cx-13,y:GROUND-elev-12,c:Math.floor(Math.random()*4)});}
  // Профиль верха платформы в точке f (0 — левый край, 1 — правый)
  function profAt(prof,f){const t=Math.min(1,Math.max(0,f))*(prof.length-1),i=Math.floor(t),fr=t-i;return prof[i]+(prof[Math.min(i+1,prof.length-1)]-prof[i])*fr;}
  // Профиль верха платформы длиной w (W0 — длина картинки в игре): края — с картинки, середина — повтор ее середины
  function pfProf(d,W0,w){
    if(w<=W0+1) return d.top;
    const n=Math.max(24,Math.round(w/14)), a=d.mids[0][0], b=d.cut, mid=(d.mids[0][1]-a)*W0, out=[];
    for(let i=0;i<=n;i++){
      const u=w*i/n, f=u<=b*W0?u/W0:u>=w-(1-b)*W0?b+(u-(w-(1-b)*W0))/W0:a+((u-b*W0)%mid)/W0;
      out.push(profAt(d.top,f));
    }
    return out;
  }
  // Платформа в игре: картинка ih в высоту, длина картинки W0; верх в профиле — от i0-й до i1-й точки (склоны по краям в длину не входят)
  function pfDef(k,h){
    const d=FOREST_PLATFORMS.find(p=>p.k===k), img=F.pf[k], hh=h||d.h, ih=hh*(d.img||1), W0=img?ih*img.naturalWidth/img.naturalHeight:d.w*hh/d.h;
    const n=d.top.length-1, i0=d.top.findIndex(q=>q>=.5), i1=n-[...d.top].reverse().findIndex(q=>q>=.5);
    return {d,img,h:hh,ih,W0,head:W0*i0/n,tail:W0*(1-i1/n)};
  }
  function pfPush(P,x,w,base){const o={k:'pf',type:P.d.k,x,w,h:P.h,ih:P.ih,base,png:!!P.img,prof:pfProf(P.d,P.W0,w),seed:Math.floor(Math.random()*4)}; S.objs.push(o); return o;}
  // Большие препятствия разной длины: длинное бревно, длинный снежный вал или двухэтажное — на нижнее бревно (или вал) положено бревно потоньше.
  // Длина растет со скоростью: поверху бежать примерно от полсекунды до двух. Двухэтажное: запрыгнуть на нижнее, с него — на верхнее; не успел — удар о бок,
  // медведь всё равно забирается наверх. До верхнего бревна по нижнему — не меньше 0,6 скорости, верхнее — не короче 0,8: приземлиться на него можно при любом прыжке с нижнего
  function bigOne(v,jumpGap,half){
    const t=Math.random(), stack=t<.4, P=pfDef(stack?(Math.random()<.7?'log':'hill'):(t<.72?'log':'hill'));
    const c=Math.max(S.next, S.jumpAt+jumpGap+rnd(0,v*.4), S.lowAt+half+40);           // c — край, на который запрыгивают
    const x=c-P.head;
    if(!stack){
      const w=Math.max(P.W0,rnd(P.W0,Math.max(P.W0+260,v*1.8))), end=x+w-P.tail, top=end-c;
      const o=pfPush(P,x,w,0);
      const gn=Math.max(1,Math.min(4,Math.floor(top/(v*.9))));                          // подарки поверху — по одному, ловятся на бегу
      for(let i=0;i<gn;i++){const gx=c+top*(gn===1?.55:.3+.6*i/(gn-1)); giftAt(gx,P.h*profAt(o.prof,(gx-x)/w)+rnd(40,55));}
      S.jumpAt=end-v*.14; S.lowAt=end+v*.3; S.next=end+v*rnd(.3,.5);                   // с края медведь падает около четверти секунды
      return;
    }
    const T=pfDef('log',FOREST_TOP_LOG_H);
    const d1=Math.max(150,v*.6)*rnd(1,1.25), L2=Math.max(T.W0,Math.max(260,v*.8)*rnd(1,1.4)), d3=rnd(90,220);
    const w=P.head+d1+L2+d3+P.tail, end=x+w-P.tail, x2=c+d1, base2=P.h-4;
    pfPush(P,x,w,0); pfPush(T,x2,L2,base2);
    if(d1>v*.45) giftAt(c+d1*.45,P.h+rnd(40,55));                                         // на нижнем — до верхнего бревна
    const g0=x2+Math.min(L2*.5,v*.5), g1=x2+L2-30, gn=Math.max(1,Math.min(3,Math.floor((g1-g0)/(v*.6))+1));
    for(let i=0;i<gn;i++) giftAt(gn===1?(g0+g1)/2:g0+(g1-g0)*i/(gn-1),base2+T.h+rnd(40,55)); // на верхнем
    S.jumpAt=end-v*.14; S.lowAt=end+v*.3; S.next=end+v*rnd(.3,.5);
  }
  function spawn(){
    const v=speedAt(S.rt+AHEAD)*SAFE_BOOST, half=v*.4;              // полпрыжка по горизонтали
    const jumpGap=2*half+v*.25;                                       // от прыжка до прыжка: прыжок и четверть секунды на реакцию
    const r=Math.random();
    if(r>=.28&&r<.38){                                                // яма: перепрыгнуть; над частью ям — подарок
      const vb=speedAt(S.rt+AHEAD), w=(vb*.15+50)*rnd(1,1.3);          // шире, чем медведь проскочит с разбегу, и уже прыжка
      const c=Math.max(S.next, S.jumpAt+jumpGap+rnd(0,v*.5), S.lowAt+half+40);
      S.objs.push({k:'pit',x:c-w/2,w});
      if(Math.random()<.4) giftAt(c,rnd(190,215));
      S.jumpAt=c; S.next=c+v*rnd(.3,.5);
      return;
    }
    if(r>=.38&&r<.56){ bigOne(v,jumpGap,half); return; }               // большое препятствие: запрыгнуть на край и бежать поверху
    if(r<.28){                                                        // препятствие; над половиной — подарок, он ловится тем же прыжком
      const type=FOREST_OBSTACLES[Math.floor(Math.random()*FOREST_OBSTACLES.length)].k, o=obSize(type);
      const c=Math.max(S.next, S.jumpAt+jumpGap+rnd(0,v*.6), S.lowAt+half+40);
      S.objs.push(Object.assign({k:'ob',type,x:c-o.w/2},o));
      if(Math.random()<.5) giftAt(c,rnd(190,215));
      S.jumpAt=c; S.next=c+v*rnd(.3,.5);
    } else if(r<.72){                                                 // подарок высоко — за ним надо прыгнуть; иногда вместо него сердечко
      const c=Math.max(S.next, S.jumpAt+jumpGap+rnd(0,v*.5), S.lowAt+half+40), vb=speedAt(S.rt+AHEAD);
      if(S.lives<3&&c>S.lifeAt+vb*LIFE_EVERY&&c>S.hitAt+vb*LIFE_AFTER_HIT&&!S.objs.some(o=>o.k==='life')&&Math.random()<LIFE_CHANCE){
        S.objs.push({k:'life',x:c-13,y:GROUND-rnd(195,225)-12}); S.lifeAt=c;
      } else giftAt(c,rnd(190,240));
      S.jumpAt=c; S.next=c+v*rnd(.3,.5);
    } else {                                                          // подарок у земли — ловится на бегу, медведь к этому месту уже приземлился
      const c=Math.max(S.next, S.jumpAt+half+40, S.lowAt+v*rnd(.3,.6));
      giftAt(c,rnd(38,58));
      S.lowAt=c; S.next=c+v*rnd(.25,.45);
    }
  }
  function hit(pit){
    if(S.inv>0||!S.run) return; S.stun=.6; S.inv=1.4; S.lives--; S.bk=1; S.hitAt=S.dist+PX;
    sfx(pit?'fall':'hit');
    S.parts.push({k:'txt',x:PX+30,y:S.py-110,t:S.lives>0?'Ой! −1 попытка':'Попытки кончились',life:1.1,c:'#ffb3a8'});
    hud(S);
    if(S.lives<=0){S.run=false;S.done=true;S.out=true;setTimeout(()=>hooks.end(S),700);}
  }
  // Опора под точкой x для медведя, у которого лапы на высоте feet: земля, верх платформы (там, где верх выше половины ее высоты)
  // или верх бревна и пня — только если лапы уже над ним: сверху на них приземляются, а сбоку это обычное препятствие
  function surfAt(x,feet){
    let y=GROUND;
    for(const o of S.objs){
      if(o.k==='pit'){ if(x>o.x+6&&x<o.x+o.w-6) y=GROUND+1000; continue; }   // над ямой опоры нет
      if(o.k==='ob'){ if(o.stand&&x>=o.x+o.hb.x-FOOT&&x<=o.x+o.hb.x+o.hb.w+FOOT&&feet<=o.top+STEP&&o.top<y) y=o.top; continue; }
      if(o.k!=='pf'||x<o.x||x>o.x+o.w) continue;
      const q=profAt(o.prof,(x-o.x)/o.w);
      if(q>=.5){const t=GROUND-(o.base||0)-o.h*q; if(t<y)y=t;}
    }
    return y;
  }
  // Врезался в бок платформы: минус жизнь (если не мигает после прошлого удара) и всё равно забирается наверх
  function wall(top){ if(S.run&&S.inv<=0)hit(); S.py=top; S.vy=0; S.ground=true; }
  function update(dt){
    if(S.paused) return;
    S.t+=dt;
    if(S.boost&&S.run) S.bk=Math.min(BOOST_MAX,Math.max(S.bk,BOOST_KICK)+BOOST_GROW*dt);
    else S.bk=1+(S.bk-1)*Math.exp(-dt/BOOST_FALL);
    if(S.run) S.rt+=dt;                                               // время бега: пауза и экран «Готовы?» не считаются
    S.v0=speedAt(S.rt);
    const v=S.v0*S.bk*(S.stun>0?.45:1);
    // на большой скорости кадр дробится на шаги не длиннее 24 единиц, чтобы медведь не проскакивал препятствия и подарки
    const n=Math.max(1,Math.ceil(v*dt/24));
    for(let i=0;i<n;i++) step(dt/n,v);
    if(S.run) S.ph=(S.ph+Math.min(v,ANIM_V)*dt)%RUN_CYCLE;
    if(S.ground){S.dj=false;S.flip=0;} else if(S.flip>0) S.flip=Math.max(0,S.flip-dt);
    S.objs=S.objs.filter(o=>o.x+(o.w||26)>S.dist-200&&!o.gone);
    for(const p of S.parts){p.life-=dt; if(p.k==='sp'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;} else p.y-=40*dt;}
    S.parts=S.parts.filter(p=>p.life>0);
  }
  function step(dt,v){
    if(S.run){ S.dist+=v*dt; while(S.next<S.dist+LW+200) spawn(); }
    if(S.stun>0)S.stun-=dt; if(S.inv>0)S.inv-=dt;
    const px=S.dist, under=surfAt(px+PX,S.py), front=surfAt(px+PX+22,S.py);
    if(front<S.py-STEP&&front<under-STEP) wall(front);
    if(S.py>GROUND+40){                                                 // провалился в яму: минус жизнь, выбирается на дальнем краю
      const o=S.objs.find(o=>o.k==='pit'&&px+PX>o.x-30&&px+PX<o.x+o.w+30);
      if(S.run&&S.inv<=0)hit(true);
      if(o) S.dist=Math.max(S.dist,o.x+o.w-PX+8);
      S.py=GROUND; S.vy=0; S.ground=true; return;
    }
    if(S.ground){
      if(under<S.py) S.py=under;                                        // небольшой подъем
      else if(under>S.py+1){ if(under-S.py>8){S.ground=false;S.vy=0;} else S.py=under; }   // сбежал с края — падает
    } else {
      S.vy+=2300*dt; const ny=S.py+S.vy*dt;
      if(S.vy>=0&&ny>=under){ if(S.run&&S.vy>500)sfx('land',{vol:Math.min(1,S.vy/1100)}); S.py=under;S.vy=0;S.ground=true; } else S.py=ny;
    }
    const pr={x:px+PX-26,y:S.py-84,w:54,h:76};
    for(const o of S.objs){
      if(o.gone||o.k==='pf'||o.k==='pit') continue;
      if(o.k==='ob'){
        const r={x:o.x+o.hb.x,y:GROUND-o.h+o.hb.y,w:o.hb.w,h:o.h-o.hb.y};
        // бревно и пень бьют только в бок: лапы ниже верха и медведь еще не за серединой. Стоит сверху или спрыгивает с них — не удар
        const side=!o.stand||(S.py>o.top+STEP&&px+PX<r.x+r.w/2);
        if(side&&pr.x<r.x+r.w&&pr.x+pr.w>r.x&&pr.y<r.y+r.h&&pr.y+pr.h>r.y){ if(!o.hit){o.hit=1;hit();} }
        if(!o.passed&&o.x+o.w<px+PX-26){o.passed=1; if(!o.hit){S.cleared++;S.score+=5;hud(S);}}
      } else {
        const cx=o.x+13, cy=o.y+12;
        if(cx>pr.x-14&&cx<pr.x+pr.w+14&&cy>pr.y-14&&cy<pr.y+pr.h+10){
          o.gone=1;
          if(o.k==='life'){ if(S.lives<3)S.lives++; S.parts.push({k:'txt',x:cx-px-20,y:cy-20,t:'+1 попытка',life:1.1,c:'#ffb8c8'}); sfx('heart'); }
          else { S.gifts++;S.score+=10; S.parts.push({k:'txt',x:cx-px,y:cy-20,t:'+1',life:.9,c:'#fde7a8'});
            giftN=S.t-giftT<GIFT_RUN?Math.min(giftN+1,GIFT_STEPS.length-1):0; giftT=S.t; sfx('gift',{rate:GIFT_STEPS[giftN]}); }
          hud(S);
          for(let i=0;i<10;i++)S.parts.push({k:'sp',x:cx-px,y:cy,vx:rnd(-120,120),vy:rnd(-160,40),life:rnd(.4,.8)});
        }
      }
    }
  }
  function fir(x,base,h,col,snow){
    const w=h*.42;
    for(let i=0;i<3;i++){
      const top=base-h+i*h*.26, bw=w*(0.55+i*0.28), by=top+h*.46;
      ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+bw,by);ctx.lineTo(x-bw,by);ctx.closePath();ctx.fill();
      if(snow){ctx.fillStyle='rgba(235,243,255,.9)';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+bw*.45,top+h*.2);ctx.quadraticCurveTo(x,top+h*.25,x-bw*.45,top+h*.2);ctx.closePath();ctx.fill();
        ctx.fillRect(x-bw,by-3,bw*2,3);}
    }
    ctx.fillStyle='#2a1d18';ctx.fillRect(x-4,base-8,8,10);
  }
  // Сердечко-жизнь: пульсирует и светится розовым, чтобы отличаться от подарков
  function lifeHeart(x,y,t){
    const cx=x+13, cy=y+12+Math.sin(t*4+x*.02)*3, d=LIFE_D*(1+.08*Math.sin(t*7));
    const g=ctx.createRadialGradient(cx,cy,2,cx,cy,d); g.addColorStop(0,'rgba(255,120,150,.55)'); g.addColorStop(1,'rgba(255,120,150,0)');
    ctx.fillStyle=g; ctx.fillRect(cx-d,cy-d,d*2,d*2);
    if(F.heart){ctx.drawImage(F.heart,cx-d/2,cy-d/2,d,d);return;}
    ctx.fillStyle='#e8473f'; ctx.beginPath(); ctx.moveTo(cx,cy+d*.4); ctx.bezierCurveTo(cx-d*.7,cy-d*.1,cx-d*.3,cy-d*.55,cx,cy-d*.22); ctx.bezierCurveTo(cx+d*.3,cy-d*.55,cx+d*.7,cy-d*.1,cx,cy+d*.4); ctx.fill();
  }
  // Яма в снегу: темный провал с ледяными стенками и снежными кромками
  function pit(o,sx){
    const x0=sx, x1=sx+o.w, y0=GROUND-1;
    const g=ctx.createLinearGradient(0,y0,0,LH); g.addColorStop(0,'#0d1a44'); g.addColorStop(1,'#02050f');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y0); ctx.lineTo(x1-8,LH); ctx.lineTo(x0+8,LH); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(150,195,250,.35)'; ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x0+7,y0); ctx.lineTo(x0+12,LH); ctx.lineTo(x0+8,LH); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1,y0); ctx.lineTo(x1-7,y0); ctx.lineTo(x1-12,LH); ctx.lineTo(x1-8,LH); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(215,235,255,.9)';
    for(const [ex,dir] of [[x0,1],[x1,-1]]) for(let i=0;i<3;i++){const ix=ex+dir*(5+i*6), il=7+((i*7+Math.round(o.w))%5)*2; ctx.beginPath(); ctx.moveTo(ix-2.5,y0+3); ctx.lineTo(ix+2.5,y0+3); ctx.lineTo(ix,y0+3+il); ctx.closePath(); ctx.fill();}
    ctx.fillStyle='#f4f8ff'; ctx.beginPath(); ctx.ellipse(x0-2,y0+2,13,6,0,0,7); ctx.ellipse(x1+2,y0+2,13,6,0,0,7); ctx.fill();
  }
  // Платформа: PNG или заглушка по профилю верха. base — на какой высоте ее низ (верхнее бревно двухэтажного препятствия)
  // Длиннее картинки — собирается из кусков: левый край и первая середина, повторы середины внахлест, правый край
  function platform(o,sx){
    const img=o.png&&F.pf[o.type], base=o.base||0;
    if(img){
      const y0=GROUND-base-o.ih+OB_SINK, k=o.ih/img.naturalHeight, P=F.pfSl[o.type];
      if(!P||o.w<=img.naturalWidth*k+1){ctx.drawImage(img,sx,y0,o.w,o.ih);return;}
      ctx.drawImage(img,0,0,P.b,img.naturalHeight,sx,y0,P.b*k,o.ih);
      const xR=sx+o.w-P.cap.width*k, stop=xR+P.o*k;
      ctx.save(); ctx.beginPath(); ctx.rect(sx,y0-40,stop-sx,o.ih+80); ctx.clip();
      for(let e=sx+P.b*k,i=0;e<stop;i++){const m=P.mid[(i*3+o.seed)%P.mid.length]; ctx.drawImage(m,e-P.o*k,y0,m.width*k,o.ih); e+=(m.width-P.o)*k;}
      ctx.restore();
      ctx.drawImage(P.cap,xR,y0,P.cap.width*k,o.ih);
      return;
    }
    const n=o.prof.length-1, g=GROUND-base;
    ctx.fillStyle=o.type==='log'?'#6b3f22':'#e8f0ff';
    ctx.beginPath(); ctx.moveTo(sx,g+2);
    o.prof.forEach((q,i)=>ctx.lineTo(sx+o.w*i/n,g-o.h*q));
    ctx.lineTo(sx+o.w,g+2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#f4f8ff'; ctx.lineWidth=7; ctx.lineCap='round'; ctx.beginPath();
    o.prof.forEach((q,i)=>{if(q<.5)return; const X=sx+o.w*i/n, Y=g-o.h*q+2; ctx.lineTo(X,Y);}); ctx.stroke();
  }
  // Ель из PNG: x — середина, base — где ствол уходит в снег
  function treeImg(im,x,base,h){const w=h*(im.naturalWidth||im.width)/(im.naturalHeight||im.height); ctx.drawImage(im,x-w/2,base-h,w,h);}
  // Избушка на ближнем слое фона: теплый свет в окнах и дымок из трубы
  function izba(i,x,t){
    const k=Math.floor(hsh(i,SEED+25)*F.izba.length), im=F.izba[k], h=96+14*hsh(i,SEED+28), w=h*im.naturalWidth/im.naturalHeight, x0=x-w/2, y0=GROUND+6-h;
    const pipe=FOREST_IZBA_PIPE[k];
    if(pipe){ for(let j=0;j<5;j++){const ph=(t*.32+j/5)%1, px=x0+w*pipe[0]+ph*14+Math.sin(ph*5+j)*3, py=y0+h*pipe[1]-ph*70, r=3+ph*9;
      ctx.fillStyle=`rgba(205,218,245,${(.32*(1-ph)).toFixed(3)})`; ctx.beginPath(); ctx.arc(px,py,r,0,7); ctx.fill();} }
    ctx.drawImage(im,x0,y0,w,h);
    ctx.save(); ctx.globalCompositeOperation='lighter';
    for(const [fx,fy] of FOREST_IZBA_WIN[k]||[]){const gx=x0+w*fx, gy=y0+h*fy, g=ctx.createRadialGradient(gx,gy,1,gx,gy,22); g.addColorStop(0,'rgba(255,190,90,.38)'); g.addColorStop(1,'rgba(255,170,70,0)'); ctx.fillStyle=g; ctx.fillRect(gx-22,gy-22,44,44);}
    ctx.restore();
  }
  // Гирлянда на наряженной елке мерцает: у каждого огонька своя фаза
  function twinkle(im,x,base,h,i,t){
    const w=h*im.naturalWidth/im.naturalHeight, x0=x-w/2, y0=base-h;
    ctx.save(); ctx.globalCompositeOperation='lighter';
    FOREST_DECO_LIGHTS.forEach(([fx,fy],j)=>{const a=.18+.22*Math.sin(t*2.6+j*1.7+i), gx=x0+w*fx, gy=y0+h*fy;
      if(a<=0)return; const g=ctx.createRadialGradient(gx,gy,.5,gx,gy,6); g.addColorStop(0,`rgba(255,215,140,${a.toFixed(3)})`); g.addColorStop(1,'rgba(255,190,90,0)'); ctx.fillStyle=g; ctx.fillRect(gx-6,gy-6,12,12);});
    ctx.restore();
  }
  function lamp(x){
    if(F.lamp){
      const h=LAMP_H, w=h*F.lamp.naturalWidth/F.lamp.naturalHeight, x0=x-w/2, y0=GROUND+2-h;
      const lx=x0+w*FOREST_LAMP_LIGHT[0], ly=y0+h*FOREST_LAMP_LIGHT[1];
      const g=ctx.createRadialGradient(lx,ly,2,lx,ly,46); g.addColorStop(0,'rgba(255,214,130,.42)'); g.addColorStop(1,'rgba(255,200,110,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(lx,ly,46,0,7); ctx.fill();
      ctx.drawImage(F.lamp,x0,y0,w,h); return;
    }
    ctx.fillStyle='rgba(255,200,110,.18)';ctx.beginPath();ctx.arc(x,GROUND-70,36,0,7);ctx.fill();ctx.fillStyle='#2a1d18';ctx.fillRect(x-2,GROUND-64,4,64);ctx.fillStyle='#ffd27a';ctx.fillRect(x-7,GROUND-80,14,16);
  }
  function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill();}
  // Кадр медведя: столкновение → прыжок или падение → стойка до старта → бег. null — PNG нет, рисуем вектор
  function bearFrame(){
    const R=F.run; if(!R.length) return null;
    if((S.stun>0||S.out)&&F.hit) return F.hit;
    if(!S.ground) return S.vy<0?(F.jump||R[0]):(F.fall||F.jump||R[0]);
    if(!S.run) return F.idle||R[0];
    return R[Math.floor(S.ph/RUN_CYCLE*R.length)]||R[0];
  }
  // Векторная заглушка медведя — пока нет bear_run_1.png
  function runner(t,ground,running){
    const ph=t*13, sw=running?Math.sin(ph):0;
    const bw=86, bh=bw*360/486, hip=-26, top=-50;
    const la=ground?sw*.8:-.6, lb=ground?-sw*.8:.5;
    const leg=(a,c)=>{ctx.save();ctx.translate(0,hip);ctx.rotate(a);ctx.fillStyle=c;rr(-7,-2,14,22,6);ctx.fillStyle='#3d2414';rr(-8,15,20,11,4);ctx.fillStyle='#f3f6ff';ctx.fillRect(-8,14,20,3);ctx.restore();};
    const arm=(x,a,c)=>{ctx.save();ctx.translate(x,top+4);ctx.rotate(a);ctx.fillStyle=c;rr(-6,0,12,24,6);ctx.fillStyle='#f3f6ff';rr(-7,18,14,6,3);ctx.fillStyle='#9a6a3e';ctx.beginPath();ctx.arc(0,27,5.5,0,7);ctx.fill();ctx.restore();};
    leg(lb,'#7a4c2a');
    arm(-27,ground?-sw*.9:-.9,'#1d3c90');
    ctx.fillStyle='#2448a8';ctx.beginPath();ctx.moveTo(-30,top);ctx.lineTo(30,top);ctx.lineTo(34,hip+4);ctx.lineTo(-34,hip+4);ctx.closePath();ctx.fill();
    ctx.fillStyle='#f3f6ff';rr(-35,hip-1,70,7,3);ctx.fillRect(-3,top,6,hip-top);
    ctx.fillStyle='rgba(255,255,255,.8)';[[-18,-40],[-14,-32],[18,-40],[14,-32]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill();});
    leg(la,'#8a5a34');
    if(head.complete&&head.naturalWidth)ctx.drawImage(head,-bw/2,top-bh+14,bw,bh); else {ctx.fillStyle='#b98a5e';ctx.beginPath();ctx.arc(0,top-24,26,0,7);ctx.fill();}
    arm(27,ground?sw*.9:.9,'#2650b8');
  }
  // Подарок: x, y — левый верхний угол прежней коробки 26×26, центр — (x+13, y+12)
  function gift(x,y,c,t){
    y+=Math.sin(t*4+x*.02)*3;
    const img=F.gifts.length?F.gifts[c%F.gifts.length]:null;
    if(img){
      const cx=x+13, cy=y+12, k=GIFT_D/Math.max(img.naturalWidth,img.naturalHeight), w=img.naturalWidth*k, h=img.naturalHeight*k;
      const g=ctx.createRadialGradient(cx,cy,2,cx,cy,GIFT_D*.8);g.addColorStop(0,'rgba(255,220,140,.5)');g.addColorStop(1,'rgba(255,220,140,0)');
      ctx.fillStyle=g;ctx.fillRect(cx-GIFT_D,cy-GIFT_D,GIFT_D*2,GIFT_D*2);
      ctx.drawImage(img,cx-w/2,cy-h/2,w,h);
      return;
    }
    const cols=['#d8423a','#2f56c8','#e9bd68','#7a46c8','#d8423a'];
    ctx.save();ctx.shadowColor='rgba(255,220,140,.7)';ctx.shadowBlur=14;
    ctx.fillStyle=cols[c%cols.length];ctx.fillRect(x,y+6,26,20);ctx.fillRect(x-2,y+2,30,7);
    ctx.restore();
    ctx.fillStyle='#fde7a8';ctx.fillRect(x+11,y+2,4,24);ctx.fillRect(x-2,y+4,30,3);
    ctx.beginPath();ctx.ellipse(x+8,y,6,4,-.5,0,7);ctx.ellipse(x+18,y,6,4,.5,0,7);ctx.fill();
  }
  function obstacle(o,sx){
    const y=GROUND-o.h, img=o.png&&F.ob[o.type];
    if(img){ if(o.type==='drift'){ // сугроб подкрашен в ледяной синий и обведен тенью: на белом снегу его видно издалека
        if(!F.driftTint){const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(40,96,214,.34)';x.fillRect(0,0,c.width,c.height);F.driftTint=c;}
        ctx.save();ctx.shadowColor='rgba(6,16,64,1)';ctx.shadowBlur=10;ctx.shadowOffsetY=-2;ctx.drawImage(F.driftTint,sx,y+OB_SINK,o.w,o.h);ctx.restore();} else ctx.drawImage(img,sx,y+OB_SINK,o.w,o.h); return;} // низ картинки чуть утоплен в снег
    if(o.type==='log'){
      ctx.fillStyle='#6b3f22';ctx.beginPath();ctx.roundRect?ctx.roundRect(sx,y,o.w,o.h,14):ctx.rect(sx,y,o.w,o.h);ctx.fill();
      ctx.fillStyle='#8a5631';ctx.fillRect(sx+10,y+8,o.w-26,4);ctx.fillRect(sx+16,y+20,o.w-34,3);
      ctx.fillStyle='#c99868';ctx.beginPath();ctx.ellipse(sx+o.w-10,y+o.h/2,10,o.h/2-2,0,0,7);ctx.fill();
      ctx.strokeStyle='#8a5631';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx+o.w-10,y+o.h/2,5,o.h/4,0,0,7);ctx.stroke();
      ctx.fillStyle='#f2f6ff';ctx.beginPath();ctx.ellipse(sx+o.w/2-6,y+2,o.w/2-8,7,0,Math.PI,0);ctx.fill();
    } else if(o.type==='stump'){
      ctx.fillStyle='#5b351d';ctx.fillRect(sx,y+6,o.w,o.h-6);
      ctx.fillStyle='#7a4a2a';ctx.fillRect(sx+8,y+12,5,o.h-14);ctx.fillRect(sx+24,y+16,4,o.h-18);
      ctx.fillStyle='#f2f6ff';ctx.beginPath();ctx.ellipse(sx+o.w/2,y+6,o.w/2+5,9,0,0,7);ctx.fill();
    } else {
      const g=ctx.createLinearGradient(0,y,0,GROUND);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#bcd0f0');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(sx,GROUND);ctx.quadraticCurveTo(sx+10,y,sx+o.w*.45,y);ctx.quadraticCurveTo(sx+o.w-6,y+2,sx+o.w,GROUND);ctx.fill();
      ctx.fillStyle='rgba(150,200,255,.8)';ctx.beginPath();ctx.moveTo(sx+o.w*.3,y+8);ctx.lineTo(sx+o.w*.38,y-10);ctx.lineTo(sx+o.w*.46,y+8);ctx.fill();
    }
  }
  function draw(){
    ctx.setTransform(dpr*sc,0,0,dpr*sc,0,dpr*sc*TOP);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    const SH=LH+TOP;
    const t=S.t, d=S.dist;
    const sky=ctx.createLinearGradient(0,-TOP,0,LH);sky.addColorStop(0,'#060e2c');sky.addColorStop(.62,'#1a2f6b');sky.addColorStop(1,'#2b4590');
    ctx.fillStyle=sky;ctx.fillRect(0,-TOP,LW,SH);
    for(const s of stars){ctx.globalAlpha=.4+.6*Math.abs(Math.sin(t*1.2+s.p));ctx.fillStyle='#fff';ctx.fillRect(s.x*LW,s.y*SH-TOP,s.r,s.r);} ctx.globalAlpha=1;
    // aurora
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(0,-TOP*.55);
    for(let b=0;b<2;b++){
      const g=ctx.createLinearGradient(0,30,0,190);g.addColorStop(0,'rgba(80,255,200,0)');g.addColorStop(.5,b?'rgba(90,170,255,.16)':'rgba(80,255,190,.2)');g.addColorStop(1,'rgba(80,255,200,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,160);
      for(let x=0;x<=LW;x+=20){ctx.lineTo(x,70+b*30+Math.sin(x*.008+t*.4+b)*28);}
      for(let x=LW;x>=0;x-=20){ctx.lineTo(x,150+b*20+Math.sin(x*.01+t*.3+b*2)*20);}
      ctx.fill();
    }
    ctx.restore();
    // moon
    const mx=LW*.82, my=64-TOP*.7; ctx.fillStyle='rgba(255,240,200,.12)';ctx.beginPath();ctx.arc(mx,my,48,0,7);ctx.fill();
    ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(mx,my,24,0,7);ctx.fill();ctx.fillStyle='#14245a';ctx.beginPath();ctx.arc(mx+10,my-6,22,0,7);ctx.fill();
    // mountains — бесконечная цепочка вершин, высота каждой — из хеша ее номера
    ctx.fillStyle='#152660';ctx.beginPath();
    {const m0=d*.08, i0=Math.floor(m0/120)-1, i1=Math.ceil((m0+LW)/120)+1; ctx.moveTo(i0*120-m0,GROUND-40);
     for(let i=i0;i<=i1;i++){const x=i*120-m0; ctx.lineTo(x,GROUND-120-70*hsh(i,SEED+11));ctx.lineTo(x+60,GROUND-60);}
     ctx.lineTo(LW+60,GROUND);ctx.lineTo(i0*120-m0,GROUND);ctx.fill();}
    // far trees — ячейки по 48: ель случайной формы и высоты, местами поляны разной ширины
    {const f0=d*.25, i0=Math.floor((f0-70)/48), i1=Math.ceil((f0+LW+70)/48);
     for(let i=i0;i<=i1;i++){
       if(hsh(i,SEED+31)<.1+.32*hsh(Math.floor(i/9),SEED+32)) continue;
       const x=i*48+(hsh(i,SEED+33)-.5)*26-f0, h=(58+56*hsh(i,SEED+34))*1.1, k=Math.floor(hsh(i,SEED+35)*9);
       const im=F.treesFar.length?F.treesFar[k%F.treesFar.length]:null; if(im)treeImg(im,x,GROUND-8,h); else fir(x,GROUND-14,h/1.1,'#11214f',true);}}
    // near layer: сначала избушки (за елками), потом деревья, потом фонари, снеговики и кусты
    {const n0=d*.55, i0=Math.floor((n0-220)/NEAR), i1=Math.ceil((n0+LW+220)/NEAR), X=i=>i*NEAR+(hsh(i,SEED+23)-.5)*60-n0;
     for(let i=i0;i<=i1;i++) if(isIzba(i)) izba(i,X(i)+25,t);
     for(let i=i0;i<=i1;i++){
       const kind=nearKind(i), x=X(i); if(kind==='gap'||isIzba(i)||isIzba(i-1)) continue;
       const h=(118+74*hsh(i,SEED+24))*1.1, k=Math.floor(hsh(i,SEED+26)*9);
       let im=F.trees.length?F.trees[k%F.trees.length]:null;
       if(kind==='birch'&&F.birch) im=F.birch;
       if(kind==='deco'&&F.treeDeco){im=F.treeDeco; const g=ctx.createRadialGradient(x,GROUND-h*.45,4,x,GROUND-h*.45,h*.55); g.addColorStop(0,'rgba(255,200,120,.2)'); g.addColorStop(1,'rgba(255,200,120,0)'); ctx.fillStyle=g; ctx.fillRect(x-h*.6,GROUND-h,h*1.2,h);}
       if(im)treeImg(im,x,GROUND+8,kind==='birch'?h*1.04:h); else fir(x,GROUND+4,h/1.1,'#173a5c',true);
       if(kind==='deco'&&im&&im===F.treeDeco) twinkle(im,x,GROUND+8,h,i,t);
     }
     for(let i=i0;i<=i1;i++){
       const kind=nearKind(i), x=X(i);
       if(hasLamp(i)) lamp(x+50);
       if(kind==='snowman'&&F.snowman&&!isIzba(i-1)) treeImg(F.snowman,x+34,GROUND+6,58);
       if(kind==='bush'&&F.bush&&!isIzba(i-1)) treeImg(F.bush,x-22,GROUND+6,40+12*hsh(i,SEED+27));
     }}
    // ground
    const gg=ctx.createLinearGradient(0,GROUND,0,LH);gg.addColorStop(0,'#eef4ff');gg.addColorStop(1,'#9fb8e6');
    ctx.fillStyle=gg;ctx.fillRect(0,GROUND,LW,LH-GROUND);
    ctx.fillStyle='rgba(255,255,255,.9)';const go=d%60;for(let x=-go;x<LW;x+=60){ctx.beginPath();ctx.ellipse(x,GROUND+2,26,5,0,0,7);ctx.fill();}
    ctx.fillStyle='rgba(120,150,210,.35)';const go2=d%140;for(let x=-go2;x<LW;x+=140){ctx.fillRect(x,GROUND+30,40,2);}
    for(const o of S.objs){if(o.k!=='pit')continue; const sx=o.x-d; if(sx+o.w<-20||sx>LW+20)continue; pit(o,sx);}
    // objects
    for(const o of S.objs){const sx=o.x-d; if(sx+(o.w||40)<-40||sx>LW+120||o.k==='pit')continue; if(o.k==='pf')platform(o,sx); else if(o.k==='ob')obstacle(o,sx); else if(o.k==='life')lifeHeart(sx,o.y,t); else gift(sx,o.y,o.c,t);}
    // player
    const fr=bearFrame(), sy=surfAt(d+PX,S.py);
    if(sy<=GROUND){ctx.fillStyle='rgba(20,40,90,.28)';ctx.beginPath();ctx.ellipse(PX,sy+4,(fr?40:34)*(S.ground?1:.7),7,0,0,7);ctx.fill();}
    if(!(S.inv>0&&Math.floor(S.t*14)%2)){
      if(fr&&S.flip>0){                                                  // сальто на втором прыжке: полный оборот вперед вокруг середины медведя
        const w=BEAR_H*fr.naturalWidth/fr.naturalHeight, a=(1-S.flip/FLIP), e=a<.5?2*a*a:1-2*(1-a)*(1-a);
        ctx.save(); ctx.translate(PX,S.py-BEAR_H/2+BEAR_SINK); ctx.rotate(e*Math.PI*2); ctx.drawImage(fr,-w/2,-BEAR_H/2,w,BEAR_H); ctx.restore();
      }
      else if(fr){const w=BEAR_H*fr.naturalWidth/fr.naturalHeight; ctx.drawImage(fr,PX-w/2,S.py-BEAR_H+BEAR_SINK,w,BEAR_H);}
      else{
        const bob=S.ground&&S.run?Math.abs(Math.sin(t*13))*-4:0;
        ctx.save();ctx.translate(PX,S.py+bob);ctx.rotate(S.ground?Math.sin(t*13)*.03:-.1);
        runner(t,S.ground,S.run);
        ctx.restore();
      }
    }
    // particles
    for(const p of S.parts){
      if(p.k==='sp'){ctx.globalAlpha=Math.max(0,p.life*1.4);ctx.fillStyle='#fff3c9';ctx.fillRect(p.x,p.y,3,3);}
      else{ctx.globalAlpha=Math.min(1,p.life*1.5);ctx.fillStyle=p.c;ctx.font='700 20px "PT Serif", Georgia, serif';ctx.fillText(p.t,p.x,p.y);}
    } ctx.globalAlpha=1;
    // передний план: детали в снегу у нижнего края экрана. Они ближе медведя — едут чуть быстрее земли (×1.2) и ничего не закрывают: верх не выше GROUND+34
    // Редко: деталь — примерно в каждой пятой ячейке по 180 единиц, 26–42 единицы в высоту
    if(F.fg.length){const FC=180, f0=d*1.2, i0=Math.floor((f0-140)/FC), i1=Math.ceil((f0+LW+140)/FC);
      for(let i=i0;i<=i1;i++){
        if(hsh(i,SEED+41)<.8) continue;
        const im=F.fg[Math.floor(hsh(i,SEED+42)*F.fg.length)], hh=26+16*hsh(i,SEED+43), w=hh*im.naturalWidth/im.naturalHeight;
        const x=i*FC+(hsh(i,SEED+44)-.5)*80-f0, base=Math.max(GROUND+34+hh,LH+2+6*hsh(i,SEED+45));
        if(hsh(i,SEED+46)<.5){ctx.save();ctx.translate(x,0);ctx.scale(-1,1);ctx.drawImage(im,-w/2,base-hh,w,hh);ctx.restore();}
        else ctx.drawImage(im,x-w/2,base-hh,w,hh);
      }}
    // falling snow
    ctx.fillStyle='rgba(255,255,255,.85)';
    for(const f of flakes){const y=(f.y*SH+t*f.v)%SH-TOP; const x=((f.x*LW-d*.3*f.w*.2+Math.sin(t+f.w)*10)%LW+LW)%LW; ctx.beginPath();ctx.arc(x,y,f.r,0,7);ctx.fill();}
  }
  // Панель в углу поля: жизни, подарки и полоска до рекорда. Рисуется в пикселях экрана — одинаково читается на телефоне и компьютере
  function hudDraw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const x0=10, y0=10, hs=22, gap=4, rec=S.best>0;
    const giftX=x0+12+3*(hs+gap)+10, cnt=String(S.gifts), over=rec&&S.gifts>S.best;
    const label=!rec?'Каждый подарок — 10 баллов':over?`Новый рекорд, +${(S.gifts-S.best)*10} баллов`:S.gifts===S.best?'Рекорд повторен, дальше +10 за подарок':`До рекорда ${S.best-S.gifts} ${plural(S.best-S.gifts,'подарок','подарка','подарков')}`;
    // таймер забега: время бега без пауз и экрана «Готовы?»
    const sec=Math.floor(S.rt||0), tm=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
    ctx.font='500 11px '+UI_FONT; const lw=ctx.measureText(label).width;
    ctx.font='700 19px '+UI_FONT; const cw=ctx.measureText(cnt).width;
    ctx.font='700 15px '+UI_FONT; const tw=ctx.measureText(tm).width;
    const pw=Math.max(170, giftX-x0+30+cw+18+18+tw+12, lw+24), ph=58;
    ctx.fillStyle='rgba(8,16,44,.6)'; ctx.strokeStyle='rgba(233,189,104,.55)'; ctx.lineWidth=1;
    ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(x0,y0,pw,ph,12); else ctx.rect(x0,y0,pw,ph); ctx.fill(); ctx.stroke();
    for(let i=0;i<3;i++){
      const hx=x0+12+i*(hs+gap), hy=y0+8; ctx.globalAlpha=i<S.lives?1:.22;
      if(F.heart) ctx.drawImage(F.heart,hx,hy,hs,hs);
      else {ctx.fillStyle='#e8473f'; ctx.beginPath(); ctx.moveTo(hx+hs/2,hy+hs*.9); ctx.bezierCurveTo(hx-hs*.2,hy+hs*.35,hx+hs*.2,hy-hs*.1,hx+hs/2,hy+hs*.28); ctx.bezierCurveTo(hx+hs*.8,hy-hs*.1,hx+hs*1.2,hy+hs*.35,hx+hs/2,hy+hs*.9); ctx.fill();}
    }
    ctx.globalAlpha=1;
    const gi=F.gifts[0];
    if(gi) ctx.drawImage(gi,giftX,y0+6,24,24); else {ctx.fillStyle='#d8423a'; ctx.fillRect(giftX+3,y0+11,18,15); ctx.fillStyle='#fde7a8'; ctx.fillRect(giftX+10,y0+9,4,17);}
    ctx.fillStyle='#fde7a8'; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillText(cnt,giftX+30,y0+19);
    // часы и время — справа в верхней строке панели
    const tx=x0+pw-12-tw, cx=tx-10, cy=y0+19;
    ctx.strokeStyle='rgba(243,201,107,.9)'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(cx,cy,6.2,0,7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-3.6); ctx.lineTo(cx,cy); ctx.lineTo(cx+2.6,cy+1.6); ctx.stroke();
    ctx.font='700 15px '+UI_FONT; ctx.fillStyle='rgba(235,240,255,.95)'; ctx.fillText(tm,tx,cy+.5);
    ctx.font='700 19px '+UI_FONT;
    // полоска: сколько осталось до рекорда; баллы начисляются только за подарки сверх него
    const bx=x0+12, by=y0+38, bw=pw-24, bh=6, k=rec?Math.min(1,S.gifts/S.best):0;
    if(rec){ctx.fillStyle='rgba(255,255,255,.14)'; ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(bx,by,bw,bh,3); else ctx.rect(bx,by,bw,bh); ctx.fill();}
    if(k>0){const g=ctx.createLinearGradient(bx,0,bx+bw,0); g.addColorStop(0,'#f6d27a'); g.addColorStop(1,'#e09a3e'); ctx.fillStyle=g; ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(bx,by,bw*k,bh,3); else ctx.rect(bx,by,bw*k,bh); ctx.fill();}
    ctx.font='500 11px '+UI_FONT; ctx.fillStyle=over?'#fde7a8':'rgba(225,232,255,.85)';
    ctx.fillText(label,bx,rec?by+bh+8:by+3);
    ctx.textBaseline='alphabetic';
  }
  function loop(ts){
    if(!alive) return;
    const dt=Math.min(.033,(ts-(last||ts))/1000); last=ts;
    update(dt); draw(); hudDraw(); raf=requestAnimationFrame(loop);
  }
  raf=requestAnimationFrame(loop);
  const onKey=e=>{
    if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault(); if(e.type==='keydown'&&!e.repeat) jump();}   // зажатая клавиша и отпускание — не второй прыжок
    if(['ArrowRight','KeyD'].includes(e.code)){e.preventDefault();setBoost(e.type==='keydown');}
  };
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',onKey);
  function setBoost(v){ if(v&&!S.boost&&S.run&&!S.paused)sfx('boost'); S.boost=v; }
  const onTap=e=>{e.preventDefault();jump();};
  canvas.addEventListener('pointerdown',onTap);
  return {
    start(){giftN=0;giftT=-9;Object.assign(S,{run:true,done:false,dist:0,rt:0,v0:V0,gifts:0,score:0,cleared:0,objs:[],parts:[],next:520,jumpAt:-1e9,lowAt:-1e9,lifeAt:-1e9,hitAt:-1e9,bk:1,best:hooks.best?(+hooks.best()||0):0,stun:0,inv:0,early:false,out:false,lives:3,py:GROUND,vy:0,ground:true,paused:false,ph:0,boost:false,dj:false,flip:0});hud(S);},
    jump, boost:setBoost, state:S,
    // Пауза: телефон повернули вертикально или ушли из вкладки. Мир замирает, ускорение отпускается
    pause(){if(S.run&&!S.paused){S.paused=true;S.boost=false;S.bk=1;}},
    resume(){if(S.paused){S.paused=false;S.boost=false;last=0;}},
    finish(){if(S.run){S.run=false;S.paused=false;S.done=true;S.early=true;hooks.end(S);}},
    destroy(){alive=false;cancelAnimationFrame(raf);if(ro)ro.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onKey);}
  };
}

