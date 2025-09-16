import { Question, UserProgress, QuestionHistory, QuizSession } from "./types";
import {
  STORAGE_KEYS,
  DIFFICULTY_THRESHOLDS,
  DIFFICULTY_ORDER,
} from "./constants";

// 문제 관리 클래스
export class QuestionManager {
  // 로컬 스토리지에서 문제 목록 가져오기
  static getQuestions(): Question[] {
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return questions ? JSON.parse(questions) : [];
  }

  // 로컬 스토리지에 문제 목록 저장하기
  static saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  // 새 문제 추가
  static addQuestion(
    question: Omit<Question, "id" | "createdAt" | "updatedAt">
  ): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    questions.push(newQuestion);
    this.saveQuestions(questions);
    return newQuestion;
  }

  // 문제 수정
  static updateQuestion(id: string, updates: Partial<Question>): boolean {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === id);

    if (index === -1) return false;

    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveQuestions(questions);
    return true;
  }

  // 문제 삭제
  static deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const filteredQuestions = questions.filter((q) => q.id !== id);

    if (filteredQuestions.length === questions.length) return false;

    this.saveQuestions(filteredQuestions);
    return true;
  }

  // 특정 과목의 문제들 가져오기
  static getQuestionsBySubject(subject: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter((q) => q.subject === subject);
  }

  // 특정 난이도의 문제들 가져오기
  static getQuestionsByDifficulty(difficulty: string): Question[] {
    const questions = this.getQuestions();
    return questions.filter((q) => q.difficulty === difficulty);
  }

  // 특정 과목과 난이도의 문제들 가져오기
  static getQuestionsBySubjectAndDifficulty(
    subject: string,
    difficulty: string
  ): Question[] {
    const questions = this.getQuestions();
    return questions.filter(
      (q) => q.subject === subject && q.difficulty === difficulty
    );
  }

  // 랜덤 문제 선택 (퀴즈용)
  static getRandomQuestions(
    subject: string,
    difficulty: string,
    count: number
  ): Question[] {
    const availableQuestions = this.getQuestionsBySubjectAndDifficulty(
      subject,
      difficulty
    );

    if (availableQuestions.length === 0) return [];

    // 랜덤하게 섞기
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);

    // 요청한 개수만큼 반환
    return shuffled.slice(0, Math.min(count, availableQuestions.length));
  }
}

// 사용자 진도 관리 클래스
export class ProgressManager {
  // 사용자 진도 가져오기
  static getUserProgress(): UserProgress {
    const progress = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return progress
      ? JSON.parse(progress)
      : {
          averageScore: 0,
          totalPoints: 0,
          unlockedDifficulties: ["매우쉬움"],
          completedSubjects: [],
          questionHistory: [],
        };
  }

  // 사용자 진도 저장하기
  static saveUserProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  }

  // 퀴즈 결과 처리 및 진도 업데이트
  static processQuizResult(
    session: QuizSession,
    userAnswers: number[],
    questions: Question[]
  ): { newProgress: UserProgress; pointsEarned: number; score: number } {
    const currentProgress = this.getUserProgress();

    // 점수 계산
    let correctAnswers = 0;
    const questionHistory: QuestionHistory[] = [];

    userAnswers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = answer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      questionHistory.push({
        questionId: question.id,
        userAnswer: answer,
        isCorrect,
        score: isCorrect ? 100 : 0,
        completedAt: new Date().toISOString(),
        difficulty: question.difficulty,
        subject: question.subject,
      });
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const pointsEarned = correctAnswers; // 맞힌 문제 수만큼 포인트 획득

    // 새로운 진도 계산
    const newQuestionHistory = [
      ...currentProgress.questionHistory,
      ...questionHistory,
    ];
    const newTotalPoints = currentProgress.totalPoints + pointsEarned;

    // 평균 점수 재계산
    const allScores = newQuestionHistory.map((h) => h.score);
    const newAverageScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          )
        : 0;

    // 해금된 난이도 확인
    const newUnlockedDifficulties = [...currentProgress.unlockedDifficulties];
    const currentDifficultyIndex = DIFFICULTY_ORDER.indexOf(session.difficulty);

    // 현재 난이도를 통과했고, 다음 난이도가 있다면 해금
    if (
      score >= DIFFICULTY_THRESHOLDS[session.difficulty] &&
      currentDifficultyIndex < DIFFICULTY_ORDER.length - 1
    ) {
      const nextDifficulty = DIFFICULTY_ORDER[currentDifficultyIndex + 1];
      if (!newUnlockedDifficulties.includes(nextDifficulty)) {
        newUnlockedDifficulties.push(nextDifficulty);
      }
    }

    // 완료된 과목 확인
    const newCompletedSubjects = [...currentProgress.completedSubjects];
    if (!newCompletedSubjects.includes(session.subject)) {
      newCompletedSubjects.push(session.subject);
    }

    const newProgress: UserProgress = {
      averageScore: newAverageScore,
      totalPoints: newTotalPoints,
      unlockedDifficulties: newUnlockedDifficulties,
      completedSubjects: newCompletedSubjects,
      questionHistory: newQuestionHistory,
    };

    this.saveUserProgress(newProgress);

    return {
      newProgress,
      pointsEarned,
      score,
    };
  }

  // 특정 과목의 학습 진도 가져오기
  static getSubjectProgress(subject: string): {
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    completedDifficulties: string[];
  } {
    const progress = this.getUserProgress();
    const subjectHistory = progress.questionHistory.filter(
      (h) => h.subject === subject
    );

    const totalQuestions = subjectHistory.length;
    const correctAnswers = subjectHistory.filter((h) => h.isCorrect).length;
    const averageScore =
      totalQuestions > 0
        ? Math.round(
            subjectHistory.reduce((sum, h) => sum + h.score, 0) / totalQuestions
          )
        : 0;

    const completedDifficulties = Array.from(
      new Set(subjectHistory.map((h) => h.difficulty))
    );

    return {
      totalQuestions,
      correctAnswers,
      averageScore,
      completedDifficulties,
    };
  }
}
