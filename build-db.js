(function(){
'use strict';

const EXACT={
  hiyuki:{
    set:'소리 없이 내려앉은 기도의 눈 5세트',alt:'야밤의 서리 5세트',main:'글로모스',
    cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:'응결 피해 ×2',c1:'공격력% ×2',
    subs:['공명 효율 120%까지','치명타 확률','치명타 피해','공격력%','공명 해방 피해'],
    farm:'데이터뱅크에서 글로모스를 탐지하고 해당 잔향 무음 구역에서 파밍.',
    source:'개별 빌드 DB · 추후 디시 실전 자료로 갱신',mode:'개인 딜',
    reason:'현재 편성에서도 개인 딜 세팅 우선도가 높음'
  },
  lucilla:{
    set:'소리 없이 내려앉은 기도의 눈 5세트',alt:'떠오르는 구름 5세트',main:'글로모스',
    cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:'응결 피해 ×2',c1:'공격력% ×2',
    subs:['공명 효율 필요량까지','치명타 확률','치명타 피해','공격력%','일반 공격 피해'],
    farm:'데이터뱅크에서 글로모스를 탐지하고 해당 잔향 무음 구역에서 파밍.',
    source:'개별 빌드 DB · 추후 디시 실전 자료로 갱신',mode:'개인 딜',
    reason:'기본적으로 개인 피해 세팅이 안정적'
  },
  chisa:{
    set:'찬란한 광휘 5세트',alt:'떠오르는 구름 5세트',main:'돌아갈 곳이 없는 오류',
    cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:'인멸 피해 ×2',c1:'공격력% ×2',
    subs:['공명 효율 125%까지','치명타 확률','치명타 피해','공격력%','공명 해방 피해'],
    farm:'데이터뱅크에서 돌아갈 곳이 없는 오류를 탐지하고 찬란한 광휘 무음 구역에서 파밍.',
    source:'개별 빌드 DB · 추후 디시 실전 자료로 갱신',mode:'팀 지원',
    reason:'단독 서포터일 때 회복과 팀 버프를 우선'
  }
};

const DAMAGE={
  회절:'회절 피해',인멸:'인멸 피해',기류:'기류 피해',
  용융:'용융 피해',응결:'응결 피해',전도:'전도 피해'
};

function generic(c,team){
  const others=team.filter(x=>x.id!==c.id);
  const anotherSupport=others.some(x=>x.role==='Support');
  const hasMain=others.some(x=>x.role==='Main DPS');
  const elemDamage=DAMAGE[c.elem]||'속성 피해';

  if(c.role==='Support'){
    if(anotherSupport){
      return {
        set:'떠오르는 구름 5세트',alt:'찬란한 광휘 5세트',main:'음험한 백로',
        cost:'4-3-3-1-1',c4:'치유 보너스 / 주 능력치%',c3:'공명 효율 ×2',c1:'주 능력치% ×2',
        subs:['공명 효율','주 능력치%','치명타','피해 보너스'],
        farm:'음험한 백로 탐지 + 떠오르는 구름 무음 구역',
        source:'편성 규칙 DB',mode:'버프 분담',
        reason:'다른 서포터와 찬란한 광휘 중복을 피하고 반주 버프를 담당'
      };
    }
    return {
      set:'찬란한 광휘 5세트',alt:'떠오르는 구름 5세트',main:'타종 거북이 / 돌아갈 곳이 없는 오류',
      cost:'4-3-3-1-1',c4:'치유 보너스 / 주 능력치%',c3:'공명 효율 ×2',c1:'주 능력치% ×2',
      subs:['공명 효율','주 능력치%','치명타','피해 보너스'],
      farm:'메인 에코 탐지 + 찬란한 광휘 무음 구역',
      source:'편성 규칙 DB',mode:'회복·지원',
      reason:'파티 내 다른 서포터가 없어 회복과 팀 버프를 우선'
    };
  }

  if(c.role==='Sub DPS'){
    if(hasMain){
      return {
        set:'떠오르는 구름 5세트',alt:`${c.elem} 전용 딜 세트 5세트`,main:'음험한 백로 또는 전용 4코',
        cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:`${elemDamage} ×2`,c1:'공격력% ×2',
        subs:['공명 효율','치명타 확률','치명타 피해','공격력%'],
        farm:'메인 에코 탐지 + 떠오르는 구름 무음 구역',
        source:'편성 규칙 DB',mode:'메인 딜러 지원',
        reason:'메인 딜러가 함께 있어 반주와 팀 버프 기여를 우선'
      };
    }
    return {
      set:`${c.elem} 전용 딜 세트 5세트`,alt:'떠오르는 구름 5세트',main:'전용 4코 에코',
      cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:`${elemDamage} ×2`,c1:'공격력% ×2',
      subs:['치명타 확률','치명타 피해','공격력%','공명 효율'],
      farm:'전용 4코 탐지 + 해당 잔향 무음 구역',
      source:'편성 규칙 DB',mode:'서브 캐리',
      reason:'메인 딜러가 없어 개인 피해 비중을 높임'
    };
  }

  return {
    set:`${c.elem} 전용 딜 세트 5세트`,alt:'끊임없는 잔향 2세트 혼합',main:'전용 4코 에코',
    cost:'4-3-3-1-1',c4:'치명타 확률 / 치명타 피해',c3:`${elemDamage} ×2`,c1:'공격력% ×2',
    subs:['치명타 확률','치명타 피해','공격력%','공명 효율'],
    farm:'전용 4코 탐지 + 해당 잔향 무음 구역',
    source:'편성 규칙 DB',mode:'메인 딜',
    reason:'메인 딜러는 현재 조합에서도 개인 딜 세트를 우선'
  };
}

function exact(c,team){
  const b=JSON.parse(JSON.stringify(EXACT[c.id]));
  if(c.id==='chisa' && team.some(x=>x.id!==c.id&&x.role==='Support')){
    b.set='떠오르는 구름 5세트';
    b.main='음험한 백로';
    b.mode='버프 분담';
    b.reason='다른 서포터가 찬란한 광휘를 맡으므로 치사는 떠오르는 구름으로 전환';
  }
  if(c.id==='lucilla' && team.some(x=>x.id!==c.id&&x.role==='Main DPS')){
    b.set='떠오르는 구름 5세트';
    b.main='음험한 백로';
    b.mode='메인 딜러 지원';
    b.reason='다른 메인 딜러가 있어 루실라는 반주 버프 중심으로 전환';
  }
  return b;
}

window.WUWA_BUILD_DB={
  version:'5.1.0',
  getBuild(c,team=[]){
    return EXACT[c.id]?exact(c,team):generic(c,team);
  }
};
})();