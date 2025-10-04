import { Subject, DifficultyThreshold } from "./types";

// 과목 정보 상수
export const SUBJECTS: Subject[] = [
  {
    id: "management",
    name: "경영학 시작하기",
    type: "management",
    subjects: [
      "경영학-경영학원론",
      "경영학-인사관리",
      "경영학-마케팅관리",
      "전체 통합",
    ],
    description: "경영학 기초부터 고급까지 체계적 학습",
    icon: "📊",
    color: "bg-blue-500",
  },
  {
    id: "railway",
    name: "철도법령 시작하기",
    type: "railway",
    subjects: [
      "철도산업발전기본법(기본법+시행령)",
      "철도산업법(기본법+시행령)",
      "철도공사법(기본법+시행령)",
      "전체 통합",
    ],
    description: "철도 관련 법령 완전 정복",
    icon: "🚂",
    color: "bg-red-500",
  },
  {
    id: "syllogism",
    name: "삼단논법 시작하기",
    type: "syllogism",
    subjects: ["삼단논법 기초", "전체 통합"],
    description: "논리적 사고와 추론 능력 향상",
    icon: "🧠",
    color: "bg-purple-500",
  },
];

// 난이도별 통과 점수 상수
export const DIFFICULTY_THRESHOLDS: DifficultyThreshold = {
  매우쉬움: 60,
  쉬움: 65,
  보통: 80,
  어려움: 85,
  매우어려움: 90,
};

// 난이도별 해금 조건 (시도 횟수 + 점수)
export const DIFFICULTY_UNLOCK_CONDITIONS = {
  매우쉬움: { minAttempts: 0, minScore: 0 }, // 기본 해금
  쉬움: { minAttempts: 5, minScore: 65 },
  보통: { minAttempts: 5, minScore: 80 },
  어려움: { minAttempts: 5, minScore: 85 },
  매우어려움: { minAttempts: 5, minScore: 90 },
};

// 난이도 순서 (해금 순서)
export const DIFFICULTY_ORDER = [
  "매우쉬움",
  "쉬움",
  "보통",
  "어려움",
  "매우어려움",
];

// 포인트 시스템 상수
export const POINTS_PER_QUESTION = 1; // 문제당 획득 포인트
export const POINTS_FOR_DIFFICULTY_UNLOCK = 5; // 난이도 해금에 필요한 포인트

// 퀴즈 설정 상수
export const QUIZ_QUESTIONS_COUNT = 10; // 퀴즈당 문제 수

// 로컬 스토리지 키 상수
export const STORAGE_KEYS = {
  USER_PROGRESS: "userProgress",
  QUESTIONS: "questions",
  QUIZ_SESSIONS: "quizSessions",
} as const;
