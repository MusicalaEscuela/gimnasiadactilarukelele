/* Gimnasia dactilar para ukelele · Musicala
 * Secuencias fieles a la guía: individuales 1-2-3-4,
 * dobles 12-23-34, intermedios 13-24-14; cuatro vueltas por grupo.
 * El diagrama usa una sola cuerda y cuatro trastes consecutivos.
 */
(() => {
  'use strict';
  const GROUPS = [
    {title:'Individuales',patterns:[[1],[2],[3],[4]],subtitle:'Un dedo a la vez'},
    {title:'Dobles',patterns:[[1,2],[2,3],[3,4]],subtitle:'Dos dedos consecutivos'},
    {title:'Intermedios',patterns:[[1,3],[2,4],[1,4]],subtitle:'Dedos alternados'}
  ];
  const STORAGE_KEY='musicala-ukelele-gimnasia-v1';
  const $=(s)=>document.querySelector(s);
  const $$=(s)=>Array.from(document.querySelectorAll(s));
  const colors=['#0C41C4','#5729FF','#680DBF','#CE0071'];
  const saved=(() => {try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null}})();
  const state={
    selectedGroup:0,
    steps:Array.isArray(saved?.steps) && saved.steps.length===3 ? saved.steps.map((n,i)=>Math.max(0,Math.min(GROUPS[i].patterns.length*4,Number(n)||0))) : [0,0,0],
    string:'3',
    startFret:5,
    timer:null
  };
  const groupButtons=$$('.group-tab');
  const board=$('#fretboard');
  const total=GROUPS.reduce((sum,g)=>sum+g.patterns.length*4,0);
  const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({steps:state.steps}))}catch{}};
  function renderBoard(raised,complete){
    const xs=[182,333,484,634];
    const ys=[111,157,203,249];
    const selected=Number(state.string);
    const fret=state.startFret;
    const strings=['G','C','E','A'];
    let svg=`<title>Posición de los dedos para el ejercicio</title><desc>Cuatro cuerdas G, C, E y A. Los dedos representados por círculos llenos están apoyados. Los círculos punteados representan los dedos que debes levantar.</desc>
    <defs><linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#694959"/><stop offset=".48" stop-color="#52364b"/><stop offset="1" stop-color="#382238"/></linearGradient><filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#281550" flood-opacity=".12"/></filter></defs>
    <rect x="93" y="78" width="621" height="205" rx="17" fill="url(#wood)" stroke="#52364b" stroke-width="2"/>
    <rect x="101" y="86" width="605" height="189" rx="12" fill="none" stroke="#FFF" stroke-opacity=".38"/>
    <path d="M105 79V283M257 79V283M408 79V283M559 79V283M709 79V283" stroke="#E2D3DA" stroke-width="7" stroke-linecap="round"/>
    <path d="M105 80V283M257 80V283M408 80V283M559 80V283M709 80V283" stroke="#8E7889" stroke-width="2"/>
    <g font-family="Roboto,Arial,sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#5B496A">`;
    for(let i=0;i<4;i++)svg+=`<text x="${xs[i]}" y="61">Traste ${fret+i}</text>`;
    svg+='</g>';
    ys.forEach((y,i)=>{
      svg+=`<line x1="105" y1="${y}" x2="709" y2="${y}" stroke="${i===selected?'#FFE7A7':'#C8B8C8'}" stroke-width="${[3.2,2.6,2.2,1.8][i]}" stroke-linecap="round"/><text x="52" y="${y+6}" fill="${i===selected?'#220A63':'#685B7C'}" font-size="19" text-anchor="middle" font-weight="900" font-family="Roboto,Arial,sans-serif">${strings[i]}</text>`;
      if(i===selected)svg+=`<circle cx="51" cy="${y-17}" r="4" fill="#CE0071"/>`;
    });
    xs.forEach((x,i)=>{
      const n=i+1,isRaised=raised.includes(n) && !complete;
      const y=ys[selected], color=colors[i];
      if(isRaised){
        svg+=`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#FFE7A7" stroke-width="2" opacity=".8"/>
        <g class="fret-finger-lift">
          <circle cx="${x}" cy="${y}" r="23" fill="#fff" stroke="${color}" stroke-width="3" stroke-dasharray="5 5"/>
          <text x="${x}" y="${y+7}" fill="${color}" font-size="20" font-weight="900" text-anchor="middle" font-family="Roboto,Arial,sans-serif">${n}</text>
        </g>`;
      }else{
        svg+=`<circle cx="${x}" cy="${y}" r="23" fill="${color}" stroke="#fff" stroke-width="4" filter="url(#dotShadow)"/><text x="${x}" y="${y+7}" fill="white" font-size="20" font-weight="900" text-anchor="middle" font-family="Roboto,Arial,sans-serif">${n}</text>`;
      }
    });
    svg+=`<text x="381" y="320" text-anchor="middle" font-family="Roboto,Arial,sans-serif" font-size="12" font-weight="700" fill="#685B7C">Todos los dedos sobre la misma cuerda · apoyados a lo largo de 4 trastes</text>`;
    board.innerHTML=svg;
    board.setAttribute('aria-label',complete?'Ejercicio completado. Los cuatro dedos están apoyados.':`Levanta ${raised.join(' y ')}. Los otros dedos permanecen apoyados en la cuerda ${strings[selected]}.`);
  }
  function render(){
    const g=GROUPS[state.selectedGroup],step=state.steps[state.selectedGroup],length=g.patterns.length,finished=step>=length*4;
    const position=finished?length-1:step%length;
    const round=finished?4:Math.floor(step/length)+1;
    const raised=finished?[]:g.patterns[position];
    const allDown=[1,2,3,4].filter(n=>!raised.includes(n));
    const label=raised.join(' y ');
    $('#practice-overline').textContent=`EJERCICIO 0${state.selectedGroup+1} · ${g.title.toUpperCase()}`;
    $('#session-counter').textContent=finished?'¡4 de 4 vueltas!':`Vuelta ${round} de 4`;
    const title=$('#movement-title');
    if(finished){title.textContent='¡Ejercicio completado!';}
    else{title.textContent=`Levanta ${raised.length===1?'el dedo ':'los dedos '}`;const span=document.createElement('span');span.textContent=label;title.append(span);}
    $('#movement-description').textContent=finished?'Hiciste las cuatro vueltas de este grupo. ¡Muy bien!':`Mantén ${allDown.length===1?'el dedo '+allDown[0]+' apoyado':'los dedos '+allDown.join(', ').replace(/, ([^,]*)$/,' y $1')+' apoyados'} en la cuerda.`;
    const fingerPanel=$('#current-fingers');fingerPanel.innerHTML='';
    (finished?[1,2,3,4]:raised).forEach(n=>{const span=document.createElement('span');span.className='current-finger';span.textContent=finished?'✓':n;span.style.background=finished?'#319976':colors[n-1];fingerPanel.appendChild(span)});
    groupButtons.forEach((b,i)=>{const active=i===state.selectedGroup;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;const check=b.querySelector('.tab-check');const done=state.steps[i]>=GROUPS[i].patterns.length*4;check.textContent=done?'✓':'○';check.classList.toggle('done',done)});
    const dots=$('#move-dots');dots.innerHTML='';
    g.patterns.forEach((pat,i)=>{const el=document.createElement('div');el.className='move-dot'+(finished?' done':i===position?' active':'');el.textContent=pat.join('');el.setAttribute('aria-label',`Movimiento ${i+1}: levantar ${pat.join(' y ')}`);dots.appendChild(el)});
    const pct=Math.round(step/(length*4)*100);
    $('#move-counter').textContent=finished?'¡Completado!':`${position+1} de ${length}`;
    $('#session-progress').setAttribute('aria-valuenow',String(pct));
    $('#session-progress-bar').style.width=pct+'%';
    $('#prev-button').disabled=step===0;
    $('#next-button').innerHTML=finished ? (state.selectedGroup<2?'Ir al siguiente grupo <span aria-hidden="true">→</span>':'Repetir este grupo <span aria-hidden="true">↺</span>') : 'Siguiente movimiento <span aria-hidden="true">→</span>';
    const totalSteps=state.steps.reduce((a,b)=>a+b,0),totalPercent=Math.round(totalSteps/total*100);
    $('#total-percent').textContent=`${totalPercent}%`;
    $('#total-progress').setAttribute('aria-valuenow',String(totalPercent));
    $('#total-progress-bar').style.width=totalPercent+'%';
    const note=$('#practice-message');note.classList.toggle('success',finished);
    note.textContent=finished?'¡Completaste las cuatro vueltas! Puedes cambiar de ejercicio o repetir este grupo.':'Después de levantar los dedos indicados, apóyalos de nuevo antes de avanzar.';
    renderBoard(raised,finished);
    save();
  }
  function stopAuto(){
    if(state.timer!==null){clearInterval(state.timer);state.timer=null;}
    $('#auto-button').setAttribute('aria-pressed','false');
    $('#auto-label').textContent='Modo automático';
    $('#auto-icon').textContent='▷';
  }
  function selectGroup(index){
    if(index<0||index>=GROUPS.length)return;
    stopAuto();state.selectedGroup=index;render();
  }
  function next(){
    const i=state.selectedGroup,limit=GROUPS[i].patterns.length*4;
    if(state.steps[i]>=limit){
      stopAuto();
      if(i<GROUPS.length-1){selectGroup(i+1)}else{state.steps[i]=0;render()}
      return;
    }
    state.steps[i]++;render();
    if(state.steps[i]>=limit)stopAuto();
  }
  function previous(){
    stopAuto();const i=state.selectedGroup;
    if(state.steps[i]>0){state.steps[i]--;render()}
  }
  groupButtons.forEach(b=>b.addEventListener('click',()=>selectGroup(Number(b.dataset.group))));
  $('#next-button').addEventListener('click',next);
  $('#prev-button').addEventListener('click',previous);
  $('#string-select').addEventListener('change',e=>{state.string=e.target.value;render()});
  $('#fret-select').addEventListener('change',e=>{state.startFret=Number(e.target.value);render()});
  $('#auto-button').addEventListener('click',()=>{
    if(state.timer!==null){stopAuto();return}
    if(state.steps[state.selectedGroup]>=GROUPS[state.selectedGroup].patterns.length*4){
      $('#practice-message').textContent='Este grupo ya terminó. Avanza al siguiente o repítelo para usar el modo automático.';return;
    }
    state.timer=setInterval(next,2400);
    $('#auto-button').setAttribute('aria-pressed','true');
    $('#auto-icon').textContent='Ⅱ';
    $('#auto-label').textContent='Pausar secuencia';
  });
  $('#reset-all').addEventListener('click',()=>{
    const confirmed=window.confirm('¿Quieres borrar el avance y comenzar los tres ejercicios desde cero?');
    if(!confirmed)return;
    stopAuto();state.steps=[0,0,0];state.selectedGroup=0;render();
  });
  document.addEventListener('keydown',e=>{
    if(e.code==='Escape'&&state.timer!==null){stopAuto();return}
    if(e.code!=='Space'||e.altKey||e.ctrlKey||e.metaKey)return;
    const el=document.activeElement;
    if(el && (['BUTTON','SELECT','INPUT','TEXTAREA','A'].includes(el.tagName)||el.isContentEditable))return;
    // Space works as a practice shortcut only while the practice area is visible.
    const r=$('#practica').getBoundingClientRect();
    if(r.top<window.innerHeight && r.bottom>0){e.preventDefault();next()}
  });
  render();
})();
