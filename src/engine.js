import KoreanLunarCalendar from 'korean-lunar-calendar';
import { Solar } from 'lunar-javascript';

export const STEMS = {
  '甲': { ko: '갑', element: '목', polarity: '양' }, '乙': { ko: '을', element: '목', polarity: '음' },
  '丙': { ko: '병', element: '화', polarity: '양' }, '丁': { ko: '정', element: '화', polarity: '음' },
  '戊': { ko: '무', element: '토', polarity: '양' }, '己': { ko: '기', element: '토', polarity: '음' },
  '庚': { ko: '경', element: '금', polarity: '양' }, '辛': { ko: '신', element: '금', polarity: '음' },
  '壬': { ko: '임', element: '수', polarity: '양' }, '癸': { ko: '계', element: '수', polarity: '음' },
};

export const BRANCHES = {
  '子': { ko: '자', hidden: [['癸', 1]] }, '丑': { ko: '축', hidden: [['己', .6], ['癸', .25], ['辛', .15]] },
  '寅': { ko: '인', hidden: [['甲', .6], ['丙', .25], ['戊', .15]] }, '卯': { ko: '묘', hidden: [['乙', 1]] },
  '辰': { ko: '진', hidden: [['戊', .6], ['乙', .25], ['癸', .15]] }, '巳': { ko: '사', hidden: [['丙', .6], ['戊', .25], ['庚', .15]] },
  '午': { ko: '오', hidden: [['丁', .7], ['己', .3]] }, '未': { ko: '미', hidden: [['己', .6], ['丁', .25], ['乙', .15]] },
  '申': { ko: '신', hidden: [['庚', .6], ['壬', .25], ['戊', .15]] }, '酉': { ko: '유', hidden: [['辛', 1]] },
  '戌': { ko: '술', hidden: [['戊', .6], ['辛', .25], ['丁', .15]] }, '亥': { ko: '해', hidden: [['壬', .7], ['甲', .3]] },
};

export const ELEMENTS = ['목', '화', '토', '금', '수'];
const GOD_NAMES = {
  peer: ['비견', '겁재'], output: ['식신', '상관'], wealth: ['편재', '정재'],
  authority: ['편관', '정관'], resource: ['편인', '정인'],
};

function nextElement(element, steps = 1) {
  return ELEMENTS[(ELEMENTS.indexOf(element) + steps) % 5];
}

export function tenGod(dayStem, targetStem) {
  const day = STEMS[dayStem];
  const target = STEMS[targetStem];
  if (!day || !target) return null;
  const gap = (ELEMENTS.indexOf(target.element) - ELEMENTS.indexOf(day.element) + 5) % 5;
  const same = day.polarity === target.polarity;
  const group = ['peer', 'output', 'wealth', 'authority', 'resource'][gap];
  const index = group === 'peer' || group === 'output' || group === 'resource'
    ? (same ? 0 : 1) : (same ? 0 : 1);
  return GOD_NAMES[group][index];
}

function formatPillar(value, dayStem) {
  const [stem, branch] = [...value];
  return {
    stem, branch, hanja: value,
    korean: `${STEMS[stem].ko}${BRANCHES[branch].ko}`,
    element: STEMS[stem].element,
    stemGod: stem === dayStem ? '일간' : tenGod(dayStem, stem),
    hidden: BRANCHES[branch].hidden.map(([hiddenStem]) => ({
      stem: hiddenStem, name: STEMS[hiddenStem].ko, god: tenGod(dayStem, hiddenStem),
    })),
  };
}

function getElementDistribution(pillars) {
  const values = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  for (const pillar of pillars) {
    if (!pillar) continue;
    values[STEMS[pillar.stem].element] += 1;
    for (const [hiddenStem, weight] of BRANCHES[pillar.branch].hidden) {
      values[STEMS[hiddenStem].element] += weight;
    }
  }
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  return ELEMENTS.map((element) => ({
    element,
    weight: Math.round(values[element] * 100) / 100,
    percent: Math.round(values[element] / total * 100),
  }));
}

