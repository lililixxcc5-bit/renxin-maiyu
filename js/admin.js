/* 仁心脉语 · 后台管理脚本 (纯前端 localStorage 版，适配 GitHub Pages) */

const STORAGE_KEY = 'rxmy_bookings';
const HEALTH_KEY = 'rxmy_health_records';
const STATUS_OPTIONS = ['待确认', '已确认', '已完成', '已取消', '已拒绝'];

function qs(id) { return document.getElementById(id); }

function getBookings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
}
function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function getHealthRecords() {
  try { return JSON.parse(localStorage.getItem(HEALTH_KEY) || '[]'); } catch (e) { return []; }
}
function saveHealthRecords(list) {
  localStorage.setItem(HEALTH_KEY, JSON.stringify(list));
}

/* ---------------- 纯前端模拟登录 ---------------- */
function login() {
  const username = qs('username').value;
  const password = qs('password').value;
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('admin_token', 'fake_token_for_demo');
    qs('login-area').style.display = 'none';
    qs('admin-area').style.display = 'block';
    loadBookings();
  } else {
    alert('账号或密码错误（演示账号：admin / admin123）');
  }
}

/* ---------------- 健康档案生成 ---------------- */
function generateHealthRecord(booking) {
  const idx = Math.floor(Math.random() * 8);
  const CONDITIONS = [
    { constitution: '气虚质', syndrome: '气虚证', desc: '元气不足，以神疲乏力、少气懒言、自汗等为主要特征。', face: '面色淡白', tongue: '舌质淡、苔薄白', diet: '宜食山药、黄芪、大枣。', life: '规律作息，避免熬夜。', exercise: '散步、太极拳。', emotion: '保持心情舒畅。', acupoints: '足三里、气海', herbs: ['山药','黄芪'] },
    { constitution: '阳虚质', syndrome: '阳虚证', desc: '阳气不足，以畏寒怕冷、手足不温、喜热饮食等虚寒表现为主要特征。', face: '面色㿠白、唇色淡', tongue: '舌质淡胖、苔白滑', diet: '宜食羊肉、生姜、桂圆。', life: '注意保暖。', exercise: '快走、慢跑。', emotion: '保持乐观。', acupoints: '命门、肾俞', herbs: ['当归','生姜'] },
    { constitution: '阴虚质', syndrome: '阴虚火旺', desc: '阴液亏少，以口燥咽干、手足心热、喜冷饮等虚热表现为主要特征。', face: '颧红、唇干', tongue: '舌红少苔', diet: '宜食银耳、百合。', life: '早睡早起。', exercise: '散步、游泳。', emotion: '保持平和。', acupoints: '太溪、三阴交', herbs: ['银耳','百合'] },
    { constitution: '痰湿质', syndrome: '脾虚湿盛', desc: '痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等为主要特征。', face: '面垢油光', tongue: '舌体胖大、苔白腻', diet: '宜食薏米、赤小豆。', life: '环境干燥通风。', exercise: '有氧运动。', emotion: '多参加户外活动。', acupoints: '丰隆、阴陵泉', herbs: ['薏米','赤小豆'] },
    { constitution: '湿热质', syndrome: '湿热蕴结', desc: '湿热内蕴，以面垢油光、口苦口干、易生痤疮等为主要特征。', face: '面垢油光、易生痤疮', tongue: '舌质红、苔黄腻', diet: '宜食绿豆、冬瓜。', life: '凉爽通风。', exercise: '大运动量有氧运动。', emotion: '心态平和。', acupoints: '阴陵泉、三阴交', herbs: ['绿豆','荷叶'] },
    { constitution: '血瘀质', syndrome: '血瘀证', desc: '血行不畅，以肤色晦暗、舌质紫暗、易忘事等为主要特征。', face: '面色晦暗', tongue: '舌质紫暗', diet: '宜食山楂、玫瑰花。', life: '注意保暖。', exercise: '促进血液循环的运动。', emotion: '心情舒畅。', acupoints: '血海、膈俞', herbs: ['山楂','玫瑰花'] },
    { constitution: '气郁质', syndrome: '肝郁气滞', desc: '长期情志不畅、气机郁滞，以性格内向、情绪不稳定、胸胁胀满等为主要特征。', face: '面色偏暗', tongue: '舌质淡红', diet: '宜食玫瑰花、陈皮。', life: '明亮通风。', exercise: '调节情绪的运动。', emotion: '培养乐观性格。', acupoints: '太冲、行间', herbs: ['玫瑰花','陈皮'] },
    { constitution: '气血两虚', syndrome: '气血两虚证', desc: '气血不足，以面色淡白、神疲乏力、心悸失眠等为主要特征。', face: '面色苍白', tongue: '舌质淡', diet: '宜食红枣、桂圆。', life: '保证充足睡眠。', exercise: '温和运动。', emotion: '心情愉悦。', acupoints: '足三里、血海', herbs: ['红枣','桂圆'] }
  ];
  const c = CONDITIONS[idx];
  return {
    id: 'hr_' + Date.now() + Math.floor(Math.random() * 1000),
    bookingId: booking.id, phone: booking.phone, name: booking.name,
    code: booking.code, serviceName: booking.typeTitle,
    date: booking.date, slot: booking.slot,
    constitution: c.constitution, syndrome: c.syndrome, desc: c.desc,
    face: c.face, tongue: c.tongue,
    heartRate: 72 + Math.floor(Math.random() * 10) - 4,
    temperature: (36.2 + Math.random() * 0.6).toFixed(1),
    diet: c.diet, life: c.life, exercise: c.exercise, emotion: c.emotion,
    acupoints: c.acupoints, herbs: c.herbs,
    createdAt: new Date().toLocaleString('zh-CN')
  };
}

