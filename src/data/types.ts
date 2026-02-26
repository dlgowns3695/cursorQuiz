// 문제 타입 정의
export interface Question {
  // 정식 문제 관리(사용자 생성)에만 필요한 필드들은 선택(optional)로 두고,
  // 하드코딩된 문제 배열에서는 생략할 수 있게 합니다.
  id?: string;
  subject: string; // 과목명 (예: "철도산업법")
  difficulty?: "매우쉬움" | "쉬움" | "보통" | "어려움" | "매우어려움";
  question: string;
  options: string[];
  correctAnswer: number; // 정답 인덱스 (0부터 시작)
  explanation: string; // 해설
  points?: number; // 필요시만 사용 (현재 로직에서는 미사용)
  createdAt?: string; // 필요시만 사용 (사용자 생성 문제)
  updatedAt?: string; // 필요시만 사용 (사용자 생성 문제)
}

// 사용자 진도 타입 정의
export interface UserProgress {
  averageScore: number;
  totalPoints: number;
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
  type: "railway";
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
