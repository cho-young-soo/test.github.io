let preQuizPage = 99; // 사전 퀴즈 페이지
let quizPage = 99; // 퀴즈 페이지
let summaryPage = 99; // 학습 정리 페이지
let totalPage = 6; // 전체 페이지
let summaryCount = 3; // 학습 정리 페이지 수

// 사전 퀴즈
let preQuizList = new Array();

preQuizList.push({
  questionSymbol: "Q1"
  , questionText: "문제1"
  , answer: ["O"]
  , feedbackAnswer: "X"
  , feedbackExplanation: "해설"
});

preQuizList.push({
  questionSymbol: "Q2"
  , questionText: "문제2"
  , exam: ["보기1"
          , "보기2"
          , "보기3"
          , "보기4"]
  , answer: [1]
  , feedbackAnswer: "1"
  , feedbackExplanation: "해설"
});

// 퀴즈
let quizList = new Array();

quizList.push({
  questionSymbol: "Q1"
  , questionText: "화학물질관리법은 위해우려제품 평가 및 관리의 역할을 수행한다."
  , answer: ["x"]
  , feedbackAnswer: "x"
  , feedbackExplanation: "화학물질관리법에서는 통계조사 및 배출량 조사, 화학사고관리 계획서, 취급시설관리, 영업허가 및 화학사고 예방 및 대응을 다룹니다."
});

quizList.push({
  questionSymbol: "Q2"
  , questionText: "화학물질관리법은 총 1장에서 6장으로 구성되어 있다."
  , answer: ["x"]
  , feedbackAnswer: "x"
  , feedbackExplanation: "조사위원은 정부위원과 민간위원으로 구성되며 각 분야의 전문가들이 위촉됩니다. "
});

quizList.push({
  questionSymbol: "Q3"
  , questionText: "화학물질관리법은 화학사고에 대한 신속한 대응을 목적으로 한다."
  , answer: ["o"]
  , feedbackAnswer: "o"
  , feedbackExplanation: "화학물질관리법은 화학물질로부터 국민의 생명과 재산 및 환경을 보호하기 위해 만들어졌습니다."
});

// 자막
let subtitle = new Array();

subtitle[1]  = "01 페이지 자막";
subtitle[2]  = "02 페이지 자막";
subtitle[3]  = "03 페이지 자막";
subtitle[4]  = "04 페이지 자막";
subtitle[5]  = "05 페이지 자막";
subtitle[6]  = "06 페이지 자막";
subtitle[7]  = "07 페이지 자막";
subtitle[8]  = "08 페이지 자막";
subtitle[9]  = "09 페이지 자막";
subtitle[10] = "10 페이지 자막";
subtitle[11] = "11 페이지 자막";
subtitle[12] = "12 페이지 자막";
subtitle[13] = "13 페이지 자막";
subtitle[14] = "14 페이지 자막";
subtitle[15] = "15 페이지 자막";