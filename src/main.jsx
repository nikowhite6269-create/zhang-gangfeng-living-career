import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const SAVE_KEY = "zgf-living-career-v1";

const ATTRS = {
  "近距离":67,"突破上篮":73,"突破扣篮":76,"原地扣篮":42,"背身控制":71,"中距离":75,"三分":65,"罚球":74,
  "传球准确":61,"控球":71,"持球速度":70,"传球视野":58,
  "外线防守":73,"内线防守":48,"抢断":68,"盖帽":62,
  "力量":62,"速度":79,"加速":80,"弹跳":82,"体力":78,"耐久":81
};

const BADGES = [
  ["背身后仰高手",38],["强力终结者",31],["外线挑战者",29],["脚踝终结者",22],["隔人扣篮高手",19]
];

const initialState = () => ({
  version:1,
  started:true,
  player:{
    name:"张刚峰",age:16,hometown:"广东茂名电白沙琅",position:"SG",hand:"右手",
    height:198,weight:88,wingspan:212,ovr:67,potential:"S+ / POT99"
  },
  finance:{cash:0,salary:0,endorsement:0,basketballIncome:0,assets:0},
  attributes:{...ATTRS},
  badges:BADGES.map(([name,progress])=>({name,tier:"未解锁",progress})),
  growth:{},
  role:{team:"广东省青年精英选拔 · 蓝队",role:"第二持球点 / 侧翼强攻",minutes:28,usage:24,trust:42},
  archive:[],
  currentNode:"2008-09-selection",
  unlocked:["2008-09-selection"],
  played:[],
  world:[
    {tag:"选拔",text:"广东省青年精英选拔营开营，首轮对抗将生成正式球探档案。"},
    {tag:"球探",text:"省青年组教练正在重点观察高尺寸后卫与持球侧翼。"},
    {tag:"对手",text:"白队得分核心郑铭被认为是本期训练营最成熟的单打手。"}
  ]
});

