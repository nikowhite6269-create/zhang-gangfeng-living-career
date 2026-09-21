import React, { useState } from "react";
import "./progress.css";

const OPTIONS = {
  A: {
    label: "外线投射强化",
    desc: "三分、接球投、运球后急停。验证首战外线表现能否重复。",
    effects: { "三分": 4, "中距离": 2 }
  },
  B: {
    label: "持球组织强化",
    desc: "传球视野、挡拆阅读、弱侧识别。继续测试 198cm 第二持球点价值。",
    effects: { "传球视野": 4, "传球准确": 2, "控球": 1 }
  },
  C: {
    label: "身体对抗与终结",
    desc: "力量、对抗上篮、突破终结。为更高级别比赛的身体强度做准备。",
    effects: { "力量": 4, "突破上篮": 2 }
  }
};

function summaryText(save) {
  const badges = save.badges.map(function(b){
    return b.name + " " + b.progress + "%(" + b.tier + ")";
  }).join("；");

  return [
    "【张刚峰 · LIVING CAREER 生涯联动摘要】",
    "时间：2008年10月",
    "球员：张刚峰｜16岁｜SG｜198cm｜88kg｜臂展212cm｜右手",
    "OVR：" + save.player.ovr + "｜潜力：S+ / POT99｜现金：¥0",
    "上一场：蓝队84–81白队｜张刚峰29 PTS / 5 REB / 9 AST / 2 STL",
    "当前节点：" + save.currentNode,
    "本周训练：" + (save.trainingWeek && save.trainingWeek.completed ? save.trainingWeek.label : "尚未完成"),
    "成长池：" + JSON.stringify(save.growth),
    "徽章：" + badges,
    "角色：" + save.role.role + "｜轮换" + save.role.minutes + "min｜USG " + save.role.usage + "%｜信任" + save.role.trust,
    "请根据此存档生成下一周剧情 / 训练 / 招募 / 比赛节点，并保持所有既有数值与事件连续。"
  ].join("\n");
}

export default function ProgressCenter({ save, updateSave, setScreen }) {
  const played = save.played.includes("2008-09-selection");
  const existing = save.trainingWeek || { id:"2008-10-w1", focus:null, label:null, completed:false };
  const [selected, setSelected] = useState(existing.focus || null);
  const [copied, setCopied] = useState(false);

  if (!played) {
    return (
      <div className="progress-panel">
        <div className="progress-kicker">当前节点</div>
        <h1>省青年精英选拔赛 · 蓝队 vs 白队</h1>
        <p>第一份正式高压样本尚未完成。完成比赛后，复训周与后续生涯推进将自动解锁。</p>
        <button className="primary" onClick={function(){ setScreen("match"); }}>前往比赛中心</button>
      </div>
    );
  }

  const completed = Boolean(existing.completed);

  function completeTraining() {
    if (!selected || completed) return;
    const opt = OPTIONS[selected];

    updateSave(function(prev){
      const growth = Object.assign({}, prev.growth);

      Object.entries(opt.effects).forEach(function(entry){
        const attr = entry[0];
        const add = entry[1];
        const old = growth[attr] || { raw:0, validated:0 };
        growth[attr] = { raw:old.raw + add, validated:old.validated };
      });

      const effectLine = Object.entries(opt.effects).map(function(entry){
        return entry[0] + "池+" + entry[1];
      }).join(" / ");

      const archiveId = "2008-10-w1-training";
      const hasArchive = prev.archive.some(function(a){ return a.id === archiveId; });
      const archive = hasArchive ? prev.archive : prev.archive.concat([{
        id: archiveId,
        date: "2008年10月·第1周",
        title: "选拔营复训周",
        result: opt.label,
        line: effectLine,
        ovr: String(prev.player.ovr)
      }]);

      return Object.assign({}, prev, {
        growth: growth,
        archive: archive,
        trainingWeek: { id:"2008-10-w1", focus:selected, label:opt.label, completed:true },
        currentNode: "2008-10-director-sync",
        unlocked: Array.from(new Set(prev.unlocked.concat(["2008-10-director-sync"]))),
        directorSync: { needed:true, reason:"2008年10月第1周复训完成，等待生涯导演生成下一周内容" },
        world: prev.world.concat([{
          tag:"复训",
          text:"张刚峰完成「" + opt.label + "」。训练结果已进入成长池，教练组将与首战高压样本合并评估。"
        }])
      });
    });
  }

  async function copySummary() {
    const text = summaryText(save);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(function(){ setCopied(false); }, 1800);
    } catch (e) {
      window.prompt("复制下面的生涯摘要并发回 ChatGPT：", text);
    }
  }

  return (
    <div className="progress-layout">
      <section className="progress-panel main">
        {!completed ? (
          <>
            <div className="progress-kicker">2008年10月 · 第1周 · 验证周</div>
            <h1>首战之后，教练组没有立刻公布名单。</h1>
            <p>张刚峰的 29 分引人注意，但真正改变评估的是 9 次助攻。教练组希望确认这不是单场波动，因此本周只能选择一个主要训练方向。</p>

            <div className="choice-grid">
              {Object.entries(OPTIONS).map(function(entry){
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
              <span>{selected ? "已选择：" + OPTIONS[selected].label : "请选择本周主训练方向"}</span>
              <button className="primary" disabled={!selected} onClick={completeTraining}>确认并完成本周训练</button>
            </div>
          </>
        ) : (
          <>
            <div className="progress-kicker done">本周完成 · 等待导演同步</div>
            <h1>{existing.label}</h1>
            <p>训练结果已经写入成长池和生涯档案。下一周剧情、训练、招募或比赛节点由聊天中的 Living Career 生涯导演继续生成。</p>

            <div className="sync-box">
              <div>
                <small>DIRECTOR SYNC</small>
                <strong>网页 → 生涯摘要 → ChatGPT → 下一周内容 → GitHub → Vercel</strong>
              </div>
              <button className="primary" onClick={copySummary}>{copied ? "已复制 ✓" : "复制生涯摘要"}</button>
            </div>

            <textarea className="summary-preview" readOnly value={summaryText(save)} />
          </>
        )}
      </section>

      <aside className="progress-panel side">
        <div className="progress-kicker">推进规则</div>
        <div className="step-list">
          <div><b>01</b><span>网页完成比赛 / 训练 / 结算</span></div>
          <div><b>02</b><span>点击“复制生涯摘要”</span></div>
          <div><b>03</b><span>把摘要发到当前聊天</span></div>
          <div><b>04</b><span>我生成下一周并更新 GitHub</span></div>
          <div><b>05</b><span>Vercel 自动部署后继续游玩</span></div>
        </div>
      </aside>
    </div>
  );
}
