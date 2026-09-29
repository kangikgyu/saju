const ELEMENT_LANGUAGE = {
  목: { trait: '새로운 가능성을 발견하고 키워내는 힘', pace: '시작과 성장', relationship: '상대의 속도를 존중하며 관계를 키우는 대화', work: '새 영역을 배우고 기획을 펼치는 자리', money: '장기 목표를 세우고 꾸준히 쌓는 방식' },
  화: { trait: '마음을 밖으로 드러내고 사람을 움직이는 힘', pace: '표현과 확장', relationship: '감정을 솔직하게 전하되 잠시 듣는 여유', work: '아이디어를 공유하고 협업하는 자리', money: '소비에 의미를 붙이되 상한선을 정하는 방식' },
  토: { trait: '흩어진 일을 모아 안정적으로 완성하는 힘', pace: '조율과 신뢰', relationship: '상대의 기대와 자신의 경계를 함께 확인하는 대화', work: '운영을 다듬고 사람 사이를 연결하는 자리', money: '안정적인 현금 흐름을 점검하는 방식' },
  금: { trait: '복잡한 것에서 기준을 찾아 정리하는 힘', pace: '선택과 정돈', relationship: '기준을 말하기 전에 서로의 이유를 들어보는 대화', work: '분석하고 개선안을 구체화하는 자리', money: '기준을 세우고 불필요한 지출을 줄이는 방식' },
  수: { trait: '상황을 관찰하고 변화에 유연하게 대응하는 힘', pace: '탐색과 연결', relationship: '마음을 묻고 충분한 시간을 주는 대화', work: '정보를 읽고 문제의 흐름을 찾는 자리', money: '선택지를 비교하고 유동성을 확보하는 방식' },
};

function strongest(distribution) {
  return [...distribution].sort((a, b) => b.weight - a.weight)[0].element;
}

function weakest(distribution) {
  return [...distribution].sort((a, b) => a.weight - b.weight)[0].element;
}

export function buildReport(chart) {
  const self = chart.dayMaster.element;
  const strongestElement = strongest(chart.distribution);
  const weakestElement = weakest(chart.distribution);
  const weakestSubject = ['화', '토', '수'].includes(weakestElement) ? '가' : '이';
  const profile = ELEMENT_LANGUAGE[self];
  const strongestProfile = ELEMENT_LANGUAGE[strongestElement];
  const visibleGods = [chart.pillars.year, chart.pillars.month, chart.pillars.time]
    .filter(Boolean).map((pillar) => pillar.stemGod);
  const has = (name) => visibleGods.includes(name);
  const star = (name) => chart.stars.some((item) => item.name === name && item.active);

  return {
    headline: `${chart.dayMaster.ko}의 결, ${profile.pace}의 리듬`,
    intro: `${self} 일간을 중심으로 보면 ${profile.trait}이 먼저 눈에 들어옵니다. 네 기둥의 구성에서는 ${strongestElement} 기운이 상대적으로 두드러지고 ${weakestElement} 기운은 적은 편입니다.`,
    cards: [
      {
        key: 'nature', label: '성향', index: '01', title: '나의 기본 결',
        body: `${profile.trait}이 중심입니다. ${strongestElement}의 기운이 더해져 ${strongestProfile.pace}의 리듬이 강하게 나타날 수 있어요. ${weakestElement}${weakestSubject} 적다는 사실만으로 부족함을 뜻하지는 않습니다. 낯선 방식도 시도할 여지를 남겨두면 균형에 도움이 됩니다.`,
        prompt: `요즘 ${profile.pace} 중 어느 쪽에 더 에너지를 쓰고 있나요?`,
      },
      {
        key: 'love', label: '관계 · 연애', index: '02', title: '가까워지는 방식',
        body: `${profile.relationship}가 어울립니다. ${star('도화') ? '도화의 상징이 있어 첫인상과 표현의 힘을 살펴볼 만합니다. ' : ''}${has('정관') || has('정재') ? '약속을 지키고 일상의 신뢰를 쌓을 때 관계가 편안해질 수 있어요.' : '서로 다른 기대를 일찍 말로 확인하면 관계의 부담을 줄일 수 있어요.'}`,
        prompt: '상대에게 기대하는 것 한 가지를 먼저 말로 표현해 보세요.',
      },
      {
        key: 'work', label: '일 · 이직', index: '03', title: '움직일 때와 머물 때',
        body: `${profile.work}에서 자신의 장점을 활용해 볼 수 있습니다. ${star('역마') ? '역마는 이동과 변화를 읽는 보조 상징입니다. ' : ''}${has('편관') || has('정관') ? '역할과 책임의 크기를 먼저 따져보고, ' : '배울 수 있는 여지와 일의 자율성을 살펴보고, '}이직은 보상·성장·생활 리듬을 함께 비교해 결정하는 편이 좋겠습니다.`,
        prompt: '새로운 자리에서 가장 얻고 싶은 것은 무엇인가요?',
      },
      {
        key: 'money', label: '재물', index: '04', title: '돈을 다루는 리듬',
        body: `${profile.money}이 잘 맞을 수 있습니다. ${has('편재') || has('정재') ? '재성의 상징이 겉으로 드러나 있어 자원과 성과를 다루는 방식에 눈길이 갑니다. ' : ''}큰 결정을 앞두었다면 운세보다 실제 수입·지출과 위험 감당 범위를 먼저 확인하세요.`,
        prompt: '이번 달 꼭 지키고 싶은 재정 기준 하나를 정해 보세요.',
      },
    ],
  };
}
