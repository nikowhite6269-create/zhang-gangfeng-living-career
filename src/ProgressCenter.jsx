import React, { useMemo, useState } from "react";
import "./progress.css";

const BASE_OPTIONS = {
  A: {
    label: "外线投射强化",
    desc: "三分、接球投、运球后急停。提高外线稳定性与比赛空间价值。",
    effects: { "三分": 4, "中距离": 2 }
  },
  B: {
    label: "持球组织强化",
    desc: "传球视野、挡拆阅读、弱侧识别。继续发展第二持球点能力。",
    effects: { "传球视野": 4, "传球准确": 2, "控球": 1 }
  },
  C: {
    label: "身体对抗与终结",
    desc: "力量、对抗上篮、突破终结。为更高级别比赛的身体强度做准备。",
    effects: { "力量": 4, "突破上篮": 2 }
  }
};

const WEEKS = {
  1: {
    date: "2008年10月 · 第1周",
    tag: "验证周",
    title: "首战之后，教练组没有立刻公布名单。",
    story: "张刚峰的 29 分引人注意，但真正改变评估的是 9 次助攻。教练组希望确认这不是单场波动，因此本周只能选择一个主要训练方向。",
    next: "2008-10-w2"
  },
  2: {
    date: "2008年10月 · 第2周",
    tag: "战术适配",
    title: "复训进入第二阶段：开始测试更复杂的后卫职责。",
    story: "教练组把张刚峰放进更多挡拆与弱侧联动场景，重点观察他能否在不增加失误的情况下维持组织价值。",
    next: "2008-10-w3"
  },
  3: {
    date: "2008年10月 · 第3周",
    tag: "高压准备",
    title: "U18 教练组来到场边，复训强度明显提高。",
    story: "训练内容开始模拟更高年龄组的身体对抗和轮转速度。你的训练方向将影响下一阶段的角色定位与成长池验证重点。",
    next: "2008-10-w4"
  },
  4: {
    date: "2008年10月 · 第4周",
    tag: "月度评估",
    title: "复训月最后一周，教练组准备提交阶段评估。",
    story: "本周结束后，系统会根据首战表现、训练选择与当前角色信任度自动结算 10 月阶段，并决定是否解锁 11 月 U18 集训节点。",
    next: "2008-11-u18"
  }
};

function ensureWeek(save) {
  return Math.min(4, Math.max(1, save.careerWeek || 1));
}

function effectLine(effects) {
  return Object.entries(effects).map(function(entry){
    return entry[0] + "池+" + entry[1];
  }).join(" / ");
}

