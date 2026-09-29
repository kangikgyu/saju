import { Solar } from 'lunar-javascript';
import { BRANCHES, ELEMENTS, STEMS, tenGod } from './engine.js';

const HARMONY = ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'];
const CLASH = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'];

export function branchRelation(first, second) {
  if (!BRANCHES[first] || !BRANCHES[second]) throw new Error('올바른 지지를 확인해 주세요.');
  if (first === second) return { kind: 'same', label: '같은 지지', description: '비슷한 반응 방식이 드러날 수 있습니다.' };
  const pair = [first, second].sort().join('');
  if (HARMONY.some((group) => [...group].sort().join('') === pair)) {
    return { kind: 'harmony', label: '일지 합', description: '서로 맞춰 볼 여지가 있다는 상징입니다.' };
  }
  if (CLASH.some((group) => [...group].sort().join('') === pair)) {
    return { kind: 'clash', label: '일지 충', description: '속도나 기대가 다를 수 있다는 상징입니다.' };
  }
  return { kind: 'neutral', label: '뚜렷한 합·충 없음', description: '한 가지 상징만으로 관계를 단정할 수 없습니다.' };
}

function dominantElement(chart) {
  return [...chart.distribution].sort((a, b) => b.weight - a.weight)[0].element;
}

function annualTheme(god) {
  if (['비견', '겁재'].includes(god)) return {
    focus: '자기 주도와 협력',
    work: '새 역할을 맡기 전에 협업 방식과 자신의 책임 범위를 확인해 보세요.',
    money: '공동 지출이나 경쟁적인 소비가 있다면 개인 예산의 경계를 먼저 정해 보세요.',
  };
  if (['식신', '상관'].includes(god)) return {
    focus: '표현과 결과물',
    work: '지금까지 쌓은 일을 눈에 보이는 성과로 정리해 이직 선택지를 비교해 보세요.',
    money: '새로운 시도에 쓸 시간과 비용을 구분해 두면 계획을 세우기 쉽습니다.',
  };
  if (['편재', '정재'].includes(god)) return {
    focus: '자원과 생활의 기준',
    work: '보상만이 아니라 업무 범위와 생활 리듬까지 함께 살펴보세요.',
    money: '수입·지출을 실제 숫자로 점검하고 감당 가능한 위험 범위를 정해 보세요.',
  };
  if (['편관', '정관'].includes(god)) return {
    focus: '역할과 책임',
    work: '이직을 고민한다면 직함보다 기대 역할과 의사결정 권한을 먼저 확인해 보세요.',
    money: '고정비와 장기 약속을 점검해 선택의 여지를 남겨두세요.',
  };
  return {
    focus: '배움과 준비',
    work: '새로운 자리에 필요한 기술과 경험을 구체적으로 적어 보세요.',
    money: '당장 큰 결정보다 정보 수집과 비상자금 점검에 시간을 써 보세요.',
  };
}

export function calculateAnnual(chart, targetYear) {
  const year = Number(targetYear);
  if (!Number.isInteger(year) || year < 1900 || year > 2050) {
    throw new Error('1900~2050년 중 살펴볼 연도를 선택해 주세요.');
  }
  // July is safely after Ipchun; the selected year's pillar applies until the next Ipchun.
  const hanja = Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar().getEightChar().getYear();
  const [stem, branch] = [...hanja];
  const god = tenGod(chart.pillars.day.stem, stem);
  const theme = annualTheme(god);
  const relation = branchRelation(chart.pillars.day.branch, branch);
  return {
    year, hanja, korean: `${STEMS[stem].ko}${BRANCHES[branch].ko}`,
    stem, branch, element: STEMS[stem].element, god, relation,
    headline: `${year}년, ${theme.focus}의 흐름`,
    intro: `${year}년 입춘 이후의 ${STEMS[stem].element} 기운은 일간에 ${god}으로 읽힙니다. ${relation.description} 이는 한 해의 사건을 예언하지 않고 원국과 세운을 비교한 참고 해석입니다.`,
    cards: [
      { label: '관계', title: relation.label, body: `${relation.description} 중요한 관계에서는 상대의 기대와 자신의 필요를 직접 확인해 보세요.` },
      { label: '일 · 이직운', title: '일의 선택', body: theme.work },
      { label: '재물', title: '자원의 기준', body: theme.money },
    ],
  };
}

function stemInteraction(firstElement, secondElement) {
  const gap = (ELEMENTS.indexOf(secondElement) - ELEMENTS.indexOf(firstElement) + 5) % 5;
  if (gap === 0) return '두 사람의 일간이 같은 오행이라 익숙한 관점을 나누기 쉽지만, 비슷한 고집은 직접 조율해야 합니다.';
  if (gap === 1 || gap === 4) return '일간의 오행이 서로 이어지는 관계입니다. 한쪽의 도움을 당연하게 여기지 않는 대화가 중요합니다.';
  return '일간의 오행이 서로 다른 기준을 자극하는 관계입니다. 의견 차이를 우열이 아닌 역할 차이로 다뤄 보세요.';
}

export function compareSaju(first, second) {
  const firstElement = first.dayMaster.element;
  const secondElement = second.dayMaster.element;
  const relation = branchRelation(first.pillars.day.branch, second.pillars.day.branch);
  const firstDominant = dominantElement(first);
  const secondDominant = dominantElement(second);
  return {
    first: first.pillars.day,
    second: second.pillars.day,
    relation,
    firstDominant,
    secondDominant,
    hasBothTimes: first.hasTime && second.hasTime,
    headline: `${first.pillars.day.korean}과 ${second.pillars.day.korean}의 대화`,
    cards: [
      { label: '일간의 관계', title: `${firstElement} · ${secondElement}`, body: stemInteraction(firstElement, secondElement) },
      { label: '일지의 관계', title: relation.label, body: `${relation.description} 실제 궁합은 대화 방식과 생활 조건에 따라 달라집니다.` },
      { label: '함께 살필 점', title: `${firstDominant} · ${secondDominant}`, body: `두 원국에서 상대적으로 두드러지는 오행은 각각 ${firstDominant}, ${secondDominant}입니다. 서로 편한 리듬과 불편한 상황을 구체적으로 나눠 보세요.` },
    ],
  };
}