const rawPlays = [
  // Q1 21-18, Zhang 8, AST 2
  [1,"09:34","blue",3,"张刚峰弧顶接球，三分命中。",{pts:3,three:true}],
  [1,"09:02","blue",2,"陈志远空切上篮，张刚峰击地助攻。",{ast:true}],
  [1,"08:39","white",2,"郑铭右肘急停命中。",{}],
  [1,"08:10","blue",2,"黄启明篮下补进。",{}],
  [1,"07:48","white",3,"刘子豪底角三分。",{}],
  [1,"07:16","blue",2,"张刚峰加速突破，换手上篮。",{pts:2}],
  [1,"06:52","white",2,"何嘉俊顺下得分。",{}],
  [1,"06:21","blue",3,"周子涵右翼三分，张刚峰吸引夹击后分球。",{ast:true}],
  [1,"05:57","white",2,"郑铭中距离后仰。",{}],
  [1,"05:31","blue",3,"张刚峰左翼三分再中。",{pts:3,three:true}],
  [1,"04:58","white",3,"谭坤转换三分。",{}],
  [1,"04:24","blue",0,"张刚峰弱侧保护后场篮板。",{reb:1}],
  [1,"03:54","blue",2,"林浩强攻篮下得手。",{}],
  [1,"03:20","white",2,"冯瑞篮下放进。",{}],
  [1,"02:49","blue",0,"张刚峰长臂抄掉郑铭的传球。",{stl:1}],
  [1,"02:15","blue",2,"陈志远快攻上篮。",{}],
  [1,"01:42","white",2,"徐鹏底线切入得分。",{}],
  [1,"00:54","blue",2,"黄启明二次进攻。",{}],
  [1,"00:18","white",2,"郑铭压哨抛投。",{}],

  // Q2 20-21, Zhang 7, AST 3
  [2,"09:31","white",3,"郑铭借掩护三分命中。",{}],
  [2,"09:01","blue",2,"张刚峰突破强吃打板。",{pts:2}],
  [2,"08:33","white",2,"何嘉俊低位得分。",{}],
  [2,"08:02","blue",2,"黄启明顺下扣篮，张刚峰高位送出助攻。",{ast:true}],
  [2,"07:36","white",2,"徐鹏快攻上篮。",{}],
  [2,"07:08","blue",3,"周子涵底角三分。",{}],
  [2,"06:44","white",3,"刘子豪弧顶三分。",{}],
  [2,"06:18","blue",2,"张刚峰中距离急停命中。",{pts:2}],
  [2,"05:51","white",2,"郑铭突破挑篮。",{}],
  [2,"05:21","blue",2,"林浩篮下吃饼，张刚峰助攻。",{ast:true}],
  [2,"04:55","white",3,"谭坤45度三分。",{}],
  [2,"04:22","blue",0,"张刚峰冲抢下长篮板。",{reb:1}],
  [2,"03:51","blue",3,"张刚峰借掩护干拔三分。",{pts:3,three:true}],
  [2,"03:16","white",2,"冯瑞补篮得分。",{}],
  [2,"02:40","blue",3,"陈志远接张刚峰跨场传球，底角三分。",{ast:true}],
  [2,"02:02","white",2,"郑铭后撤步中投。",{}],
  [2,"01:18","blue",3,"周子涵转换三分。",{}],
  [2,"00:37","white",2,"徐鹏压节奏上篮。",{}],

  // Q3 19-20, Zhang 6, AST 2
  [3,"09:36","blue",2,"张刚峰背身转面框，中投命中。",{pts:2}],
  [3,"09:02","white",2,"郑铭强突得手。",{}],
  [3,"08:35","blue",3,"陈志远底角三分，张刚峰突破分球。",{ast:true}],
  [3,"08:07","white",3,"刘子豪三分回应。",{}],
  [3,"07:39","blue",2,"黄启明顺下擦板。",{}],
  [3,"07:08","white",2,"何嘉俊低位勾手。",{}],
  [3,"06:33","blue",2,"张刚峰反击欧洲步上篮。",{pts:2}],
  [3,"06:04","white",2,"郑铭急停中投。",{}],
  [3,"05:30","blue",3,"周子涵三分命中。",{}],
  [3,"04:58","white",3,"谭坤底角三分。",{}],
  [3,"04:21","blue",0,"张刚峰连续卡位，收下防守篮板。",{reb:1}],
  [3,"03:50","blue",2,"林浩空切，张刚峰击地助攻。",{ast:true}],
  [3,"03:12","white",2,"冯瑞二次进攻。",{}],
  [3,"02:42","blue",2,"张刚峰罚球线翻身跳投。",{pts:2}],
  [3,"02:06","white",2,"徐鹏突破打板。",{}],
  [3,"01:31","blue",3,"陈志远右翼三分。",{}],
  [3,"00:52","white",2,"郑铭快攻追身得分。",{}],
  [3,"00:19","blue",2,"黄启明压哨补篮。",{}],
  [3,"00:04","white",2,"白队最后一攻篮下打进。",{}],

  // Q4 24-22, Zhang 8, AST 2
  [4,"09:41","white",3,"郑铭强投三分命中。",{}],
  [4,"09:12","blue",2,"张刚峰直杀篮筐上篮得分。",{pts:2}],
  [4,"08:44","blue",3,"周子涵底角三分，张刚峰助攻。",{ast:true}],
  [4,"08:19","white",2,"何嘉俊顺下得分。",{}],
  [4,"07:47","blue",3,"陈志远转换三分。",{}],
  [4,"07:13","white",3,"刘子豪外线命中。",{}],
  [4,"06:39","blue",2,"张刚峰中距离干拔。",{pts:2}],
  [4,"06:06","white",2,"郑铭强突造成错位得分。",{}],
  [4,"05:31","blue",2,"黄启明篮下终结。",{}],
  [4,"05:02","white",2,"徐鹏快攻上篮。",{}],
  [4,"04:27","blue",0,"张刚峰保护篮板，蓝队重新组织。",{reb:1}],
  [4,"03:56","blue",2,"张刚峰底线突破反篮。",{pts:2}],
  [4,"03:31","white",3,"谭坤关键三分追近。",{}],
  [4,"03:04","blue",3,"周子涵借张刚峰突分，再中三分。",{ast:true}],
  [4,"02:36","white",2,"郑铭急停跳投命中。",{}],
  [4,"02:05","blue",0,"张刚峰提前预判，完成本场第二次抢断。",{stl:1}],
  [4,"01:44","blue",3,"陈志远弧顶三分，蓝队稳住领先。",{}],
  [4,"01:18","white",3,"刘子豪高难度三分。",{}],
  [4,"00:52","blue",2,"张刚峰强突迎着补防上篮命中。",{pts:2}],
  [4,"00:29","white",2,"郑铭快速两分。",{}],
  [4,"00:16","blue",0,"张刚峰抢下关键后场篮板。",{reb:1}],
  [4,"00:09","blue",0,"黄启明接界外球未能完成终结，蓝队继续控制球权。",{}],
  [4,"00:03","white",0,"白队最后补篮偏出，时间耗尽。",{}]
];

