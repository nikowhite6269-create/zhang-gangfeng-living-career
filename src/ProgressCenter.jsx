import React, { useMemo, useState } from "react";
import "./progress.css";

const OCT_OPTIONS = {
  A:{label:"外线投射强化",desc:"三分、接球投、运球后急停。提高外线稳定性与比赛空间价值。",effects:{"三分":4,"中距离":2}},
  B:{label:"持球组织强化",desc:"传球视野、挡拆阅读、弱侧识别。继续发展第二持球点能力。",effects:{"传球视野":4,"传球准确":2,"控球":1}},
  C:{label:"身体对抗与终结",desc:"力量、对抗上篮、突破终结。为更高级别比赛的身体强度做准备。",effects:{"力量":4,"突破上篮":2}}
};

const OCT_WEEKS = {
  1:{date:"2008年10月 · 第1周",tag:"验证周",title:"首战之后，教练组没有立刻公布名单。",story:"张刚峰的 29 分引人注意，但真正改变评估的是 9 次助攻。教练组希望确认这不是单场波动，因此本周只能选择一个主要训练方向。"},
  2:{date:"2008年10月 · 第2周",tag:"战术适配",title:"复训进入第二阶段：开始测试更复杂的后卫职责。",story:"教练组把张刚峰放进更多挡拆与弱侧联动场景，重点观察他能否在不增加失误的情况下维持组织价值。"},
  3:{date:"2008年10月 · 第3周",tag:"高压准备",title:"U18 教练组来到场边，复训强度明显提高。",story:"训练内容开始模拟更高年龄组的身体对抗和轮转速度。你的训练方向将影响下一阶段的角色定位与成长池验证重点。"},
  4:{date:"2008年10月 · 第4周",tag:"月度评估",title:"复训月最后一周，教练组准备提交阶段评估。",story:"本周结束后，系统会根据首战表现、训练选择与当前角色信任度自动结算 10 月阶段，并决定是否解锁 11 月 U18 集训节点。"}
};

const U18_OPTIONS = {
  A:{label:"U18 外线节奏",desc:"在更高速度和更长防守臂展下保持出手质量。",effects:{"三分":3,"中距离":2}},
  B:{label:"U18 挡拆阅读",desc:"面对更激进的延误与夹击，训练二次传导和弱侧识别。",effects:{"传球视野":3,"传球准确":3,"控球":1}},
  C:{label:"U18 对抗适应",desc:"提高对抗后的平衡、终结和防守换位承受力。",effects:{"力量":3,"突破上篮":2,"外线防守":1}}
};

const U18_WEEKS = {
  1:{date:"2008年11月 · U18第1周",tag:"报道周",title:"第一次以 U18 集训球员身份进入训练馆。",story:"对手年龄、力量和比赛阅读都更成熟。教练组没有给特殊待遇，张刚峰需要重新证明自己能在更高级别维持效率。"},
  2:{date:"2008年11月 · U18第2周",tag:"轮换竞争",title:"第二周开始争夺内部对抗赛轮换。",story:"教练组将训练表现和 10 月档案合并评估。完成本周后会解锁 U18 内部对抗赛节点。"}
};

function addGrowth(prev,effects){
  const growth=Object.assign({},prev.growth);
  Object.entries(effects).forEach(function(entry){
    const attr=entry[0], add=entry[1];
    const old=growth[attr]||{raw:0,validated:0};
    growth[attr]={raw:old.raw+add,validated:old.validated};
  });
  return growth;
}

function effectLine(effects){
  return Object.entries(effects).map(function(entry){return entry[0]+"池+"+entry[1];}).join(" / ");
}

