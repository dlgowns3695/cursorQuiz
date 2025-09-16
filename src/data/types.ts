// 문제 타입 정의
export interface Question {
  id: string;
  subject: string; // 과목명 (예: "경영학원론", "철도산업법")
  difficulty: "매우쉬움" | "쉬움" | "보통" | "어려움" | "매우어려움";
  question: string;
  options: string[];
  correctAnswer: number; // 정답 인덱스 (0부터 시작)
  explanation: string; // 해설
  points: number; // 획득 가능한 포인트
  createdAt: string; // 생성일
  updatedAt: string; // 수정일
}

// 사용자 진도 타입 정의
export interface UserProgress {
  averageScore: number;
  totalPoints: number;
  unlockedDifficulties: string[];
  completedSubjects: string[];
  questionHistory: QuestionHistory[]; // 문제 풀이 이력
}

// 문제 풀이 이력 타입
export interface QuestionHistory {
  questionId: string;
  userAnswer: number;
  isCorrect: boolean;
  score: number;
  completedAt: string;
  difficulty: string;
  subject: string;
}

// 과목 타입 정의
export interface Subject {
  id: string;
  name: string;
  type: "management" | "railway";
  subjects: string[];
  description: string;
  icon: string;
  color: string;
}

// 난이도별 통과 점수 타입
export interface DifficultyThreshold {
  [key: string]: number;
}

// 퀴즈 세션 타입
export interface QuizSession {
  id: string;
  subject: string;
  difficulty: string;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: number[];
  startTime: string;
  endTime?: string;
  score?: number;
  isCompleted: boolean;
}

