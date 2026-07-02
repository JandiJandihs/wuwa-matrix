// v3.5 portrait-all hotfix
(() => {
  const LS = 'wuwa_matrix_v3_state';
  const $ = (id) => document.getElementById(id);
  const state = {
    chars: [], placements: {}, teamCount: 5, selectedId: null,
    tab: 'teams', element: '전체', role: '전체', query: ''
  };
  const elIcon = {회절:'☀️',인멸:'🌑',기류:'🍃',용융:'🔥',응결:'❄️',전도:'⚡',미확정:'？'};
  const roleIcon = {'Main DPS':'⚔️','Sub DPS':'🗡️','Support':'✦','미확정':'？'};

  function cloneDb(){ return JSON.parse(JSON.stringify(window.WUWA_CHARACTERS || [])); }
  function load(){
    const saved = localStorage.getItem(LS);
    if(saved){ try{ Object.assign(state, JSON.parse(saved)); }catch{} }
    if(!state.chars?.length) state.chars = cloneDb();
    if(!state.teamCount) state.teamCount = 5;
  }
  function save(){ localStorage.setItem(LS, JSON.stringify({chars:state.chars,placements:state.placements,teamCount:state.teamCount,selectedId:state.selectedId})); }
  function toast(msg){ const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.hidden=true,1800); }
  function charById(id){ return state.chars.find(c=>c.id===id); }
  function usedCount(id){ return Object.values(state.placements).filter(v=>v===id).length; }
  function remain(c){ return Math.max(0, (Number(c.vigor)||1) - usedCount(c.id)); }
  function placeholder(c){
    const colors = {회절:'#d6b84a',인멸:'#6e4cff',기류:'#22a86c',용융:'#d94b33',응결:'#4aa9d6',전도:'#8d5cff',미확정:'#596070'};
    const bg = colors[c.element] || '#596070'; const letter = (c.kr||'?').slice(0,2);
    return `<div class="portrait element-${c.element}"><span>${letter}</span></div>`;
  }
  function portrait(c){
    if(c.portrait) return `<div class="portrait element-${c.element}"><img src="${c.portrait}" alt="${c.kr}" onerror="this.remove();this.parentElement.innerHTML='<span>${(c.kr||'?').slice(0,2)}</span>'"></div>`;
    return placeholder(c);
  }
  function searchable(c){ return [c.kr,c.en,c.element,c.weapon,c.role,c.version,...(c.alias||[])].join(' ').toLowerCase(); }
  function getFiltered(){
    const q = state.query.trim().toLowerCase();
    return [...state.chars].filter(c => {
      if(state.element !== '전체' && c.element !== state.element) return false;
      if(state.role !== '전체' && c.role !== state.role) return false;
      if(q && !searchable(c).includes(q)) return false;
      return true;
    }).sort((a,b)=> remain(b)-remain(a) || (b.vigor||1)-(a.vigor||1) || a.kr.localeCompare(b.kr,'ko'));
  }
  function setTab(tab){ state.tab=tab; document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); $(`view${tab[0].toUpperCase()+tab.slice(1)}`).classList.add('active'); render(); }
  function selectChar(id){ state.selectedId = state.selectedId === id ? null : id; save(); render(); }
  function place(team, slot){
    const key = `t${team}s${slot}`;
    if(state.placements[key]){ delete state.placements[key]; save(); render(); return; }
    if(!state.selectedId){ toast('캐릭터를 먼저 선택'); setTab('chars'); return; }
    const c=charById(state.selectedId); if(!c) return;
    for(let i=0;i<3;i++){ if(state.placements[`t${team}s${i}`]===c.id){ toast('같은 파티 중복 불가'); return; } }
    if(remain(c)<=0){ toast('피로도 소진'); return; }
    state.placements[key]=c.id; save(); render();
  }
  function renderStats(){
    const placed=Object.keys(state.placements).length;
    const totalRemain=state.chars.reduce((s,c)=>s+remain(c),0);
    $('statTeams').textContent=state.teamCount; $('statPlaced').textContent=placed; $('statVigor').textContent=totalRemain;
    const selected=charById(state.selectedId);
    $('selectedBanner').textContent = selected ? `선택: ${selected.kr} · 남은 피로 ${remain(selected)}/${selected.vigor}` : '선택 없음';
    $('selectedName').textContent = selected ? `선택: ${selected.kr}` : '선택 없음';
  }
  function renderTeams(){
    const wrap=$('teamsList'); wrap.innerHTML='';
    for(let t=0;t<state.teamCount;t++){
      let used=0; for(let s=0;s<3;s++){ const c=charById(state.placements[`t${t}s${s}`]); if(c) used += Number(c.vigor)||1; }
      const div=document.createElement('article'); div.className='team';
      div.innerHTML=`<div class="teamHead"><div class="teamTitle">${t+1} 파티</div><div class="teamMeta">피로도: ${used}</div></div><div class="slots"></div>`;
      const slots=div.querySelector('.slots');
      for(let s=0;s<3;s++){
        const key=`t${t}s${s}`; const c=charById(state.placements[key]); const btn=document.createElement('button'); btn.className='slot'+(c?'':' empty'); btn.onclick=()=>place(t,s);
        btn.innerHTML = c ? `${portrait(c)}<div class="name">${c.kr}</div><div class="tags"><span class="tag">${elIcon[c.element]||''} ${c.element}</span><span class="tag">${roleIcon[c.role]||''} ${c.role}</span></div><div class="vigor">⚡ ${usedCount(c.id)}/${c.vigor}</div>` : `<div class="plus">＋</div><span>선택 없음</span>`;
        slots.appendChild(btn);
      }
      wrap.appendChild(div);
    }
  }
  function renderFilters(){
    const ef=$('elementFilters'); ef.innerHTML='';
    window.WUWA_OPTIONS.elements.forEach(v=>{ const b=document.createElement('button'); b.className='chip'+(state.element===v?' active':''); b.textContent=(elIcon[v]||'')+' '+v; b.onclick=()=>{state.element=v;render();}; ef.appendChild(b); });
    const rf=$('roleFilters'); rf.innerHTML='';
    window.WUWA_OPTIONS.roles.forEach(v=>{ const b=document.createElement('button'); b.className='chip'+(state.role===v?' active':''); b.textContent=(roleIcon[v]||'')+' '+v; b.onclick=()=>{state.role=v;render();}; rf.appendChild(b); });
  }
  function renderChars(){
    renderFilters(); const grid=$('charGrid'); grid.innerHTML='';
    getFiltered().forEach(c=>{
      const r=remain(c); const card=document.createElement('div'); card.className='charcard'+(state.selectedId===c.id?' selected':'')+(r<=0?' depleted':'');
      const alias=(c.alias&&c.alias[0])?`(${c.alias[0]})`:'';
      card.innerHTML=`${portrait(c)}<div class="name">${c.kr}</div><div class="alias">${alias}</div><div class="vigor">⚡ ${r}/${c.vigor}</div><div class="tags"><span class="tag">${elIcon[c.element]||''} ${c.element}</span><span class="tag">${roleIcon[c.role]||''} ${c.role}</span><span class="tag">${c.weapon}</span></div><div class="cardActions"><button class="miniBtn select">선택</button><button class="miniBtn edit">수정</button></div>`;
      card.querySelector('.select').onclick=()=>selectChar(c.id); card.querySelector('.edit').onclick=()=>openEditor(c); grid.appendChild(card);
    });
  }
  function render(){ renderStats(); if(state.tab==='teams') renderTeams(); if(state.tab==='chars') renderChars(); }
  function mergeDb(){
    const cur = new Map(state.chars.map(c=>[c.id,c]));
    cloneDb().forEach(d=>{ cur.set(d.id,{...(cur.get(d.id)||{}), ...d}); });
    state.chars=[...cur.values()]; save(); render(); toast('최신목록 반영 완료');
  }
  function resetAll(){ if(!confirm('전체 초기화?')) return; localStorage.removeItem(LS); state.chars=cloneDb(); state.placements={}; state.teamCount=5; state.selectedId=null; save(); render(); toast('초기화 완료'); }
  function exportJson(){ const blob=new Blob([JSON.stringify({version:window.WUWA_DB_VERSION,...state},null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='wuwa-matrix-backup.json'; a.click(); URL.revokeObjectURL(a.href); }
  function importJson(file){ const r=new FileReader(); r.onload=()=>{ try{const data=JSON.parse(r.result); Object.assign(state,data); save(); render(); toast('가져오기 완료');}catch{toast('JSON 오류');} }; r.readAsText(file); }
  function openEditor(c=null){
    $('editorTitle').textContent=c?'캐릭터 수정':'캐릭터 추가'; $('edId').value=c?.id||''; $('edName').value=c?.kr||''; $('edAlias').value=(c?.alias||[]).join(', '); $('edElement').value=c?.element||'미확정'; $('edWeapon').value=c?.weapon||'미확정'; $('edRole').value=c?.role||'미확정'; $('edVigor').value=c?.vigor||1; $('edVersion').value=c?.version||''; $('edPortrait').value=c?.portrait||''; $('editorDialog').showModal();
  }
  function saveEditor(){
    const id=$('edId').value || 'custom_'+Date.now(); const data={id, kr:$('edName').value.trim(), en:id, alias:$('edAlias').value.split(',').map(s=>s.trim()).filter(Boolean), element:$('edElement').value, weapon:$('edWeapon').value, role:$('edRole').value, vigor:Number($('edVigor').value), version:$('edVersion').value.trim(), portrait:$('edPortrait').value.trim()};
    const i=state.chars.findIndex(c=>c.id===id); if(i>=0) state.chars[i]={...state.chars[i],...data}; else state.chars.push(data); save(); render(); toast('저장 완료');
  }
  function initOptions(){
    $('edElement').innerHTML=window.WUWA_OPTIONS.elements.filter(x=>x!=='전체').map(x=>`<option>${x}</option>`).join('');
    $('edWeapon').innerHTML=window.WUWA_OPTIONS.weapons.map(x=>`<option>${x}</option>`).join('');
    $('edRole').innerHTML=window.WUWA_OPTIONS.roles.filter(x=>x!=='전체').map(x=>`<option>${x}</option>`).join('');
  }
  function bind(){
    document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
    $('quickChars').onclick=()=>setTab('chars'); $('clearSelected').onclick=()=>{state.selectedId=null;save();render();};
    $('btnAddTeam').onclick=()=>{state.teamCount++;save();render();}; $('btnClearTeams').onclick=()=>{if(confirm('편성 초기화?')){state.placements={};save();render();}};
    $('searchInput').oninput=e=>{state.query=e.target.value;renderChars();}; $('btnMergeDb').onclick=mergeDb; $('btnResetDb').onclick=resetAll; $('btnExport').onclick=exportJson; $('importInput').onchange=e=>e.target.files[0]&&importJson(e.target.files[0]); $('btnOpenEditor').onclick=()=>openEditor(); $('btnSaveChar').onclick=saveEditor;
  }
  let deferredPrompt; window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();deferredPrompt=e;$('btnInstall').hidden=false;}); $('btnInstall')?.addEventListener('click',()=>deferredPrompt?.prompt());
  load(); initOptions(); bind(); render();
})();
