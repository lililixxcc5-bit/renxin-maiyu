/* 仁心脉语 · 站点脚本 (纯前端 localStorage 版，适配 GitHub Pages) */

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('无法加载数据：' + path);
  return res.json();
}

/* ---------------- 移动端导航 ---------------- */
function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => header.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(a =>
    a.addEventListener('click', () => header.classList.remove('open'))
  );
}

/* ---------------- 首页渲染 ---------------- */
function renderStats(stats) {
  const el = document.getElementById('hero-stats');
  if (!el) return;
  el.innerHTML = stats.map(s => `
    <div class="stat"><b>${s.value}</b><span>${s.label}</span></div>
  `).join('');
}
function renderPainPoints(points) {
  const el = document.getElementById('pain-grid');
  if (!el) return;
  el.innerHTML = points.map(p => `<div class="pain-item">${p}</div>`).join('');
}
function renderFeatures(features) {
  const el = document.getElementById('feature-grid');
  if (!el) return;
  el.innerHTML = features.map((f, i) => `
    <div class="feature-card">
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');
}
function renderWorkflow(steps) {
  const el = document.getElementById('flow-track');
  if (!el) return;
  el.innerHTML = steps.map(s => `
    <div class="flow-step">
      <div class="dot">${s.step}</div>
      <h4>${s.title}</h4>
      <p>${s.desc}</p>
    </div>
  `).join('');
}
function renderScenarios(scenarios) {
  const tabs = document.getElementById('scenario-tabs');
  const panels = document.getElementById('scenario-panels');
  if (!tabs || !panels) return;

  tabs.innerHTML = scenarios.map((s, i) => `
    <div class="scenario-tab${i === 0 ? ' active' : ''}" data-target="${s.id}">${s.title}</div>
  `).join('');

  panels.innerHTML = scenarios.map((s, i) => `
    <div class="scenario-panel${i === 0 ? ' active' : ''}" id="panel-${s.id}">
      <div>
        <div class="people">适用人群 · ${s.people}</div>
        <h3>${s.title}</h3>
        <p class="desc">${s.desc}</p>
        <div class="scenario-tags">${s.tags.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
      <div class="scenario-art">
        <div class="id-mark">${String(i + 1).padStart(2, '0')}</div>
        <div class="id-caption">${s.title} · 场景 ${String(i + 1).padStart(2, '0')} / ${scenarios.length}</div>
      </div>
    </div>
  `).join('');

  tabs.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
      panels.querySelectorAll('.scenario-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.target).classList.add('active');
    });
  });
}
function renderMarket(market) {
  const el = document.getElementById('market-grid');
  if (!el) return;
  el.innerHTML = market.map(m => `
    <div class="market-card">
      <img src="${m.img}" alt="${m.title}">
      <div class="cap">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>
    </div>
  `).join('');
}
function renderGallery(gallery) {
  const el = document.getElementById('gallery-grid');
  if (!el) return;
  el.innerHTML = gallery.map(g => `
    <div class="gallery-item">
      <img src="${g.img}" alt="${g.caption}">
      <div class="cap">${g.caption}</div>
    </div>
  `).join('');
}

async function initHomePage() {
  if (!document.body.classList.contains('page-home')) return;
  try {
    const data = await loadJSON('data/content.json');
    renderStats(data.stats);
    renderPainPoints(data.painPoints);
    renderFeatures(data.features);
    renderWorkflow(data.workflow);
    renderScenarios(data.scenarios);
    renderMarket(data.market);
    renderGallery(data.gallery);
  } catch (e) {
    console.error(e);
  }
}

/* ---------------- 预约页（纯前端版） ---------------- */
const STORAGE_KEY = 'rxmy_bookings';
const PHONE_KEY = 'rxmy_last_phone';
const DEFAULT_SLOTS = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "19:00 - 20:00"
];
const SLOT_CAPACITY = 3;

function getBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
}
function saveBookingLocal(entry) {
  const list = getBookings();
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}
function getTakenSlots(date) {
  if (!date) return [];
  const local = getBookings();
  return local.filter(b => b.date === date && b.status !== '已取消' && b.status !== '已拒绝').map(b => b.slot);
}
function findAvailableSlot(date, preferredSlot) {
  const taken = getTakenSlots(date);
  const usedCounts = {};
  DEFAULT_SLOTS.forEach(s => usedCounts[s] = 0);
  taken.forEach(s => { if (usedCounts[s] !== undefined) usedCounts[s]++; });

  if (usedCounts[preferredSlot] < SLOT_CAPACITY) {
    return { slot: preferredSlot, autoAssigned: false };
  }
  for (let s of DEFAULT_SLOTS) {
    if (usedCounts[s] < SLOT_CAPACITY) {
      return { slot: s, autoAssigned: true };
    }
  }
  return { slot: null, autoAssigned: false };
}

function renderTypes(types) {
  const el = document.getElementById('type-grid');
  if (!el) return;
  el.innerHTML = types.map((t, i) => `
    <label class="type-card${i === 0 ? ' selected' : ''}" data-id="${t.id}">
      <input type="radio" name="bookingType" value="${t.id}" ${i === 0 ? 'checked' : ''}>
      <h4>${t.title}</h4>
      <p>${t.desc}</p>
    </label>
  `).join('');

  el.querySelectorAll('.type-card').forEach(card => {
    card.addEventListener('click', () => {
      el.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input').checked = true;
    });
  });
}

async function renderSlots(slots) {
  const el = document.getElementById('slot-grid');
  if (!el) return;
  const dateInput = document.getElementById('field-date');

  async function draw() {
    const chosenDate = dateInput.value;
    const takenForDate = getTakenSlots(chosenDate);
    el.innerHTML = slots.map(s => {
      const taken = chosenDate && takenForDate.includes(s);
      return `<div class="slot${taken ? ' taken' : ''}" data-slot="${s}">${s}</div>`;
    }).join('');

    el.querySelectorAll('.slot:not(.taken)').forEach(slot => {
      slot.addEventListener('click', () => {
        el.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
      });
    });
  }

  await draw();
  dateInput.addEventListener('change', draw);
  return draw;
}

function renderNotices(notices) {
  const el = document.getElementById('notice-list');
  if (!el) return;
  el.innerHTML = notices.map(n => `<li>${n}</li>`).join('');
}

function renderMyBookings() {
  const el = document.getElementById('my-bookings-list');
  if (!el) return;
  const list = getBookings();
  if (!list.length) {
    el.innerHTML = '<p class="empty-hint">暂无预约记录，提交预约后将显示在这里（保存于本浏览器）。</p>';
    return;
  }
  el.innerHTML = list.map(b => `
    <div class="booking-row">
      <span><b>${b.name}</b> · ${b.typeTitle}</span>
      <span>${b.date} ${b.slot}</span>
    </div>
  `).join('');
}

function showMsg(html, ok) {
  const el = document.getElementById('form-msg');
  if (!el) return;
  el.innerHTML = html;
  el.className = 'form-msg show ' + (ok ? 'ok' : 'err');
}

async function initBookingPage() {
  if (!document.body.classList.contains('page-booking')) return;
  try {
    const data = await loadJSON('data/booking.json');
    renderTypes(data.types);
    renderNotices(data.notices);
    const redrawSlots = await renderSlots(data.timeSlots);
    renderMyBookings();

    const form = document.getElementById('booking-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('field-name').value.trim();
      const phone = document.getElementById('field-phone').value.trim();
      const org = document.getElementById('field-org').value.trim();
      const date = document.getElementById('field-date').value;
      const note = document.getElementById('field-note').value.trim();
      const typeInput = form.querySelector('input[name="bookingType"]:checked');
      const slotEl = document.querySelector('.slot.selected');

      if (!name || !phone || !date || !typeInput || !slotEl) {
        showMsg('请填写姓名、联系电话，并选择预约类型、日期与时段。', false);
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        showMsg('请填写正确的手机号码。', false);
        return;
      }

      const typeTitle = data.types.find(t => t.id === typeInput.value).title;
      const preferredSlot = slotEl.dataset.slot;

      const { slot: assignedSlot, autoAssigned } = findAvailableSlot(date, preferredSlot);
      if (!assignedSlot) {
        showMsg('该日期所有时段均已约满，请选择其他日期。', false);
        return;
      }

      const entry = {
        id: 'b' + Date.now() + Math.floor(Math.random() * 1000),
        code: 'RXMY' + new Date().toISOString().slice(5, 10).replace(/-/g, '') + Math.random().toString(36).substring(2, 6).toUpperCase(),
        name, phone, org, date, note,
        type: typeInput.value, typeTitle,
        slot: assignedSlot,
        status: '待确认',
        createdAt: new Date().toLocaleString('zh-CN')
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try { localStorage.setItem(PHONE_KEY, phone); } catch (err) {}

      saveBookingLocal(entry);
      renderMyBookings();
      form.reset();
      document.querySelectorAll('.type-card').forEach((c, i) => c.classList.toggle('selected', i === 0));
      await redrawSlots();

      let slotMsg = preferredSlot;
      if (autoAssigned && assignedSlot !== preferredSlot) {
        slotMsg = `${preferredSlot}（已自动改派至 ${assignedSlot}）`;
      }

      showMsg(
        `预约已提交！我们将在 1 个工作日内致电 ${phone} 确认「${typeTitle}」${date} ${slotMsg}。<br>` +
        `管理员确认后，可前往 <a href="record.html" style="color:inherit;text-decoration:underline;">健康档案</a> 页用手机号查询辨证报告。`,
        true
      );
      submitBtn.disabled = false;
    });
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHomePage();
  initBookingPage();
});


// 把这里的 URL 和 Key 替换成你刚才复制的真实值
const SUPABASE_URL = 'https://rmxmnlvlgwghzokibik.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2AW6IFyP5cOAizI0ziRR0Q_-Pe5O480';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);