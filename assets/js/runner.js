/* Отдельная страница раннера «Лес»: только игра, без платформы и прототипа. Рекорд хранится в этом браузере. */
(function(){
  var cv=document.getElementById('cv'), ov=document.getElementById('ov'), bStart=document.getElementById('bStart'),
      bJump=document.getElementById('bJump'), bFwd=document.getElementById('bFwd'), bSnd=document.getElementById('bSnd');
  var BEST_KEY='psb-forest-best', best=0;
  try{best=+localStorage.getItem(BEST_KEY)||0;}catch(e){}

  // высота поля: на компьютере — чтобы влезало в окно, на телефоне горизонтально — почти весь экран
  function fit(){
    var land=window.matchMedia&&matchMedia('(orientation:landscape) and (max-height:500px)').matches;
        var vh=(window.visualViewport&&visualViewport.height)||window.innerHeight;   // видимая высота: без панелей браузера
    cv.dataset.vfit='';
    cv.dataset.maxh=String(Math.max(land?160:300,Math.min(640,vh-(land?16:230))));
  }
  fit(); window.addEventListener('resize',fit);
  if(window.visualViewport) visualViewport.addEventListener('resize',function(){fit();window.dispatchEvent(new Event('resize'));});

  function mmss(t){t=Math.round(t||0);return Math.floor(t/60)+':'+(t%60<10?'0':'')+(t%60);}
  function word(n){var m=n%10,h=n%100;if(m===1&&h!==11)return 'подарок';if(m>=2&&m<=4&&(h<12||h>14))return 'подарка';return 'подарков';}

  var game=ForestGame(cv,{
    end:function(S){
      ForestSound.musicPause();
      var rec=S.gifts>best;
      if(rec){best=S.gifts;try{localStorage.setItem(BEST_KEY,String(best));}catch(e){} ForestSound.play('record');}
      else if(S.out) ForestSound.play('over');
      document.getElementById('ovT').textContent=rec?'Новый рекорд!':(S.out?'Попытки закончились':'Забег окончен');
      document.getElementById('rGifts').textContent=S.gifts;
      document.querySelector('#rGifts+span').textContent=word(S.gifts);
      document.getElementById('rBest').textContent=best;
      document.getElementById('rTime').textContent=mmss(S.rt);
      document.getElementById('ovRes').classList.remove('hidden');
      document.getElementById('ovHint').style.display='none';
      bStart.textContent='Ещё забег';
      ov.classList.remove('hidden');
    },
    sfx:function(n,o){ForestSound.play(n,o);},
    best:function(){return best;}
  });

  var paused=false;
  function start(){
    ForestSound.unlock();
    ov.classList.add('hidden');
    if(paused){paused=false;game.resume();}else game.start();
    ForestSound.musicPlay();
  }
  bStart.addEventListener('click',start);
  document.addEventListener('keydown',function(e){
    if(!ov.classList.contains('hidden')&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();start();}
  });

  // сенсорные кнопки: прыжок по нажатию, ускорение пока держишь
  bJump.addEventListener('pointerdown',function(e){e.preventDefault();game.jump();});
  function on(e){e.preventDefault();if(!game.state.run||game.state.paused)return;bFwd.classList.add('on');game.boost(true);}
  function off(){bFwd.classList.remove('on');game.boost(false);}
  bFwd.addEventListener('pointerdown',on);bFwd.addEventListener('pointerup',off);bFwd.addEventListener('pointerleave',off);bFwd.addEventListener('pointercancel',off);
  [bJump,bFwd].forEach(function(b){b.addEventListener('contextmenu',function(e){e.preventDefault();});});

  // звук
  function sndUi(){bSnd.className='snd '+(ForestSound.on?'on':'off');}
  bSnd.addEventListener('click',function(){ForestSound.set(!ForestSound.on);sndUi();});
  sndUi();

  // пауза: кнопкой на поле, клавишей P или Esc, а также когда ушли со вкладки; продолжаем по кнопке
  var bPause=document.getElementById('bPause');
  function pauseNow(){
    if(game.state.run&&!game.state.paused){game.pause();ForestSound.musicPause();
      document.getElementById('ovT').textContent='Пауза';document.getElementById('ovRes').classList.add('hidden');
      document.getElementById('ovHint').style.display='none';
      bStart.textContent='Продолжить';paused=true;ov.classList.remove('hidden');}
  }
  bPause.addEventListener('click',pauseNow);
  document.addEventListener('keydown',function(e){if(e.code==='KeyP'||e.code==='Escape')pauseNow();});
  document.addEventListener('visibilitychange',function(){if(document.hidden)pauseNow();});

  // пока картинки не загрузились, забег не начинаем: иначе вместо Бориса мелькает заглушка
  bStart.disabled=true; bStart.textContent='Загружаем…';
  var ready=function(){bStart.disabled=false; if(bStart.textContent==='Загружаем…')bStart.textContent='Бежать!';};
  loadForestArt().then(ready,ready);
})();
