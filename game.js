'use strict';
const KEY='football-career-mvp-v2';
const OLD_KEY='football-career-mvp-v1';
const clubs={한국:[['수원 삼성 블루윙즈','K리그',63,65],['FC 서울','K리그',72,73],['전북 현대 모터스','K리그',75,77]],잉글랜드:[['아스널','잉글랜드',88,91],['브라이턴 앤 호브 알비온','잉글랜드',77,85],['사우샘프턴','잉글랜드',67,76]],스페인:[['FC 바르셀로나','스페인',91,94],['레알 소시에다드','스페인',78,84],['발렌시아 CF','스페인',73,78]]};
const keys=['속도','슈팅','패스','드리블','수비','피지컬','판단력','체력'];
const positions=['ST','LW','RW','CAM','CM','CDM','LB','RB','CB'];
const weights={ST:[.13,.30,.08,.17,.02,.13,.12,.05],LW:[.24,.14,.12,.27,.02,.05,.10,.06],RW:[.24,.14,.12,.27,.02,.05,.10,.06],CAM:[.08,.15,.25,.22,.02,.05,.18,.05],CM:[.07,.08,.28,.13,.10,.08,.18,.08],CDM:[.05,.03,.19,.06,.27,.15,.18,.07],LB:[.20,.02,.12,.10,.25,.10,.10,.11],RB:[.20,.02,.12,.10,.25,.10,.10,.11],CB:[.06,.02,.08,.04,.35,.25,.15,.05]};
let state=null;
const peakAge=()=>rnd(26,32);
const emptyStats=()=>({apps:0,starts:0,minutes:0,goals:0,assists:0,tackles:0,keypasses:0,interceptions:0,passes:0,ratingSum:0,wins:0,draws:0,losses:0});
const roleGroup=p=>['ST','LW','RW','CAM'].includes(p.position)?'attack':['CM','CDM'].includes(p.position)?'mid':'defense';
const schedule=Array.from({length:24},(_,i)=>({week:i+1,opponent:['지역 라이벌','상위권 유스','중위권 유스','하위권 유스'][i%4],strength:[69,76,63,55][i%4],importance:i===6?'데뷔 기회':i===20?'시즌 결정전':null}));
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clamp=(v,a=1,b=100)=>Math.max(a,Math.min(b,v));
const el=()=>document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){alert('저장 실패: 브라우저 저장 공간을 확인해 주세요.')}}
function rating(p){return Math.round(p.attrs.reduce((a,v,i)=>a+v*weights[p.position][i],0))}
function makePlayer(name,nation,club){let pos=positions[rnd(0,positions.length-1)],tier=club[2],talent=rnd(-9,13);let attrs=keys.map(()=>clamp(Math.round(30+tier*.24+talent*.5+rnd(-13,13))));let strong=rnd(0,7);attrs[strong]=clamp(Math.max(attrs[strong],67+rnd(0,13)));let base=Math.round(attrs.reduce((a,v,i)=>a+v*weights[pos][i],0));return{name,nation,club:club[0],league:club[1],development:club[3],age:rnd(15,16),position:pos,foot:Math.random()<.76?'오른발':'왼발',height:rnd(163,195),attrs,potential:clamp(base+rnd(10,30)+Math.round(talent*.4),50,97),peakAge:peakAge(),declineRate:rnd(6,13)/10,adaptation:rnd(40,85),professionalism:rnd(35,85),trust:rnd(38,65),confidence:60,fatigue:5,injury:0,form:50,ledger:Array(8).fill(0),stats:emptyStats(),initial:[...attrs]};}
function create(){const name=document.getElementById('name').value.trim(),nation=document.getElementById('nation').value,club=clubs[nation][+document.getElementById('club').value];if(!name){alert('이름을 입력해 주세요');return}state={player:makePlayer(name,nation,club),season:1,week:0,phase:'pre',plan:null,history:[],news:['유소년 커리어가 시작되었습니다.'],events:0,playedImportant:false,importantDone:[],matchLog:[],halfReport:null,seasonStart:0,};state.seasonStart=rating(state.player);save();render()}
function chooseTraining(){let focus=+document.getElementById('focus').value,intensity=+document.getElementById('intensity').value;state.plan={focus,intensity};state.phase='run';state.news.unshift('훈련 계획이 확정되었습니다.');save();render()}
function avgStats(){const p=state.player;return p.stats.apps?(p.stats.ratingSum/p.stats.apps).toFixed(1):'–'}
function match(important=false,choice=null){
 const p=state.player,fixture=schedule[state.week-1],overall=rating(p),clubStrength=clubs[p.nation].find(c=>c[0]===p.club)?.[2]||65;
 const group=roleGroup(p),fit=clamp(65+(p.adaptation-60)*.45,30,95);
 const chance=clamp(40+(overall-clubStrength)*1.1+(p.trust-50)*.40+(p.form-50)*.20+(fit-65)*.14-p.fatigue*.23,7,90);
 const injured=p.injury>0;if(injured)p.injury--;
 const plays=!injured&&Math.random()*100<chance;
 let mins=0,perf=0,goals=0,assists=0,tackles=0,keypasses=0,interceptions=0,passes=0;
 let success=null;
 if(important&&choice!==null){const skill=choice==='pass'?(.65*p.attrs[2]+.35*p.attrs[6]):(.5*p.attrs[3]+.3*p.attrs[0]+.2*p.attrs[6]);const difficulty=fixture.importance==='시즌 결정전'?66:59;success=Math.random()*100<clamp(48+(skill-difficulty)*.85+(p.confidence-50)*.18-p.fatigue*.20,12,88)}
 if(plays){
  const starter=Math.random()*100<chance*.68;mins=starter?rnd(65,90):rnd(15,40);if(starter)p.stats.starts++;
  perf=clamp(Math.round(53+(overall-55)*.48+rnd(-17,17)+(p.confidence-50)*.13-p.fatigue*.12+(success===true?11:success===false?-7:0)),15,95);
  const exposure=mins/90,attack=group==='attack',mid=group==='mid';
  const goalChance=clamp((attack?.115:mid?.035:.012)+(p.attrs[1]-50)*.0017+(perf-55)*.0013,.003,.38)*exposure;
  const assistChance=clamp((attack?.105:mid?.09:.045)+(p.attrs[2]-50)*.0013+(perf-55)*.001,.003,.35)*exposure;
  goals=+(Math.random()<goalChance);assists=+(Math.random()<assistChance);
  tackles=Math.round((attack?1:mid?3:5)*exposure*(.65+Math.random()*.8)*(p.attrs[4]/60));
  interceptions=Math.round((attack?.6:mid?2:3.5)*exposure*(.65+Math.random()*.8)*(p.attrs[6]/60));
  keypasses=Math.round((attack?2.5:mid?2:0.8)*exposure*(.6+Math.random())*(p.attrs[2]/60));
  passes=Math.round((attack?18:mid?40:29)*exposure*(.7+Math.random()*.6)*(p.attrs[2]/60));
  p.stats.apps++;p.stats.minutes+=mins;p.stats.goals+=goals;p.stats.assists+=assists;p.stats.tackles+=tackles;p.stats.interceptions+=interceptions;p.stats.keypasses+=keypasses;p.stats.passes+=passes;
  const mr=clamp(5.1+(perf-45)/15+(goals*.65)+(assists*.4),4,10);p.stats.ratingSum+=mr;
  p.form=clamp(Math.round(p.form*.7+perf*.3));p.trust=clamp(p.trust+(perf>=67?2:perf<43?-2:0));p.confidence=clamp(p.confidence+(perf>=67?2:perf<43?-2:0));
  const dev=(.17+exposure*.29)*(p.development/75)*(p.professionalism/65)*(p.planBoost||1);
  for(let i=0;i<8;i++)p.ledger[i]+=(i===state.plan.focus?dev:dev*.12)*Math.max(.12,(p.potential-p.attrs[i]+12)/36);
  p.fatigue=clamp(p.fatigue+state.plan.intensity*2+rnd(0,3),0,100);
 }else{p.trust=clamp(p.trust-.2);p.fatigue=clamp(p.fatigue-3,0,100)}
 const teamPower=clubStrength*.55+fixture.strength*.45+(plays?(perf-50)*.09:0)+rnd(-15,15);
 const rivalPower=fixture.strength+rnd(-13,13);const outcome=teamPower>rivalPower+5?'승':teamPower<rivalPower-5?'패':'무';
 if(outcome==='승')p.stats.wins++;else if(outcome==='무')p.stats.draws++;else p.stats.losses++;
 const training=[.13,.22,.33][state.plan.intensity-1];
 for(let i=0;i<8;i++)p.ledger[i]+=(i===state.plan.focus?training:training*.07)*(p.development/75)*(p.professionalism/65)*Math.max(.12,(p.potential-p.attrs[i]+12)/36);
 p.fatigue=clamp(p.fatigue+state.plan.intensity*1.5-3,0,100);
 if(!injured&&Math.random()<(.002+Math.max(0,p.fatigue-55)*.00028+state.plan.intensity*.0015)){p.injury=rnd(1,4);state.news.unshift(`부상: ${p.injury}경기 결장 예상`)}
 if(p.fatigue>75)p.confidence=clamp(p.confidence-1);
 const log={week:state.week,opponent:fixture.opponent,outcome,played:plays,minutes:mins,goals,assists,tackles,keypasses,interceptions,passes,performance:perf,important,success};state.matchLog.push(log);
 if(important)state.news.unshift(`중요 경기 ${outcome} · ${plays?`${mins}분 출전`:'미출전'}${success===null?'':success?' · 선택 성공':' · 선택 실패'}`);
 return log;
}
function applyGrowth(label){const p=state.player,before=rating(p),changes=[];const softCap=p.potential+Math.min(5,Math.max(0,Math.floor((p.professionalism-40)/12)+Math.floor(p.stats.minutes/700)));
 for(let i=0;i<8;i++){const gain=Math.floor(p.ledger[i]);if(gain>0&&rating(p)<softCap){p.attrs[i]=clamp(p.attrs[i]+gain);changes.push(`${keys[i]} +${gain}`)}p.ledger[i]-=gain}
 const summary={label,before,after:rating(p),changes,minutes:p.stats.minutes,apps:p.stats.apps,fatigue:Math.round(p.fatigue)};
 if(label==='시즌 중반')state.halfReport=summary;
 state.news.unshift(`${label}: 종합 ${before} → ${rating(p)}${changes.length?' · '+changes.join(', '):' · 변화 없음'}`);
 return summary;
}
function advance(){if(state.phase!=='run')return;let count=0;while(state.phase==='run'&&count<12){
 const next=state.week+1;
 if(schedule[next-1]?.importance&&!state.importantDone.includes(next)){state.week=next;state.phase='important';break}
 state.week=next;count++;match();
 if(state.week===12){applyGrowth('시즌 중반');state.phase='mid';break}
 if([5,18].includes(state.week)&&state.events<2){state.phase='event';break}
 if(state.week===24){applyGrowth('시즌 종료');state.phase='end';state.history.push({season:state.season,age:state.player.age,club:state.player.club,overall:rating(state.player),stats:{...state.player.stats}});break}
 }save();render()}