function renderStats() {
  const list = getBookings();
  const pending = list.filter(b => b.status === '待确认').length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = list.filter(b => b.date === today).length;

  qs('admin-stats').innerHTML = `
    <div class="admin-stat"><b>${list.length}</b><span>累计预约总数</span></div>
    <div class="admin-stat"><b>${pending}</b><span>待确认预约</span></div>
    <div class="admin-stat"><b>${todayCount}</b><span>今日预约</span></div>
  `;
}

function renderRow(b) {
  const statusOptions = STATUS_OPTIONS.map(s =>
    `<option value="${s}" ${s === b.status ? 'selected' : ''}>${s}</option>`
  ).join('');

  return `
    <tr data-id="${b.id}">
      <td>#${b.id.slice(-4)}</td>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${b.org || '—'}</td>
      <td>${b.typeTitle}</td>
      <td>${b.date}</td>
      <td>${b.slot}</td>
      <td class="note-cell">${b.note ? b.note : '—'}</td>
      <td><span class="status-badge ${b.status}">${b.status}</span></td>
      <td>${b.createdAt}</td>
      <td>
        <select class="status-select" data-id="${b.id}">${statusOptions}</select>
        <button class="del-btn" data-id="${b.id}">删除</button>
      </td>
    </tr>
  `;
}

function renderTable(list) {
  const tbody = qs('admin-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="admin-empty">暂无符合条件的预约记录</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(renderRow).join('');

  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => updateStatus(sel.dataset.id, sel.value));
  });
  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteBooking(btn.dataset.id));
  });
}

function loadBookings() {
  qs('admin-tbody').innerHTML = '<tr><td colspan="11" class="admin-empty">正在加载...</td></tr>';
  
  let list = getBookings();
  const q = qs('search-input').value.trim().toLowerCase();
  const status = qs('status-filter').value;
  const date = qs('date-filter').value;
  
  if (q) list = list.filter(b => b.name.toLowerCase().includes(q) || b.phone.includes(q) || (b.org && b.org.toLowerCase().includes(q)));
  if (status && status !== 'all') list = list.filter(b => b.status === status);
  if (date) list = list.filter(b => b.date === date);

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  renderTable(list);
  renderStats();
}

function updateStatus(id, status) {
  let list = getBookings();
  const index = list.findIndex(b => b.id === id);
  if (index === -1) return;

  list[index].status = status;
  list[index].updatedAt = new Date().toLocaleString('zh-CN');
  saveBookings(list);

  if (status === '已确认') {
    const healthList = getHealthRecords();
    if (!healthList.find(h => h.bookingId === id)) {
      const record = generateHealthRecord(list[index]);
      healthList.push(record);
      saveHealthRecords(healthList);
      alert(`预约 #${id.slice(-4)} 已确认，并自动生成了健康档案！`);
    }
  }
  loadBookings();
}

function deleteBooking(id) {
  if (!confirm('确定要删除这条预约记录吗？此操作不可撤销。')) return;
  let list = getBookings();
  list = list.filter(b => b.id !== id);
  saveBookings(list);
  
  let healthList = getHealthRecords();
  healthList = healthList.filter(h => h.bookingId !== id);
  saveHealthRecords(healthList);

  loadBookings();
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('admin_token')) {
    qs('login-area').style.display = 'none';
    qs('admin-area').style.display = 'block';
    loadBookings();
  }

  qs('refresh-btn').addEventListener('click', loadBookings);
  qs('clear-filter-btn').addEventListener('click', () => {
    qs('search-input').value = '';
    qs('status-filter').value = 'all';
    qs('date-filter').value = '';
    loadBookings();
  });
  let searchTimer;
  qs('search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadBookings, 350);
  });
  qs('status-filter').addEventListener('change', loadBookings);
  qs('date-filter').addEventListener('change', loadBookings);

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.addEventListener('click', () => header.classList.toggle('open'));
});