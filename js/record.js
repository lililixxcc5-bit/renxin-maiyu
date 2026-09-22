/* 仁心脉语 · 健康档案查询脚本 (纯前端 localStorage 版) */

const HEALTH_KEY = 'rxmy_health_records';

function qs(id) { return document.getElementById(id); }

function escapeHTML(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function getHealthRecords() {
  try { return JSON.parse(localStorage.getItem(HEALTH_KEY) || '[]'); } catch (e) { return []; }
}

function renderRecord(rec, index) {
  const idx = String(index + 1).padStart(2, '0');
  const herbs = (rec.herbs || []).map(h =>
    `<span class="rec-herb">${escapeHTML(h)}</span>`
  ).join('');

  return `
    <article class="record-card">
      <header class="record-head">
        <span class="rec-date">${escapeHTML(rec.date)} · ${escapeHTML(rec.slot)}</span>
        <span class="rec-service">${escapeHTML(rec.serviceName)}</span>
        <span class="rec-code">${escapeHTML(rec.code)}</span>
      </header>
      <section class="record-diag">
        <div class="rec-label">${idx} / 辨证结果 / DIAGNOSIS</div>
        <div class="rec-constitution">${escapeHTML(rec.constitution)}</div>
        <div class="rec-syndrome">${escapeHTML(rec.syndrome)}</div>
        <p class="rec-desc">${escapeHTML(rec.desc)}</p>
      </section>
      <section class="record-metrics">
        <div class="rec-metric"><span class="rm-label">心率 / HR</span><span class="rm-value">${rec.heartRate} <em>bpm</em></span><span class="rm-sub">静坐状态</span></div>
        <div class="rec-metric"><span class="rm-label">体温 / TEMP</span><span class="rm-value">${rec.temperature} <em>℃</em></span><span class="rm-sub">红外体表</span></div>
        <div class="rec-metric"><span class="rm-label">面色 / FACE</span><span class="rm-value">${escapeHTML(rec.face || '—')}</span><span class="rm-sub">AI 人脸望诊</span></div>
        <div class="rec-metric"><span class="rm-label">舌象 / TONGUE</span><span class="rm-value">${escapeHTML(rec.tongue || '—')}</span><span class="rm-sub">舌象识别</span></div>
      </section>
      <section class="record-plan">
        <div class="rec-label">养生方案 / WELLNESS PLAN</div>
        <div class="rec-plan-grid">
          <div class="rec-plan-item"><h5>食疗建议</h5><p>${escapeHTML(rec.diet || '—')}</p></div>
          <div class="rec-plan-item"><h5>起居建议</h5><p>${escapeHTML(rec.life || '—')}</p></div>
          <div class="rec-plan-item"><h5>运动建议</h5><p>${escapeHTML(rec.exercise || '—')}</p></div>
          <div class="rec-plan-item"><h5>情志调养</h5><p>${escapeHTML(rec.emotion || '—')}</p></div>
        </div>
      </section>
      <section class="record-extra">
        <div class="rec-extra-block">
          <h5>推荐穴位</h5>
          <p>${escapeHTML(rec.acupoints || '—')}，每穴按摩 3–5 分钟，每日 1–2 次。</p>
        </div>
        <div class="rec-extra-block">
          <h5>参考药材</h5>
          <div class="rec-herbs">${herbs || '<span class="rec-empty-hint">暂无</span>'}</div>
        </div>
      </section>
    </article>
  `;
}

function queryRecords() {
  const phone = qs('record-phone').value.trim();
  const result = qs('record-result');

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    result.innerHTML = `
      <div class="record-empty">
        <div class="re-icon">!</div>
        <h3>手机号格式不正确</h3>
        <p>请输入 11 位有效手机号。</p>
      </div>
    `;
    return;
  }

  result.innerHTML = '<div class="record-loading">正在查询...</div>';

  const all = getHealthRecords();
  const list = all.filter(r => r.phone === phone);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!list.length) {
    result.innerHTML = `
      <div class="record-empty">
        <div class="re-icon">档</div>
        <h3>未查询到健康档案</h3>
        <p>该手机号尚未生成辨证报告。<br>完成一次预约并等待管理员确认后，档案会自动生成。</p>
      </div>
    `;
    return;
  }

  const header = `
    <div class="record-summary">
      <span class="rs-label">HEALTH ARCHIVE</span>
      <span class="rs-title">共 ${list.length} 份辨证报告</span>
      <span class="rs-phone">${escapeHTML(list[0].name)} · ${phone.slice(0, 3)}****${phone.slice(7)}</span>
    </div>
  `;

  result.innerHTML = header + list.map((r, i) => renderRecord(r, i)).join('') + `
    <div class="record-disclaimer">
      本档案由仁心脉语原型样机自动生成，仅作健康科普与教学实训参考，不构成医疗诊断，
      不可直接替代执业中医师诊疗。如有身体不适，请及时前往正规医疗机构就诊。
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('rxmy_last_phone');
    if (saved && /^1[3-9]\d{9}$/.test(saved)) {
      qs('record-phone').value = saved;
    }
  } catch (e) {}

  qs('record-query').addEventListener('click', queryRecords);
  qs('record-phone').addEventListener('keydown', e => {
    if (e.key === 'Enter') queryRecords();
  });

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.addEventListener('click', () => header.classList.toggle('open'));
});