function resolveImportant(choice){match(true,choice);state.importantDone.push(state.week);state.phase='run';save();render()}
function resolveEvent(type){const p=state.player;if(type==='talk'){p.trust=clamp(p.trust+6);p.professionalism=clamp(p.professionalism+1);state.news.unshift('감독과의 면담으로 신뢰를 얻었습니다.')}else{p.fatigue=clamp(p.fatigue-18,0,100);p.confidence=clamp(p.confidence+5);state.news.unshift('휴식으로 피로가 줄고 자신감을 회복했습니다.')}state.events++;state.phase='run';save();render()}
function nextSeason(){const p=state.player;p.age++;p.initial=[...p.attrs];p.stats=emptyStats();p.ledger=Array(8).fill(0);p.fatigue=clamp(p.fatigue-25,0,100);state.season++;state.week=0;state.phase='pre';state.plan=null;state.events=0;state.playedImportant=false;state.importantDone=[];state.matchLog=[];state.halfReport=null;state.seasonStart=rating(p);
if(p.age>p.peakAge){const years=p.age-p.peakAge;const loss=Math.min(3,Math.max(0,Math.floor(years*p.declineRate*.42)));for(let i=0;i<8;i++)p.attrs[i]=clamp(p.attrs[i]-loss);state.news.unshift(`신체 변화: 전성기 이후 ${years}년, 주요 능력치 -${loss}`)}state.news.unshift(`${state.season}시즌이 시작됩니다. 나이 ${p.age}세.`);save();render()}
function reset(){if(!state)return;let p=state.player;if(confirm(`${p.name}의 ${state.season}시즌 커리어와 모든 기록을 영구 삭제하고 새로 시작할까요?`)){localStorage.removeItem(KEY);state=null;render()}}
function render(){if(!state){el().innerHTML=`<div class="card"><h2>새로운 커리어</h2><label>선수 이름</label><input id="name" maxlength="24" placeholder="이름 입력"><label>국적</label><select id="nation" onchange="updateClubs()">${Object.keys(clubs).map(x=>`<option>${x}</option>`).join('')}</select><label>시작 유스 팀</label><select id="club"></select><p class="muted">포지션·능력치·잠재력은 생성 시 무작위로 결정되며 다시 뽑을 수 없습니다.</p><button onclick="create()">선수 생성하기</button></div>`;updateClubs();return}const p=state.player,phase=state.phase;let block='';if(phase==='pre'||phase==='mid'){block=`<div class="card"><h2>${phase==='pre'?'시즌 전':'시즌 중반'} 훈련 설정</h2><label>집중 능력치</label><select id="focus">${keys.map((k,i)=>`<option value="${i}" ${state.plan?.focus===i?'selected':''}>${k}</option>`).join('')}</select><label>훈련 강도</label><select id="intensity"><option value="1">낮음</option><option value="2" selected>보통</option><option value="3">높음</option></select><p class="muted">높은 강도는 성장을 돕지만 피로·부상 위험을 높입니다.</p><button onclick="chooseTraining()">훈련 확정</button></div>`}else if(phase==='important'){block=`<div class="card"><span class="pill">중요 경기</span><h2>${schedule[state.week-1].importance}</h2><p>경기 막판, 동료가 공간으로 침투합니다. 직접 돌파할까요, 패스를 선택할까요?</p><div class="row"><button onclick="resolveImportant('pass')">동료에게 패스</button><button class="secondary" onclick="resolveImportant('dribble')">직접 돌파</button></div><p><button class="secondary" onclick="resolveImportant(null)">자동 결과로 진행</button></p></div>`}else if(phase==='event'){block=`<div class="card"><span class="pill">관계·생활 이벤트</span><h2>컨디션과 감독의 평가</h2><p>최근 훈련이 누적되었습니다. 감독과 면담하거나 충분히 휴식할 수 있습니다.</p><p class="muted">영향: 감독 관계·프로 의식 / 피로·자신감</p><div class="row"><button onclick="resolveEvent('talk')">감독 면담</button><button class="secondary" onclick="resolveEvent('rest')">휴식</button></div></div>`}else if(phase==='end'){block=`<div class="card"><h2>🏁 ${state.season}시즌 종료 보고서</h2><div class="stats"><div class="stat"><b>${p.stats.apps}</b>출전</div><div class="stat"><b>${p.stats.goals}</b>골</div><div class="stat"><b>${p.stats.assists}</b>도움</div><div class="stat"><b>${avgStats()}</b>평점</div><div class="stat"><b>${p.stats.minutes}</b>분</div><div class="stat"><b>${rating(p)}</b>종합</div></div><details><summary>포지션별 추가 기록</summary><p>선발 ${p.stats.starts}회 · 태클 ${p.stats.tackles}회 · 가로채기 ${p.stats.interceptions}회 · 키패스 ${p.stats.keypasses}회 · 패스 ${p.stats.passes}회</p><p>팀 결과: ${p.stats.wins}승 ${p.stats.draws}무 ${p.stats.losses}패 · 시즌 성장: 종합 ${state.seasonStart} → ${rating(p)}</p><details><summary>경기별 상세 기록</summary>${matchHistory()}</details></details><button onclick="nextSeason()">다음 시즌 시작</button></div>`}else{block=`<div class="card"><h2>시즌 자동 진행</h2><p>다음 중요 사건까지 일반 경기를 자동 처리합니다.</p>${p.fatigue>=70?'<div class="notice">⚠️ 피로가 높습니다. 훈련 변경은 다음 지정 시점에만 가능합니다.</div>':''}<button onclick="advance()">다음 중요 사건까지 진행</button></div>`}
el().innerHTML=`<div class="card"><span class="pill">${state.season}시즌 · ${state.week}/24주</span><h2>${esc(p.name)} <span class="muted">${p.age}세 · ${p.position}</span></h2><p>${esc(p.club)} 유스 · ${esc(p.nation)} · ${p.foot} · ${p.height}cm</p><div class="stats"><div class="stat"><b>${rating(p)}</b>종합 능력</div><div class="stat"><b>${p.confidence}</b>자신감</div><div class="stat"><b>${Math.round(p.fatigue)}</b>피로</div></div><p class="muted">감독 평가: ${p.trust>=65?'신뢰받는 유망주':p.trust>=45?'기회를 지켜보는 중':'증명이 필요한 선수'}</p><details><summary>세부 능력치</summary><div class="stats">${keys.map((k,i)=>`<div class="stat"><b>${p.attrs[i]}</b>${k}</div>`).join('')}</div></details><details><summary>코치의 강점·약점 평가</summary><p>강점: ${keys[p.attrs.indexOf(Math.max(...p.attrs))]} · 보완점: ${keys[p.attrs.indexOf(Math.min(...p.attrs))]}</p><p class="muted">코치 소견: ${rating(p)>=p.potential-5?'현재 수준이 기대치에 가까움':p.potential-rating(p)>=20?'큰 성장 여지가 있는 유망주':'꾸준히 성장 가능한 선수'} · 전성기 시점은 개인마다 다릅니다.</p><p class="muted">잠재력 수치는 공개되지 않습니다. 꾸준한 출전과 훈련이 중요합니다.</p></details></div>${block}${state.halfReport?`<div class="card"><h2>시즌 중반 성장 보고서</h2><p>종합 ${state.halfReport.before} → ${state.halfReport.after} · ${state.halfReport.apps}경기 출전</p><details><summary>성장 세부 내역</summary><p>${state.halfReport.changes.join(' · ')||'능력치 변화 없음'}</p></details></div>`:''}<div class="card"><h2>최근 소식</h2>${state.news.slice(0,5).map(n=>`<p>• ${esc(n)}</p>`).join('')}</div><div class="card"><h2>최근 경기</h2>${matchHistory(5)}</div><div class="card"><h2>커리어 기록</h2>${state.history.length?state.history.map(h=>`<p>${h.season}시즌 · ${h.age}세 · ${esc(h.club)} · 종합 ${h.overall} · ${h.stats.apps}경기 ${h.stats.goals}골 ${h.stats.assists}도움</p>`).join(''):'<p class="muted">완료된 시즌이 없습니다.</p>'}<button class="secondary" onclick="reset()">현재 커리어 삭제 후 새로 시작</button></div>`}
function matchHistory(limit=24){return (state.matchLog||[]).slice(-limit).reverse().map(m=>`<p class="muted">${m.week}주 · ${m.opponent} · ${m.outcome} · ${m.played?`${m.minutes}분 / ${m.goals}골 ${m.assists}도움 / 경기력 ${m.performance}`:'결장'}</p>`).join('')||'<p class="muted">아직 경기가 없습니다.</p>'}
function updateClubs(){let n=document.getElementById('nation')?.value;if(n)document.getElementById('club').innerHTML=clubs[n].map((c,i)=>`<option value="${i}">${c[0]} 유스</option>`).join('')}
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(parsed&&parsed.player&&parsed.phase)state=parsed}}catch(e){console.warn('저장 데이터를 읽을 수 없습니다.',e)}render();