export default function ProgressCenter({save,updateSave,setScreen}){
  const played=save.played.includes("2008-09-selection");
  const stage=save.careerStage || (save.octoberSettled && save.u18Invite ? "october-complete" : "october");
  const octWeek=Math.min(4,Math.max(1,save.careerWeek||1));
  const u18Week=Math.min(2,Math.max(1,save.u18Week||1));
  const isU18=stage==="u18";
  const cfg=isU18?U18_WEEKS[u18Week]:OCT_WEEKS[octWeek];
  const options=isU18?U18_OPTIONS:OCT_OPTIONS;
  const activeWeek=isU18?u18Week:octWeek;
  const trainingKey=isU18?"u18Training":"trainingWeek";
  const stored=save[trainingKey] && save[trainingKey].week===activeWeek ? save[trainingKey] : {week:activeWeek,focus:null,label:null,completed:false};
  const [selected,setSelected]=useState(stored.focus||null);
  const completed=Boolean(stored.completed);

  const progressValue=useMemo(function(){
    if(isU18) return Math.min(100,(u18Week-1)*50+(completed?50:0));
    return Math.min(100,(octWeek-1)*25+(completed?25:0));
  },[isU18,u18Week,octWeek,completed]);

  if(!played){
    return <div className="progress-panel">
      <div className="progress-kicker">当前节点</div>
      <h1>省青年精英选拔赛 · 蓝队 vs 白队</h1>
      <p>完成首场正式比赛后，生涯推进系统才会解锁。</p>
      <button className="primary" onClick={function(){setScreen("match");}}>前往比赛中心</button>
    </div>;
  }

  function completeTraining(){
    if(!selected||completed) return;
    const opt=options[selected];
    updateSave(function(prev){
      const growth=addGrowth(prev,opt.effects);
      const prefix=isU18?"2008-11-u18-w":"2008-10-w";
      const archiveId=prefix+activeWeek+"-training";
      const has=prev.archive.some(function(a){return a.id===archiveId;});
      const archive=has?prev.archive:prev.archive.concat([{
        id:archiveId,date:cfg.date,title:cfg.tag+" · "+opt.label,result:"训练完成",line:effectLine(opt.effects),ovr:String(prev.player.ovr)
      }]);
      const trustGain=selected==="B"?2:1;
      const patch={
        growth:growth,
        archive:archive,
        role:Object.assign({},prev.role,{trust:Math.min(100,prev.role.trust+trustGain)}),
        currentNode:prefix+activeWeek+"-complete",
        world:prev.world.concat([{tag:isU18?"U18":"复训",text:cfg.date+"完成「"+opt.label+"」，训练结果进入成长池，教练信任 +"+trustGain+"。"}])
      };
      patch[trainingKey]={week:activeWeek,focus:selected,label:opt.label,completed:true};
      return Object.assign({},prev,patch);
    });
  }

  function advance(){
    if(!completed) return;
    updateSave(function(prev){
      if(!isU18){
        if(octWeek<4){
          const next=octWeek+1;
          return Object.assign({},prev,{careerWeek:next,trainingWeek:{week:next,focus:null,label:null,completed:false},currentNode:"2008-10-w"+next});
        }
        const passed=prev.player.ovr>=68 && prev.role.trust>=45;
        return Object.assign({},prev,{
          octoberSettled:true,u18Invite:passed,careerStage:passed?"october-complete":"reassessment",
          currentNode:passed?"2008-11-u18-invite":"2008-11-reassessment",
          archive:prev.archive.concat([{id:"2008-10-month-settlement",date:"2008年10月",title:"复训月阶段评估",result:passed?"获得广东 U18 集训邀请":"继续复训观察",line:"OVR "+prev.player.ovr+" · 教练信任 "+prev.role.trust,ovr:String(prev.player.ovr)}]),
          world:prev.world.concat([{tag:"评估",text:passed?"阶段评估通过：获得 11 月广东 U18 集训邀请。":"阶段评估结束：继续留在复训观察组。"}])
        });
      }
      if(u18Week<2){
        const next=u18Week+1;
        return Object.assign({},prev,{u18Week:next,u18Training:{week:next,focus:null,label:null,completed:false},currentNode:"2008-11-u18-w"+next});
      }
      return Object.assign({},prev,{
        u18CampReady:true,
        currentNode:"2008-11-u18-scrimmage",
        archive:prev.archive.concat([{id:"2008-11-u18-camp-ready",date:"2008年11月",title:"广东 U18 集训 · 前两周",result:"内部对抗赛资格已解锁",line:"教练信任 "+prev.role.trust,ovr:String(prev.player.ovr)}]),
        world:prev.world.concat([{tag:"U18",text:"前两周集训完成，张刚峰进入内部对抗赛名单。"}])
      });
    });
  }

  function enterU18(){
    updateSave(function(prev){
      return Object.assign({},prev,{
        careerStage:"u18",u18Week:1,u18Training:{week:1,focus:null,label:null,completed:false},
        currentNode:"2008-11-u18-w1",
        role:Object.assign({},prev.role,{team:"广东 U18 青年队 · 集训组",role:"轮换侧翼 / 第二持球点"}),
        world:prev.world.concat([{tag:"U18",text:"张刚峰正式进入广东 U18 集训组，重新开始轮换竞争。"}])
      });
    });
  }

  if(stage==="reassessment"){
    return <div className="progress-layout">
      <section className="progress-panel main">
        <div className="progress-kicker">2008年11月 · 补录观察</div>
        <h1>10 月阶段评估未直接进入 U18 名单。</h1>
        <p>你不会被卡在日程页。系统会继续开放补录观察节点，后续版本将接入新的高压比赛与补录机会。</p>
      </section>
    </div>;
  }

  if(stage==="october-complete"){
    return <div className="progress-layout">
      <section className="progress-panel main">
        <div className="progress-kicker done">2008年10月 · 阶段结算完成</div>
        <h1>广东 U18 集训邀请已解锁</h1>
        <p>这里不再跳去日程页形成死循环。点击下面按钮会直接进入 11 月 U18 集训，并更新球队、角色与当前节点。</p>
        <div className="sync-box">
          <div><small>NEXT STAGE</small><strong>2008年11月 · 广东 U18 集训</strong></div>
          <button className="primary" onClick={enterU18}>进入 U18 集训</button>
        </div>
      </section>
      <aside className="progress-panel side">
        <div className="progress-kicker">状态</div>
        <div className="step-list"><div><b>✓</b><span>10 月复训完成</span></div><div><b>✓</b><span>阶段评估通过</span></div><div><b>→</b><span>下一步：U18 集训</span></div></div>
      </aside>
    </div>;
  }

  if(isU18 && save.u18CampReady){
    return <div className="progress-layout">
      <section className="progress-panel main">
        <div className="progress-kicker done">2008年11月 · U18 集训</div>
        <h1>内部对抗赛资格已解锁</h1>
        <p>前两周集训已经完成，下一步是正式的 U18 内部对抗赛。这个节点已经写入存档，不会再退回 10 月日程。</p>
        <div className="sync-box">
          <div><small>NEXT MATCH</small><strong>广东 U18 · 内部对抗赛</strong></div>
          <button className="primary" onClick={function(){setScreen("calendar");}}>查看比赛节点</button>
        </div>
      </section>
    </div>;
  }

  return <div className="progress-layout">
    <section className="progress-panel main">
      <div className="progress-kicker">{cfg.date+" · "+cfg.tag}</div>
      {!completed?<>
        <h1>{cfg.title}</h1>
        <p>{cfg.story}</p>
        <div className="choice-grid">
          {Object.entries(options).map(function(entry){
            const key=entry[0],opt=entry[1];
            return <button key={key} className={"choice-card "+(selected===key?"selected":"")} onClick={function(){setSelected(key);}}>
              <span className="choice-key">{key}</span><div><strong>{opt.label}</strong><p>{opt.desc}</p></div>
            </button>;
          })}
        </div>
        <div className="progress-actions">
          <span>{selected?"已选择："+options[selected].label:"请选择本周主训练方向"}</span>
          <button className="primary" disabled={!selected} onClick={completeTraining}>确认并完成本周训练</button>
        </div>
      </>:<>
        <div className="progress-kicker done">本周完成</div>
        <h1>{stored.label}</h1>
        <p>训练结果已经自动写入成长池、生涯档案和世界动态。</p>
        <div className="sync-box">
          <div><small>AUTO PROGRESSION</small><strong>{isU18?(u18Week<2?"推进到 U18 第2周":"解锁内部对抗赛"):(octWeek<4?"推进到 10 月第 "+(octWeek+1)+" 周":"完成 10 月阶段评估")}</strong></div>
          <button className="primary" onClick={advance}>{isU18?(u18Week<2?"推进下一周":"完成集训前两周"):(octWeek<4?"推进下一周":"完成月度评估")}</button>
        </div>
      </>}
    </section>
    <aside className="progress-panel side">
      <div className="progress-kicker">生涯自动推进</div>
      <div className="bar"><i className="green" style={{width:progressValue+"%"}} /></div>
      <div className="step-list">
        <div><b>01</b><span>选择训练方向</span></div><div><b>02</b><span>系统自动结算</span></div>
        <div><b>03</b><span>推进下一周</span></div><div><b>04</b><span>阶段结束直接进入下一阶段</span></div>
      </div>
    </aside>
  </div>;
}
