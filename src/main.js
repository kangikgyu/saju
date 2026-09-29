import './style.css';
import { createIcons, CalendarDays, Clock3, ChevronRight, RotateCcw, ShieldCheck, Sparkles, Leaf, Flame, Mountain, CircleDot, Droplets, Info, ArrowUpRight, BookOpen, Download, PanelTop } from 'lucide';
import { calculateSaju, ELEMENTS, STEMS } from './engine.js';
import { buildReport } from './report.js';
import { calculateAnnual, compareSaju } from './extended.js';

const icons = { CalendarDays, Clock3, ChevronRight, RotateCcw, ShieldCheck, Sparkles, Leaf, Flame, Mountain, CircleDot, Droplets, Info, ArrowUpRight, BookOpen, Download, PanelTop };
const elements = {
  목: { icon: 'leaf', tone: 'wood', hanja: '木' }, 화: { icon: 'flame', tone: 'fire', hanja: '火' },
  토: { icon: 'mountain', tone: 'earth', hanja: '土' }, 금: { icon: 'circle-dot', tone: 'metal', hanja: '金' },
  수: { icon: 'droplets', tone: 'water', hanja: '水' },
};
let currentChart = null;
let currentReport = null;

function icon(name, className = '') {
  return `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function formatDate(date) {
  return `${date.year}.${String(date.month).padStart(2, '0')}.${String(date.day).padStart(2, '0')}`;
}

function setupPage() {
  const form = document.querySelector('#birth-form');
  const leapOption = document.querySelector('#leap-option');
  const unknown = document.querySelector('#unknown-time');
  const hour = document.querySelector('#birth-hour');
  const minute = document.querySelector('#birth-minute');
  form.addEventListener('change', () => {
    const lunar = form.elements.calendarType.value === 'lunar';
    leapOption.hidden = !lunar;
    if (!lunar) document.querySelector('#leap-month').checked = false;
    hour.disabled = unknown.checked;
    minute.disabled = unknown.checked;
    if (unknown.checked) { hour.value = ''; minute.value = ''; }
  });
  form.addEventListener('submit', handleSubmit);
  drawIcons();
}

function drawIcons() {
  createIcons({ icons, attrs: { 'stroke-width': 1.8 } });
}

function handleSubmit(event) {
  event.preventDefault();
  const error = document.querySelector('#form-error');
  error.hidden = true;
  const form = event.currentTarget;
  const input = {
    calendarType: form.elements.calendarType.value,
    year: document.querySelector('#birth-year').value,
    month: document.querySelector('#birth-month').value,
    day: document.querySelector('#birth-day').value,
    leapMonth: document.querySelector('#leap-month').checked,
    hour: document.querySelector('#unknown-time').checked || document.querySelector('#birth-hour').value === '' ? null : document.querySelector('#birth-hour').value,
    minute: document.querySelector('#birth-minute').value || 0,
  };
  try {
    if (input.year === '' || input.month === '' || input.day === '') throw new Error('태어난 해, 월, 일을 모두 입력해 주세요.');
    if (!document.querySelector('#unknown-time').checked && input.hour === null) throw new Error('태어난 시를 입력하거나, 시간을 모른다고 선택해 주세요.');
    currentChart = calculateSaju(input);
    currentReport = buildReport(currentChart);
    renderResult(currentChart, currentReport);
    document.querySelector('#empty-state').hidden = true;
    document.querySelector('#result-content').hidden = false;
    if (matchMedia('(max-width: 900px)').matches) document.querySelector('#result-column').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (cause) {
    error.textContent = cause.message || '입력값을 다시 확인해 주세요.';
    error.hidden = false;
  }
}

function pillarCard(name, pillar, index) {
  if (!pillar) return `<div class="pillar missing"><span class="pillar-label">${name}</span><span class="pillar-index">0${index}</span><span class="pillar-hanja">—</span><span class="pillar-korean">생시 미상</span><span class="pillar-god">계산하지 않음</span></div>`;
  return `<div class="pillar ${name === '일주' ? 'pillar-self' : ''}"><div class="pillar-top"><span class="pillar-label">${name}</span><span class="pillar-index">0${index}</span></div><div class="pillar-hanja"><span class="element-${elements[pillar.element].tone}">${pillar.stem}</span><span>${pillar.branch}</span></div><span class="pillar-korean">${pillar.korean}</span><span class="pillar-god">${pillar.stemGod}</span><div class="pillar-hidden">${pillar.hidden.map((entry) => `<span title="${entry.god}">${entry.name}<small>${entry.god}</small></span>`).join('')}</div></div>`;
}

function insightCards(cards) {
  return cards.map((card) => `<article class="insight-card"><span>${escapeHtml(card.label)}</span><h4>${escapeHtml(card.title)}</h4><p>${escapeHtml(card.body)}</p></article>`).join('');
}

function renderAnnual(chart, year) {
  const annual = calculateAnnual(chart, year);
  document.querySelector('#annual-result').innerHTML = `<div class="annual-summary"><div><span class="annual-pillar">${annual.hanja} <small>${annual.korean}년 · ${annual.god}</small></span><h4>${escapeHtml(annual.headline)}</h4><p>${escapeHtml(annual.intro)}</p></div></div><div class="insight-grid">${insightCards(annual.cards)}</div>`;
}

function setupPartnerForm(chart) {
  const form = document.querySelector('#partner-form');
  const error = document.querySelector('#partner-error');
  const result = document.querySelector('#compat-result');
  form.addEventListener('change', () => {
    const lunar = form.elements.partnerCalendarType.value === 'lunar';
    document.querySelector('#partner-leap-option').hidden = !lunar;
    if (!lunar) document.querySelector('#partner-leap').checked = false;
    const unknown = document.querySelector('#partner-unknown').checked;
    for (const id of ['partner-hour', 'partner-minute']) document.querySelector(`#${id}`).disabled = unknown;
    if (unknown) { document.querySelector('#partner-hour').value = ''; document.querySelector('#partner-minute').value = ''; }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.hidden = true;
    try {
      const input = {
        calendarType: form.elements.partnerCalendarType.value,
        year: document.querySelector('#partner-year').value,
        month: document.querySelector('#partner-month').value,
        day: document.querySelector('#partner-day').value,
        leapMonth: document.querySelector('#partner-leap').checked,
        hour: document.querySelector('#partner-unknown').checked ? null : document.querySelector('#partner-hour').value,
        minute: document.querySelector('#partner-minute').value || 0,
      };
      if (!input.year || !input.month || !input.day) throw new Error('두 번째 사람의 생년월일을 모두 입력해 주세요.');
      if (input.hour === '') throw new Error('태어난 시를 입력하거나, 시간을 모른다고 선택해 주세요.');
      const comparison = compareSaju(chart, calculateSaju(input));
      result.innerHTML = `<div class="compat-summary"><span>${escapeHtml(comparison.first.korean)} · ${escapeHtml(comparison.second.korean)}</span><h4>${escapeHtml(comparison.headline)}</h4><p>두 사람의 일간과 일지를 중심으로 비교합니다.${comparison.hasBothTimes ? '' : ' 생시가 없어도 일주 비교는 가능합니다.'}</p></div><div class="insight-grid">${insightCards(comparison.cards)}</div>`;
      result.hidden = false;
    } catch (cause) {
      error.textContent = cause.message || '입력값을 다시 확인해 주세요.';
      error.hidden = false;
      result.hidden = true;
    }
  });
}

