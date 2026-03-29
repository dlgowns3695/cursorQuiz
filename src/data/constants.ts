import { Subject } from "./types";

// 과목 정보 상수
export const SUBJECTS: Subject[] = [
  {
    id: "railway",
    name: "철도법령 시작하기",
    type: "railway",
    subjects: [
      // 과목 선택은 3개 과목만 표시
      "철도산업발전기본법",
      "철도산업법",
      "철도공사법",
      "전체 통합",
    ],
    description: "철도 관련 법령 완전 정복",
    icon: "🚂",
    color: "bg-red-500",
  },
];

// 퀴즈 통과 기준 점수 (난이도 기능 제거 후 단일 기준)
export const PASS_SCORE = 60;

// 퀴즈 설정 상수
export const QUIZ_QUESTIONS_COUNT = 10; // 퀴즈당 문제 수

// 로컬 스토리지 키 상수
export const STORAGE_KEYS = {
  USER_PROGRESS: "userProgress",
  QUESTIONS: "questions",
  QUIZ_SESSIONS: "quizSessions",
  SOLVE_HISTORY: "solveHistory",
} as const;

/** 내장 문항 questionId 상위 구간 (백만 단위로 법령 구분) */
export const QUESTION_ID_PREFIX = {
  철도산업발전기본법: 1_000_000,
  철도산업법: 2_000_000,
  철도공사법: 3_000_000,
} as const;