const plays = rawPlays.map((p,i)=>({
  id:i+1,q:p[0],clock:p[1],team:p[2],points:p[3],text:p[4],z:p[5]||{}
}));

function validateGame() {
  let blue=0,white=0,zPts=0,zThrees=0,zAst=0;
  let prevBlue=0,prevWhite=0;
  for (const p of plays) {
    if (p.points < 0) throw new Error("非法负得分");
    if (p.team==="blue") blue+=p.points; else white+=p.points;
    if (blue < prevBlue || white < prevWhite) throw new Error("累计比分倒退");
    prevBlue=blue; prevWhite=white;
    zPts += p.z.pts||0;
    zThrees += p.z.three?1:0;
    zAst += p.z.ast?1:0;
  }
  const ok = blue===84 && white===81 && zPts===29 && zThrees===3 && zAst===9;
  return {ok,blue,white,zPts,zThrees,zAst};
}

const nav = [
  ["hub","生涯大厅"],["player","球员中心"],["growth","成长池"],["badges","徽章"],
  ["role","角色 / 轮换"],["archive","生涯档案"],["calendar","日程"],["world","世界动态"],["match","比赛中心"]
];

function App() {
  const [save,setSave] = useState(()=> {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [screen,setScreen] = useState("hub");
  const [confirmNew,setConfirmNew] = useState(false);
  const [match,setMatch] = useState({status:"idle",index:-1,blue:0,white:0,q:1,clock:"10:00",stats:{pts:0,reb:0,ast:0,stl:0},feed:[]});
  const timer = useRef(null);

  useEffect(()=>{ if(save) localStorage.setItem(SAVE_KEY,JSON.stringify(save)); },[save]);
  useEffect(()=>()=>clearInterval(timer.current),[]);

  const startNew=()=>{ clearInterval(timer.current); setSave(initialState()); setScreen("hub"); setMatch({status:"idle",index:-1,blue:0,white:0,q:1,clock:"10:00",stats:{pts:0,reb:0,ast:0,stl:0},feed:[]}); setConfirmNew(false); };
  const updateSave=(fn)=>setSave(s=>fn({...s}));

  const tipoff=()=>{
    const validation=validateGame();
    if(!validation.ok){ alert("比赛脚本校验失败，无法开赛。"); return; }
    clearInterval(timer.current);
    setMatch({status:"live",index:-1,blue:0,white:0,q:1,clock:"10:00",stats:{pts:0,reb:0,ast:0,stl:0},feed:[]});
    let idx=-1, b=0, w=0, stats={pts:0,reb:0,ast:0,stl:0};
    timer.current=setInterval(()=>{
      idx++;
      if(idx>=plays.length){
        clearInterval(timer.current);
        setMatch(m=>({...m,status:"final"}));
        setSave(s=>{
          if(s.played.includes("2008-09-selection")) return s;
          const archive=[...s.archive,{
            id:"2008-09-selection",date:"2008年9月",title:"省青年精英选拔赛 · 蓝队 vs 白队",
            result:"蓝队 84–81 白队",line:"张刚峰 29 PTS · 5 REB · 9 AST · 2 STL",ovr:"67 → 68"
          }];
          return {...s,player:{...s.player,ovr:68},archive,played:[...s.played,"2008-09-selection"],currentNode:"2008-10-camp",unlocked:[...new Set([...s.unlocked,"2008-10-camp"])]};
        });
        return;
      }
      const p=plays[idx];
      if(p.team==="blue") b+=p.points; else w+=p.points;
      stats={
        pts:stats.pts+(p.z.pts||0),reb:stats.reb+(p.z.reb||0),
        ast:stats.ast+(p.z.ast?1:0),stl:stats.stl+(p.z.stl||0)
      };
      setMatch(m=>({
        status:"live",index:idx,blue:b,white:w,q:p.q,clock:p.clock,stats,
        feed:[{...p,score:`${b}-${w}`},...m.feed].slice(0,14)
      }));
    },620);
  };

  if(!save){
    return <div className="splash">
      <div className="brandmark">ZG</div>
      <div className="eyebrow">ORIGINAL BASKETBALL CAREER SIM</div>
      <h1>张刚峰 · <span>LIVING CAREER</span></h1>
      <p>从 2008 年 9 月开始。每一次正式比赛、成长验证与关键决定都写入同一个生涯存档。</p>
      <button className="primary giant" onClick={startNew}>新建生涯</button>
      <div className="tiny">198CM · SG · 16岁 · OVR 67 · S+ POTENTIAL</div>
    </div>;
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><b>ZG</b><span>LIVING CAREER</span></div>
      <div className="profileMini">
        <div><small>PLAYER</small><strong>{save.player.name}</strong></div>
        <div className="ovrMini"><small>OVR</small><b>{save.player.ovr}</b></div>
      </div>
      <nav>{nav.map(([k,label])=><button key={k} className={screen===k?"active":""} onClick={()=>setScreen(k)}>{label}</button>)}</nav>
      <div className="sideFoot">
        <button className="ghost danger" onClick={()=>setConfirmNew(true)}>新建 / 重置生涯</button>
        <div className="autosave">● 自动保存已启用</div>
      </div>
    </aside>

    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">SEPTEMBER 2008 · GUANGDONG</div>
          <h2>{save.player.name} <span>· 生涯模式</span></h2>
        </div>
        <div className="hudStats">
          <Hud label="OVR" value={save.player.ovr} tone="gold"/>
          <Hud label="POT" value="S+" tone="violet"/>
          <Hud label="现金" value="¥0"/>
          <Hud label="位置" value="SG"/>
        </div>
      </header>

      <section className="content">
        {screen==="hub" && <Hub save={save} setScreen={setScreen}/>}
        {screen==="player" && <Player save={save}/>}
        {screen==="growth" && <Growth save={save} updateSave={updateSave}/>}
        {screen==="badges" && <Badges save={save}/>}
        {screen==="role" && <Role save={save}/>}
        {screen==="archive" && <Archive save={save}/>}
        {screen==="calendar" && <Calendar save={save} setScreen={setScreen}/>}
        {screen==="world" && <World save={save}/>}
        {screen==="match" && <MatchCenter save={save} match={match} tipoff={tipoff}/>}
      </section>
    </main>

    {confirmNew && <Modal title="重置生涯？" onClose={()=>setConfirmNew(false)}>
      <p>现有浏览器存档会被覆盖，生涯将回到 2008 年 9 月、OVR 67 的初始节点。</p>
      <div className="row">
        <button className="ghost" onClick={()=>setConfirmNew(false)}>取消</button>
        <button className="primary dangerFill" onClick={startNew}>确认重置</button>
      </div>
    </Modal>}
  </div>;
}

const Hud=({label,value,tone=""})=><div className={`hud ${tone}`}><small>{label}</small><b>{value}</b></div>;
const Panel=({title,sub,children,className=""})=><div className={`panel ${className}`}><div className="panelHead"><div><h3>{title}</h3>{sub&&<p>{sub}</p>}</div></div>{children}</div>;
const Bar=({v,tone="gold"})=><div className="bar"><i className={tone} style={{width:`${Math.max(0,Math.min(100,v))}%`}}/></div>;
const Tag=({children,tone="gold"})=><span className={`tag ${tone}`}>{children}</span>;

function Hub({save,setScreen}) {
  const played=save.played.includes("2008-09-selection");
  return <div className="grid12">
    <Panel className="hero span8" title={played?"下一阶段已解锁":"当前关键节点"} sub={played?"首战档案已经写入，下一节点等待你进入。":"省青年精英选拔赛 · 首场正式高压样本"}>
      <div className="matchPoster">
        <div><Tag>BLUE TEAM</Tag><h4>{played?"复训周 · 体能与三分专项":"蓝队 vs 白队"}</h4><p>{played?"2008年10月 · 训练节点":"2008年9月 · 省青年精英选拔赛"}</p></div>
        <button className="primary giant" onClick={()=>setScreen(played?"calendar":"match")}>{played?"查看下一节点":"TIP-OFF"}</button>
      </div>
    </Panel>
    <Panel className="span4" title="球员状态" sub="固定身体模板">
      <div className="bigOvr"><small>OVERALL</small><b>{save.player.ovr}</b><span>{save.player.potential}</span></div>
      <div className="facts"><span>198cm</span><span>88kg</span><span>212cm 臂展</span><span>右手</span></div>
    </Panel>
    <Panel className="span4" title="角色 / 轮换" sub={save.role.team}>
      <Metric label="定位" value={save.role.role}/>
      <Metric label="轮换" value={save.role.minutes+" MIN"}/>
      <Metric label="使用率" value={save.role.usage+"%"}/>
      <div className="metric"><span>教练信任</span><b>{save.role.trust}</b></div><Bar v={save.role.trust}/>
    </Panel>
    <Panel className="span4" title="成长雷达" sub="永久属性与训练池分离">
      <Metric label="最高永久属性" value="弹跳 82"/>
      <Metric label="三分" value={save.attributes["三分"]}/>
      <Metric label="传球视野" value={save.attributes["传球视野"]}/>
      <button className="ghost full" onClick={()=>setScreen("growth")}>进入成长池</button>
    </Panel>
    <Panel className="span4 ticker" title="世界动态" sub="训练营实时信息流">
      {save.world.map((x,i)=><div className="tickerItem" key={i}><Tag tone={i===2?"orange":i===1?"violet":"gold"}>{x.tag}</Tag><p>{x.text}</p></div>)}
    </Panel>
  </div>
}

function Metric({label,value}){return <div className="metric"><span>{label}</span><b>{value}</b></div>}

function Player({save}) {
  const groups=[
    ["进攻终结",["近距离","突破上篮","突破扣篮","原地扣篮","背身控制","中距离","三分","罚球"]],
    ["组织持球",["传球准确","控球","持球速度","传球视野"]],
    ["防守",["外线防守","内线防守","抢断","盖帽"]],
    ["身体",["力量","速度","加速","弹跳","体力","耐久"]]
  ];
  return <div className="grid12">
    <Panel className="span12" title="球员中心" sub="永久属性 · 上限 99">
      <div className="playerHeader"><div className="silhouette">SG</div><div><h1>{save.player.name}</h1><p>{save.player.hometown} · 16岁 · 右手</p><div className="facts"><span>198cm 锁定</span><span>88kg</span><span>臂展 212cm</span><span>OVR {save.player.ovr}</span></div></div></div>
    </Panel>
    {groups.map(([g,keys])=><Panel key={g} className="span6" title={g}>{keys.map(k=><div className="attr" key={k}><div><span>{k}</span><b>{save.attributes[k]}</b></div><Bar v={save.attributes[k]} tone={save.attributes[k]>=78?"green":save.attributes[k]<55?"red":"gold"}/></div>)}</Panel>)}
  </div>
}

function Growth({save,updateSave}) {
  const keys=["三分","力量","内线防守","传球视野","原地扣篮","控球"];
  const train=(k)=>updateSave(s=>({...s,growth:{...s.growth,[k]:{raw:(s.growth[k]?.raw||0)+3,validated:s.growth[k]?.validated||0}}}));
  return <div className="grid12">
    <Panel className="span12" title="成长池" sub="训练 → 池经验 → 高压样本验证 → 正式结算 → 永久属性">
      <div className="trainBtns">{keys.map(k=><button className="ghost" key={k} onClick={()=>train(k)}>训练 {k} +3 池</button>)}</div>
      <div className="growthList">
        {Object.keys(save.growth).length===0 && <div className="empty">目前没有训练池。训练只会增加池经验，不会直接提高永久属性。</div>}
        {Object.entries(save.growth).map(([k,v])=><div className="growthRow" key={k}>
          <div><strong>{k}</strong><small>永久 {save.attributes[k]} · 池 {v.raw} · 已验证 {v.validated}</small></div>
          <div className="dual"><Bar v={Math.min(100,v.raw*8)} tone="green"/><Bar v={Math.min(100,v.validated*8)} tone="blue"/></div>
          <Tag tone="green">等待高压样本</Tag>
        </div>)}
      </div>
    </Panel>
    <Panel className="span6" title="结算规则"><p className="copy">训练只建立成长池；正式比赛负责验证；只有已验证经验才有资格在正式结算节点转为永久属性。任何单项上限 99。</p></Panel>
    <Panel className="span6" title="当前高压样本"><p className="copy">省青年精英选拔赛是第一份正式样本。首战完成后将开放后续成长验证。</p></Panel>
  </div>
}

function Badges({save}) {
  const ladder=["未解锁","青铜","白银","黄金","名人堂","传奇"];
  return <Panel title="徽章" sub={"固定阶梯："+ladder.join(" → ")}>
    <div className="ladder">{ladder.map((x,i)=><Tag key={x} tone={i===0?"muted":"gold"}>{x}</Tag>)}</div>
    <div className="badgeGrid">{save.badges.map(b=><div className="badge" key={b.name}><div><strong>{b.name}</strong><Tag tone="muted">{b.tier}</Tag></div><span>{b.progress}/100</span><Bar v={b.progress}/><small>进度与等级分离；只能在正式结算时升级。</small></div>)}</div>
  </Panel>
}

function Role({save}) {
  return <div className="grid12">
    <Panel className="span8" title="角色与轮换" sub={save.role.team}>
      <div className="roleHero"><div><small>当前定位</small><h1>{save.role.role}</h1></div><div className="roleNums"><Hud label="MIN" value={save.role.minutes}/><Hud label="USG" value={save.role.usage+"%"}/><Hud label="TRUST" value={save.role.trust} tone="gold"/></div></div>
      <Bar v={save.role.trust}/>
    </Panel>
    <Panel className="span4" title="教练备注"><p className="copy">198cm 的纯 SG 尺寸在同龄组极具稀缺性。当前仍需用正式比赛样本证明持球决策和对抗下终结。</p></Panel>
  </div>
}

function Archive({save}) {
  return <Panel title="生涯档案" sub="正式比赛与重大节点永久记录">
    {save.archive.length===0?<div className="empty">档案为空。完成第一场正式比赛后自动写入。</div>:
      save.archive.map(a=><div className="archive" key={a.id}><Tag>{a.date}</Tag><div><h4>{a.title}</h4><p>{a.result}</p><strong>{a.line}</strong></div><div className="archiveOvr"><small>OVR</small><b>{a.ovr}</b></div></div>)}
  </Panel>
}

function Calendar({save,setScreen}) {
  const done=save.played.includes("2008-09-selection");
  const nodes=[
    ["2008年9月","省青年精英选拔赛 · 蓝队 vs 白队",done?"已完成":"当前","正式高压样本"],
    ["2008年10月","选拔营复训周 · 体能与三分专项",done?"当前":"锁定","完成首战后解锁"],
    ["2008年11月","U18 省队集训邀请（待定）","锁定","由后续表现决定"]
  ];
  return <Panel title="日程" sub="关键节点需要确认，比赛不会自动开始">
    <div className="timeline">{nodes.map((n,i)=><div className="node" key={i}><div className="dot"/><div><small>{n[0]}</small><h4>{n[1]}</h4><p>{n[3]}</p></div><Tag tone={n[2]==="当前"?"gold":n[2]==="已完成"?"green":"muted"}>{n[2]}</Tag>{i===0&&!done&&<button className="primary" onClick={()=>setScreen("match")}>前往比赛</button>}</div>)}</div>
  </Panel>
}

function World({save}) {return <Panel title="世界动态" sub="选拔营 / 球探 / 对手 / 生涯环境">{save.world.map((x,i)=><div className="news" key={i}><Tag tone={i===2?"orange":i===1?"violet":"gold"}>{x.tag}</Tag><div><small>2008 · 09</small><p>{x.text}</p></div></div>)}</Panel>}

function MatchCenter({save,match,tipoff}) {
  const validation=useMemo(validateGame,[]);
  const played=save.played.includes("2008-09-selection");
  const isFinal=match.status==="final" || played;
  const qScores=[
    [21,18],[20,21],[19,20],[24,22]
  ];
  return <div className="matchPage">
    <div className={`scoreboard ${match.q===4&&match.status==="live"?"clutch":""}`}>
      <div className="team"><small>BLUE TEAM</small><b>{match.status==="idle"&&!played?0:(isFinal?84:match.blue)}</b></div>
      <div className="centerScore"><div className="live">{match.status==="live"&&<><i/> LIVE</>}</div><strong>{match.status==="live"?`Q${match.q}`:isFinal?"FINAL":"PRE-GAME"}</strong><span>{match.status==="live"?match.clock:"10:00"}</span></div>
      <div className="team right"><small>WHITE TEAM</small><b>{match.status==="idle"&&!played?0:(isFinal?81:match.white)}</b></div>
    </div>

    {match.status==="idle"&&!played && <Panel title="赛前确认" sub="省青年精英选拔赛 · 第一份正式球探档案">
      <div className="pregame">
        <div><Tag>脚本校验通过</Tag><h1>蓝队 vs 白队</h1><p>开赛后零战术操作，系统将自动播放至终场。比赛开始前已经验证最终比分、张刚峰得分、三分命中与助攻事件一致性。</p>
        <div className="validation"><span>FINAL {validation.blue}-{validation.white}</span><span>PTS {validation.zPts}</span><span>3PM {validation.zThrees}</span><span>AST {validation.zAst}</span></div></div>
        <button className="primary giant" onClick={tipoff}>TIP-OFF</button>
      </div>
    </Panel>}

    {match.status==="live" && <>
      <div className="liveGrid">
        <Panel title="张刚峰 · LIVE" sub="实时个人数据">
          <div className="liveStats"><Hud label="PTS" value={match.stats.pts} tone="gold"/><Hud label="REB" value={match.stats.reb}/><Hud label="AST" value={match.stats.ast} tone="green"/><Hud label="STL" value={match.stats.stl} tone="blue"/></div>
          <div className="winProb"><small>比赛态势</small><div><span style={{width:`${50+(match.blue-match.white)*2}%`}}/></div></div>
        </Panel>
        <Panel title="PLAY-BY-PLAY" sub="自动直播 · 无赛中指令">
          <div className="feed">{match.feed.map(p=><div className="feedItem" key={p.id}><span>Q{p.q} {p.clock}</span><p>{p.text}</p><b>{p.score}</b></div>)}</div>
        </Panel>
      </div>
    </>}

    {isFinal && <PostGame qScores={qScores} save={save}/>}
  </div>
}

function PostGame({qScores,save}) {
  const [tab,setTab]=useState("数据");
  const tabs=["数据","高阶","投篮","对位","关键时刻","偏差","诊断","成长结算"];
  return <div className="post">
    <div className="resultBanner"><Tag tone="green">FINAL</Tag><h1>蓝队 84 <span>—</span> 81 白队</h1><p>张刚峰 · 29 PTS · 5 REB · 9 AST · 2 STL</p><strong>OVR 67 → 68</strong></div>
    <div className="tabs">{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</div>
    <Panel title={tab==="数据"?"完整数据":tab}>
      {tab==="数据" && <div>
        <table><thead><tr><th>球队</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>总分</th></tr></thead><tbody>
          <tr><td>蓝队</td>{qScores.map((q,i)=><td key={i}>{q[0]}</td>)}<td><b>84</b></td></tr>
          <tr><td>白队</td>{qScores.map((q,i)=><td key={i}>{q[1]}</td>)}<td><b>81</b></td></tr>
        </tbody></table>
        <div className="box"><b>张刚峰</b><span>29 MIN</span><span>29 PTS</span><span>5 REB</span><span>9 AST</span><span>2 STL</span><span>3 3PM</span></div>
      </div>}
      {tab==="高阶" && <Report items={[["比赛影响","+12"],["助攻失误比","高于同组基线"],["组织价值","显著正向"],["防守事件","2 STL + 关键篮板"]]}/>}
      {tab==="投篮" && <Report items={[["三分命中","3"],["主要区域","弧顶 / 左翼"],["中距离","有效"],["篮下","转换与直线突破"]]}/>}
      {tab==="对位" && <Report items={[["主要对位","郑铭"],["防守任务","侧翼第一持球点"],["结果","完成两次抢断并维持末节对抗"],["结论","高压样本通过"]]}/>}
      {tab==="关键时刻" && <Report items={[["Q4 06:39","中距离止血"],["Q4 03:56","底线反篮"],["Q4 02:05","关键抢断"],["Q4 00:52","强突终结锁定主动"]]}/>}
      {tab==="偏差" && <Report items={[["得分","高于赛前角色预期"],["组织","9 AST 显著超出基线"],["外线","3 记三分提供正向样本"],["失误","本版暂未建立正式基线"]]}/>}
      {tab==="诊断" && <Report items={[["优先提升","传球视野 / 三分稳定性"],["保持","速度、弹跳、外线防守"],["风险","内线防守与原地终结"],["角色趋势","第二持球点价值上升"]]}/>}
      {tab==="成长结算" && <Report items={[["OVR","67 → 68"],["档案","已自动写入"],["下一节点","2008年10月复训周已解锁"],["徽章","本场只累计样本，不自动跨级"]]}/>}
    </Panel>
  </div>
}
function Report({items}){return <div className="report">{items.map(([a,b])=><div key={a}><span>{a}</span><b>{b}</b></div>)}</div>}
function Modal({title,children,onClose}){return <div className="modalBack" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><h3>{title}</h3>{children}</div></div>}

createRoot(document.getElementById("root")).render(<App/>);