export default function ProgressCenter({ save, updateSave, setScreen }) {
  const played = save.played.includes("2008-09-selection");
  const week = ensureWeek(save);
  const cfg = WEEKS[week];
  const savedTraining = save.trainingWeek && save.trainingWeek.week === week
    ? save.trainingWeek
    : { week:week, focus:null, label:null, completed:false };

  const [selected, setSelected] = useState(savedTraining.focus || null);
  const completed = Boolean(savedTraining.completed);
  const monthSettled = Boolean(save.octoberSettled);

  const progressValue = useMemo(function(){
    const base = 25 * (week - 1);
    return Math.min(100, base + (completed ? 25 : 0));
  }, [week, completed]);

  if (!played) {
    return (
      <div className="progress-panel">
        <div className="progress-kicker">当前节点</div>
        <h1>省青年精英选拔赛 · 蓝队 vs 白队</h1>
        <p>第一份正式高压样本尚未完成。完成比赛后，复训周与生涯自动推进系统将解锁。</p>
        <button className="primary" onClick={function(){ setScreen("match"); }}>前往比赛中心</button>
      </div>
    );
  }

  function completeTraining() {
    if (!selected || completed || monthSettled) return;
    const opt = BASE_OPTIONS[selected];

    updateSave(function(prev){
      const growth = Object.assign({}, prev.growth);

      Object.entries(opt.effects).forEach(function(entry){
        const attr = entry[0];
        const add = entry[1];
        const old = growth[attr] || { raw:0, validated:0 };
        growth[attr] = { raw:old.raw + add, validated:old.validated };
      });

      const archiveId = "2008-10-w" + week + "-training";
      const hasArchive = prev.archive.some(function(a){ return a.id === archiveId; });
      const archive = hasArchive ? prev.archive : prev.archive.concat([{
        id: archiveId,
        date: cfg.date,
        title: cfg.tag + " · " + opt.label,
        result: "训练完成",
        line: effectLine(opt.effects),
        ovr: String(prev.player.ovr)
      }]);

      const trustGain = selected === "B" ? 2 : 1;

      return Object.assign({}, prev, {
        growth: growth,
        archive: archive,
        role: Object.assign({}, prev.role, { trust: Math.min(100, prev.role.trust + trustGain) }),
        trainingWeek: { week:week, focus:selected, label:opt.label, completed:true },
        currentNode: "2008-10-w" + week + "-complete",
        directorSync: null,
        world: prev.world.concat([{
          tag:"复训",
          text:"第" + week + "周完成「" + opt.label + "」。训练结果进入成长池，教练信任 +" + trustGain + "。"
        }])
      });
    });
  }

  function advanceWeek() {
    if (!completed || monthSettled) return;

    updateSave(function(prev){
      if (week < 4) {
        const nextWeek = week + 1;
        return Object.assign({}, prev, {
          careerWeek: nextWeek,
          trainingWeek: { week:nextWeek, focus:null, label:null, completed:false },
          currentNode: "2008-10-w" + nextWeek,
          unlocked: Array.from(new Set(prev.unlocked.concat(["2008-10-w" + nextWeek]))),
          world: prev.world.concat([{
            tag:"日程",
            text:"复训进入 2008 年 10 月第 " + nextWeek + " 周，新训练任务已开放。"
          }])
        });
      }

      const passed = prev.player.ovr >= 68 && prev.role.trust >= 45;
      const nextWorld = passed
        ? "阶段评估通过：张刚峰获得 11 月广东 U18 集训邀请。"
        : "阶段评估结束：张刚峰继续留在复训观察组，等待下一次 U18 补录机会。";

      const archiveId = "2008-10-month-settlement";
      const hasArchive = prev.archive.some(function(a){ return a.id === archiveId; });
      const archive = hasArchive ? prev.archive : prev.archive.concat([{
        id: archiveId,
        date: "2008年10月",
        title: "复训月阶段评估",
        result: passed ? "获得广东 U18 集训邀请" : "继续复训观察",
        line: "OVR " + prev.player.ovr + " · 教练信任 " + prev.role.trust,
        ovr: String(prev.player.ovr)
      }]);

      return Object.assign({}, prev, {
        octoberSettled: true,
        u18Invite: passed,
        currentNode: passed ? "2008-11-u18-invite" : "2008-11-reassessment",
        unlocked: Array.from(new Set(prev.unlocked.concat([passed ? "2008-11-u18-invite" : "2008-11-reassessment"]))),
        archive: archive,
        world: prev.world.concat([{ tag:"评估", text:nextWorld }])
      });
    });
  }

  return (
    <div className="progress-layout">
      <section className="progress-panel main">
        <div className="progress-kicker">{monthSettled ? "2008年10月 · 阶段结算" : cfg.date + " · " + cfg.tag}</div>

        {monthSettled ? (
          <>
            <h1>{save.u18Invite ? "广东 U18 集训邀请已解锁" : "10 月复训结束"}</h1>
            <p>
              {save.u18Invite
                ? "首战表现与整月复训达到教练组要求。下一阶段将进入 2008 年 11 月 U18 集训节点。"
                : "本阶段暂未获得 U18 集训邀请，生涯将进入下一轮复训与补录观察。"}
            </p>
            <div className="sync-box">
              <div>
                <small>NEXT STAGE</small>
                <strong>{save.u18Invite ? "2008年11月 · 广东 U18 集训" : "2008年11月 · 补录观察"}</strong>
              </div>
              <button className="primary" onClick={function(){ setScreen("calendar"); }}>查看日程</button>
            </div>
          </>
        ) : !completed ? (
          <>
            <h1>{cfg.title}</h1>
            <p>{cfg.story}</p>

            <div className="choice-grid">
              {Object.entries(BASE_OPTIONS).map(function(entry){
                const key = entry[0];
                const opt = entry[1];
                return (
                  <button
                    key={key}
                    className={"choice-card " + (selected === key ? "selected" : "")}
                    onClick={function(){ setSelected(key); }}
                  >
                    <span className="choice-key">{key}</span>
                    <div>
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="progress-actions">
              <span>{selected ? "已选择：" + BASE_OPTIONS[selected].label : "请选择本周主训练方向"}</span>
              <button className="primary" disabled={!selected} onClick={completeTraining}>确认并完成本周训练</button>
            </div>
          </>
        ) : (
          <>
            <div className="progress-kicker done">本周完成</div>
            <h1>{savedTraining.label}</h1>
            <p>训练结果已经自动写入成长池、生涯档案和世界动态。现在不需要复制摘要，也不需要返回聊天同步。</p>
            <div className="sync-box">
              <div>
                <small>AUTO PROGRESSION</small>
                <strong>{week < 4 ? "继续推进到 2008 年 10 月第 " + (week + 1) + " 周" : "进行 10 月阶段评估并解锁 11 月节点"}</strong>
              </div>
              <button className="primary" onClick={advanceWeek}>{week < 4 ? "推进下一周" : "完成月度评估"}</button>
            </div>
          </>
        )}
      </section>

      <aside className="progress-panel side">
        <div className="progress-kicker">生涯自动推进</div>
        <div className="bar"><i className="green" style={{width:progressValue + "%"}} /></div>
        <div className="step-list">
          <div><b>01</b><span>选择本周训练方向</span></div>
          <div><b>02</b><span>系统自动写入成长池与档案</span></div>
          <div><b>03</b><span>点击“推进下一周”继续</span></div>
          <div><b>04</b><span>关键比赛仍进入比赛中心自动播放</span></div>
          <div><b>05</b><span>聊天仅作为可选的剧情扩展，不再是必需步骤</span></div>
        </div>
      </aside>
    </div>
  );
}