// Traditional auxiliary stars have several schools. These four use explicit, common lookup tables.
function getStars(pillars) {
  const year = pillars.year.branch;
  const day = pillars.day.branch;
  const branches = Object.values(pillars).filter(Boolean).map((pillar) => pillar.branch);
  const groups = [
    { members: '申子辰', flower: '酉', horse: '寅' },
    { members: '寅午戌', flower: '卯', horse: '申' },
    { members: '巳酉丑', flower: '午', horse: '亥' },
    { members: '亥卯未', flower: '子', horse: '巳' },
  ];
  const group = groups.find(({ members }) => members.includes(day)) || groups.find(({ members }) => members.includes(year));
  const nobleByStem = { 甲: '丑未', 乙: '子申', 丙: '亥酉', 丁: '亥酉', 戊: '丑未', 己: '子申', 庚: '丑未', 辛: '寅午', 壬: '巳卯', 癸: '巳卯' };
  const studyByStem = { 甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' };
  return [
    { name: '도화', active: branches.includes(group.flower), note: '표현력과 대인 매력의 상징' },
    { name: '역마', active: branches.includes(group.horse), note: '이동과 변화의 상징' },
    { name: '천을귀인', active: branches.some((branch) => nobleByStem[pillars.day.stem].includes(branch)), note: '도움과 인연의 상징' },
    { name: '문창귀인', active: branches.includes(studyByStem[pillars.day.stem]), note: '학습과 표현의 상징' },
  ];
}

function getBalanceHint(pillars, distribution) {
  const self = STEMS[pillars.day.stem].element;
  const resource = nextElement(self, 4);
  const month = STEMS[BRANCHES[pillars.month.branch].hidden[0][0]].element;
  const scores = Object.fromEntries(distribution.map(({ element, weight }) => [element, weight]));
  const selfShare = (scores[self] + scores[resource]) / Object.values(scores).reduce((a, b) => a + b, 0);
  const seasonalSupport = month === self || month === resource;
  const strong = selfShare + (seasonalSupport ? .12 : -.12) >= .5;
  const candidate = strong ? nextElement(self) : resource;
  const candidateObject = ['화', '토', '수'].includes(candidate) ? '를' : '을';
  return {
    element: candidate,
    strength: strong ? '왕한 편' : '약한 편',
    reason: strong
      ? `${self} 기운과 계절의 흐름을 고려해, 에너지를 밖으로 풀어주는 ${candidate}${candidateObject} 균형 후보로 보았습니다.`
      : `${self} 기운과 계절의 흐름을 고려해, 일간을 북돋는 ${candidate}${candidateObject} 균형 후보로 보았습니다.`,
  };
}

function ensureValidSolar(year, month, day) {
  const test = new Date(Date.UTC(year, month - 1, day));
  return test.getUTCFullYear() === year && test.getUTCMonth() === month - 1 && test.getUTCDate() === day;
}

export function calculateSaju(input) {
  const { calendarType = 'solar', year, month, day, hour = null, minute = 0, leapMonth = false } = input;
  const y = Number(year), m = Number(month), d = Number(day);
  const hasTime = hour !== null && hour !== undefined && hour !== '';
  const h = hasTime ? Number(hour) : 12;
  const min = hasTime ? Number(minute) : 0;
  if (![y, m, d, h, min].every(Number.isInteger) || y < 1900 || y > 2050 || h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error('1900~2050년의 올바른 생년월일시를 입력해 주세요.');
  }
  if (!['solar', 'lunar'].includes(calendarType)) throw new Error('양력 또는 음력을 선택해 주세요.');
  if (calendarType === 'solar' && leapMonth) throw new Error('윤달은 음력에서만 선택할 수 있어요.');

  const converter = new KoreanLunarCalendar();
  const valid = calendarType === 'lunar'
    ? converter.setLunarDate(y, m, d, Boolean(leapMonth))
    : converter.setSolarDate(y, m, d);
  if (!valid) throw new Error(calendarType === 'lunar' ? '해당 음력 날짜 또는 윤달이 존재하지 않아요.' : '올바른 양력 날짜를 입력해 주세요.');
  const solarDate = converter.getSolarCalendar();
  const lunarDate = converter.getLunarCalendar();
  if (!ensureValidSolar(solarDate.year, solarDate.month, solarDate.day)) throw new Error('날짜 변환을 확인할 수 없어요.');

  // lunar-javascript evaluates solar-term instants at UTC+8. Move KST input one hour back
  // for the year/month boundary while retaining the entered Korean clock for day/hour pillars.
  const boundary = new Date(Date.UTC(solarDate.year, solarDate.month - 1, solarDate.day, h - 1, min));
  const boundarySolar = Solar.fromYmdHms(
    boundary.getUTCFullYear(), boundary.getUTCMonth() + 1, boundary.getUTCDate(),
    boundary.getUTCHours(), boundary.getUTCMinutes(), 0,
  );
  const yearMonth = boundarySolar.getLunar().getEightChar();
  const dayTime = Solar.fromYmdHms(solarDate.year, solarDate.month, solarDate.day, h, min, 0).getLunar().getEightChar();
  dayTime.setSect(2); // 23:00-23:59 keeps the current day's pillar.
  const dayStem = dayTime.getDayGan();
  const pillars = {
    year: formatPillar(yearMonth.getYear(), dayStem),
    month: formatPillar(yearMonth.getMonth(), dayStem),
    day: formatPillar(dayTime.getDay(), dayStem),
    time: hasTime ? formatPillar(dayTime.getTime(), dayStem) : null,
  };
  const distribution = getElementDistribution(Object.values(pillars));
  return {
    solarDate, lunarDate, hasTime, hour: hasTime ? h : null, minute: hasTime ? min : null,
    pillars, distribution, dayMaster: STEMS[dayStem],
    balance: getBalanceHint(pillars, distribution),
    stars: getStars(pillars),
  };
}