function renderResult(chart, report) {
  const lunarLabel = `${formatDate(chart.lunarDate)}${chart.lunarDate.intercalation ? ' 윤달' : ''}`;
  const solarLabel = `${formatDate(chart.solarDate)}${chart.hasTime ? ` · ${String(chart.hour).padStart(2, '0')}:${String(chart.minute).padStart(2, '0')}` : ' · 생시 미상'}`;
  document.querySelector('#result-content').innerHTML = `
    <div class="result-head"><div><span class="eyebrow"><span class="eyebrow-line"></span> YOUR FOUR PILLARS</span><h2>당신의 사주, <em>네 개의 기둥</em></h2><p>양력 ${solarLabel}<span class="date-separator">/</span> 음력 ${lunarLabel}</p></div><button id="reset-result" class="reset-button" type="button" title="다시 입력하기" aria-label="다시 입력하기">${icon('rotate-ccw')}</button></div>
    <div class="pillar-grid">${pillarCard('년주', chart.pillars.year, 1)}${pillarCard('월주', chart.pillars.month, 2)}${pillarCard('일주', chart.pillars.day, 3)}${pillarCard('시주', chart.pillars.time, 4)}</div>
    <div class="result-footnote">${icon('info')} 천간은 위, 지지는 아래에 표시했습니다. 작은 글자는 지장간의 십성입니다.</div>
    <div class="data-grid">
      <section class="analysis-panel" aria-labelledby="elements-title"><div class="panel-heading"><div><span class="panel-kicker">FIVE ELEMENTS</span><h3 id="elements-title">오행의 흐름</h3></div><span class="panel-icon">${icon('sparkles')}</span></div><div class="element-list">${chart.distribution.map(({ element, percent }) => `<div class="element-row"><span class="element-name element-${elements[element].tone}">${icon(elements[element].icon)} ${element}<small>${elements[element].hanja}</small></span><div class="element-track"><span class="element-fill fill-${elements[element].tone}" style="width:${percent}%"></span></div><span class="element-percent">${percent}%</span></div>`).join('')}</div><p class="panel-caption">천간과 지장간에 가중치를 적용한 상대 비중</p></section>
      <section class="analysis-panel balance-panel" aria-labelledby="balance-title"><div class="panel-heading"><div><span class="panel-kicker">BALANCE NOTE</span><h3 id="balance-title">균형의 실마리</h3></div><span class="panel-icon">${icon('circle-dot')}</span></div><div class="balance-symbol element-${elements[chart.balance.element].tone}"><span>${elements[chart.balance.element].hanja}</span><small>${chart.balance.element}</small></div><div class="balance-copy"><span>용신 후보 · ${chart.balance.strength}</span><p>${escapeHtml(chart.balance.reason)}</p></div></section>
    </div>
    <section class="stars-section" aria-labelledby="stars-title"><div class="section-heading"><div><span class="panel-kicker">SYMBOLS</span><h3 id="stars-title">원국의 보조 상징</h3></div><span class="small-note">신살 4종</span></div><div class="star-list">${chart.stars.map((star) => `<div class="star-item ${star.active ? 'is-active' : ''}"><span class="star-status"></span><span class="star-name">${star.name}</span><span class="star-note">${star.active ? star.note : '해당 없음'}</span></div>`).join('')}</div></section>
    <section class="reading-section" aria-labelledby="reading-title"><div class="reading-intro"><span class="eyebrow"><span class="eyebrow-line"></span> A READING FOR YOU</span><h2 id="reading-title">${escapeHtml(report.headline)}</h2><p>${escapeHtml(report.intro)}</p></div><div class="reading-grid">${report.cards.map((card) => `<article class="reading-card"><div class="reading-card-top"><span>${card.index} / ${card.label}</span><span class="reading-spark">✳</span></div><h3>${card.title}</h3><p>${escapeHtml(card.body)}</p><div class="reading-prompt">${escapeHtml(card.prompt)}</div></article>`).join('')}</div></section>
    <section class="feature-section" id="annual-section" aria-labelledby="annual-title"><div class="feature-heading"><div><span class="panel-kicker">ANNUAL READING</span><h3 id="annual-title">신년운세</h3></div><label class="year-picker">살펴볼 해 <select id="annual-year" aria-label="신년운세 연도"></select></label></div><div id="annual-result" aria-live="polite"></div></section>
    <section class="feature-section" id="compat-section" aria-labelledby="compat-title"><div class="feature-heading"><div><span class="panel-kicker">RELATIONSHIP READING</span><h3 id="compat-title">사주 궁합</h3></div></div><p class="feature-lead">두 번째 사람의 생년월일을 입력해 일주를 비교해 보세요.</p><form id="partner-form" class="partner-form" novalidate><fieldset class="calendar-toggle" aria-label="두 번째 사람의 양력 또는 음력"><label><input type="radio" name="partnerCalendarType" value="solar" checked /><span>양력</span></label><label><input type="radio" name="partnerCalendarType" value="lunar" /><span>음력</span></label></fieldset><div class="field-grid date-grid"><label class="field"><span>태어난 해</span><div class="control"><input id="partner-year" type="number" min="1900" max="2050" inputmode="numeric" placeholder="1994" required /><small>년</small></div></label><label class="field"><span>월</span><div class="control"><input id="partner-month" type="number" min="1" max="12" inputmode="numeric" placeholder="07" required /><small>월</small></div></label><label class="field"><span>일</span><div class="control"><input id="partner-day" type="number" min="1" max="31" inputmode="numeric" placeholder="21" required /><small>일</small></div></label></div><label id="partner-leap-option" class="check-row" hidden><input id="partner-leap" type="checkbox" /><span>윤달</span></label><div class="field-grid time-grid"><label class="field"><span>시</span><div class="control"><input id="partner-hour" type="number" min="0" max="23" inputmode="numeric" placeholder="09" /><small>시</small></div></label><label class="field"><span>분</span><div class="control"><input id="partner-minute" type="number" min="0" max="59" inputmode="numeric" placeholder="00" /><small>분</small></div></label></div><label class="check-row"><input id="partner-unknown" type="checkbox" /><span>태어난 시간을 몰라요</span></label><p id="partner-error" class="form-error" role="alert" hidden></p><button class="submit-button" type="submit"><span>${icon('sparkles')} 궁합 살펴보기</span>${icon('chevron-right')}</button></form><div id="compat-result" aria-live="polite" hidden></div></section>
    <details class="method-details"><summary>${icon('book-open')} 계산과 해석 기준 ${icon('chevron-right')}</summary><div><p>한국 음력 변환은 KARI 기준 데이터를 사용하는 korean-lunar-calendar로 계산합니다. 년주와 월주는 입춘·절기 시각을 기준으로 하며, 절기 시각의 한국 표준시 차이를 반영합니다. 일주는 23시 이후에도 당일 기준, 시주는 입력한 한국 표준시를 사용합니다.</p><p>오행 비중은 네 천간과 지장간의 주기운·보조기운에 가중치를 준 상대값입니다. 용신 후보는 일간과 월지 계절감의 단순 균형 규칙에 따른 참고값으로, 전문 명리 상담의 종합 판단과 다를 수 있습니다. 신살은 도화·역마·천을귀인·문창귀인의 대표적인 조회표를 적용합니다.</p><p>생시를 모르면 시주를 제외하고 계산합니다. 태어난 지역의 진태양시·역사적 서머타임은 보정하지 않습니다.</p></div></details>
    <div class="result-actions"><button type="button" id="print-result">${icon('download')} 결과 저장 · 인쇄</button><span>결과는 브라우저에서만 생성됩니다</span></div>
  `;
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(1900, currentYear - 1);
  const endYear = Math.min(2050, currentYear + 5);
  const yearPicker = document.querySelector('#annual-year');
  yearPicker.innerHTML = Array.from({ length: endYear - startYear + 1 }, (_, index) => `<option value="${startYear + index}">${startYear + index}년</option>`).join('');
  yearPicker.value = String(Math.min(endYear, currentYear + (new Date().getMonth() >= 8 ? 1 : 0)));
  yearPicker.addEventListener('change', () => renderAnnual(chart, yearPicker.value));
  renderAnnual(chart, yearPicker.value);
  setupPartnerForm(chart);
  document.querySelector('#reset-result').addEventListener('click', () => {
    currentChart = null;
    currentReport = null;
    document.querySelector('#birth-form').reset();
    document.querySelector('#leap-option').hidden = true;
    document.querySelector('#birth-hour').disabled = false;
    document.querySelector('#birth-minute').disabled = false;
    document.querySelector('#form-error').hidden = true;
    document.querySelector('#result-content').hidden = true;
    document.querySelector('#empty-state').hidden = false;
    document.querySelector('#birth-year').focus();
  });
  document.querySelector('#print-result').addEventListener('click', () => window.print());
  drawIcons();
}

setupPage();
