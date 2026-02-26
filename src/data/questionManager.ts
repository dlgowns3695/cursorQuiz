import { Question, UserProgress, QuestionHistory, QuizSession } from "./types";
import { STORAGE_KEYS, PASS_SCORE } from "./constants";

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
    if (progress) {
      try {
        const parsedProgress = JSON.parse(progress);

        // 초기 상태에서 잘못된 해금 상태 방지
        const questionHistory = Array.isArray(parsedProgress.questionHistory)
          ? parsedProgress.questionHistory
          : [];

        return {
          averageScore:
            typeof parsedProgress.averageScore === "number"
              ? parsedProgress.averageScore
              : 0,
          totalPoints:
            typeof parsedProgress.totalPoints === "number"
              ? parsedProgress.totalPoints
              : 0,
          completedSubjects: Array.isArray(parsedProgress.completedSubjects)
            ? parsedProgress.completedSubjects
            : [],
          questionHistory,
        };
      } catch (error) {
        console.error("Failed to parse user progress:", error);
        // 파싱 실패 시 기본값 반환
      }
    }

    // 기본값 반환
    return {
      averageScore: 0,
      totalPoints: 0,
      completedSubjects: [],
      questionHistory: [],
    };
  }

  // 사용자 진도 저장하기
  static saveUserProgress(progress: UserProgress): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  }

  // 중복된 퀴즈 기록 정리하기
  static cleanDuplicateRecords(): UserProgress {
    const progress = this.getUserProgress();

    if (!progress.questionHistory || !Array.isArray(progress.questionHistory)) {
      return progress;
    }

    console.log("=== 중복 기록 정리 시작 ===");
    console.log("정리 전 questionHistory:", progress.questionHistory);

    // 중복 제거: 같은 과목, 난이도, 점수, 시간대(5분 이내)의 기록들을 하나만 남김
    const cleanedHistory: QuestionHistory[] = [];
    const seen = new Set<string>();

    progress.questionHistory.forEach((record) => {
      const key = `${record.subject}_${record.difficulty}_${record.score}`;
      const recordTime = new Date(record.completedAt).getTime();

      // 같은 키가 있고, 시간이 5분 이내인 경우 중복으로 간주
      let isDuplicate = false;
      if (seen.has(key)) {
        const existingRecord = cleanedHistory.find(
          (r) =>
            r.subject === record.subject &&
            r.difficulty === record.difficulty &&
            r.score === record.score
        );

        if (existingRecord) {
          const existingTime = new Date(existingRecord.completedAt).getTime();
          if (Math.abs(recordTime - existingTime) < 5 * 60 * 1000) {
            isDuplicate = true;
            console.log("중복 기록 제거:", record);
          }
        }
      }

      if (!isDuplicate) {
        cleanedHistory.push(record);
        seen.add(key);
      }
    });

    // 통계 재계산
    const newTotalPoints = cleanedHistory.reduce((sum, record) => {
      const correctAnswers = Math.round((record.score / 100) * 10); // 10문제 기준
      return sum + correctAnswers;
    }, 0);

    const allScores = cleanedHistory.map((h) => h.score);
    const newAverageScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          )
        : 0;

    const cleanedProgress: UserProgress = {
      ...progress,
      questionHistory: cleanedHistory,
      totalPoints: newTotalPoints,
      averageScore: newAverageScore,
    };

    console.log("정리 후 questionHistory:", cleanedHistory);
    console.log("새로운 totalPoints:", newTotalPoints);
    console.log("새로운 averageScore:", newAverageScore);

    this.saveUserProgress(cleanedProgress);
    return cleanedProgress;
  }

  // 퀴즈 결과 처리 및 진도 업데이트
  static processQuizResult(
    session: QuizSession,
    userAnswers: number[],
    questions: Question[]
  ): {
    newProgress: UserProgress;
    pointsEarned: number;
    score: number;
    isDuplicate: boolean;
  } {
    const currentProgress = this.getUserProgress();

    // questionHistory가 undefined이거나 배열이 아닌 경우 빈 배열로 초기화
    if (
      !currentProgress.questionHistory ||
      !Array.isArray(currentProgress.questionHistory)
    ) {
      currentProgress.questionHistory = [];
    }

    // 중복 체크: 같은 퀴즈 세션 ID가 이미 존재하는지 확인
    const existingRecord = currentProgress.questionHistory.find(
      (record) => record.questionId === session.id
    );

    if (existingRecord) {
      console.log("이미 처리된 퀴즈 세션입니다:", session.id);
      // 기존 데이터 반환
      return {
        newProgress: currentProgress,
        pointsEarned: 0,
        score: existingRecord.score,
        isDuplicate: true,
      };
    }

    // 점수 계산
    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const pointsEarned = correctAnswers; // 맞힌 문제 수만큼 포인트 획득

    // 퀴즈 세션을 하나의 단위로 기록
    const quizRecord: QuestionHistory = {
      questionId: session.id, // 퀴즈 세션 ID 사용
      userAnswer: 0, // 퀴즈 전체 점수
      // 난이도별 통과 기준 제거 → 단일 통과 기준 점수 사용
      isCorrect: score >= PASS_SCORE,
      score: score, // 퀴즈 전체 점수
      completedAt: new Date().toISOString(),
      difficulty: session.difficulty,
      subject: session.subject,
    };

    // 새로운 진도 계산
    const newQuestionHistory = [...currentProgress.questionHistory, quizRecord];
    const newTotalPoints = currentProgress.totalPoints + pointsEarned;

    // 평균 점수 재계산 (퀴즈 세션별 점수로 계산)
    const allScores = newQuestionHistory.map((h) => h.score);
    const newAverageScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          )
        : 0;

    // 완료된 과목 확인
    const newCompletedSubjects = [...currentProgress.completedSubjects];
    if (!newCompletedSubjects.includes(session.subject)) {
      newCompletedSubjects.push(session.subject);
    }

    const newProgress: UserProgress = {
      averageScore: newAverageScore,
      totalPoints: newTotalPoints,
      completedSubjects: newCompletedSubjects,
      questionHistory: newQuestionHistory,
    };

    this.saveUserProgress(newProgress);

    return {
      newProgress,
      pointsEarned,
      score,
      isDuplicate: false,
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

    // questionHistory가 존재하지 않는 경우 기본값 반환
    if (!progress.questionHistory || !Array.isArray(progress.questionHistory)) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        completedDifficulties: [],
      };
    }

    // 과목명 매핑: UI에서 사용하는 과목명을 실제 저장된 과목명으로 변환
    const subjectMapping: { [key: string]: string[] } = {
      "철도산업발전기본법(기본법+시행령)": [
        "철도산업발전기본법(기본법+시행령)",
        "철도산업발전기본법",
        "철도산업발전기본법 시행령",
      ],
      "철도산업법(기본법+시행령)": [
        "철도산업법(기본법+시행령)",
        "철도산업법",
        "철도산업법 시행령",
      ],
      "철도공사법(기본법+시행령)": [
        "철도공사법(기본법+시행령)",
        "철도공사법",
        "철도공사법 시행령",
      ],
    };

    // 매핑된 과목명들 가져오기
    const mappedSubjects = subjectMapping[subject] || [subject];

    const subjectHistory = progress.questionHistory.filter((h) =>
      mappedSubjects.includes(h.subject)
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

  /** 과목별 통계 (철도산업발전기본법, 철도산업법, 철도공사법, 전체 통합) */
  static getSubjectStats(): {
    [subjectKey: string]: {
      attempts: number;
      totalScore: number;
      averageScore: number;
    };
  } {
    const progress = this.getUserProgress();
    const history = progress.questionHistory || [];

    // 과목 키: UI 표시용 이름 → questionHistory의 subject 매칭용
    const subjectKeys = [
      "철도산업발전기본법",
      "철도산업법",
      "철도공사법",
      "전체 통합",
    ] as const;

    const subjectMapping: Record<(typeof subjectKeys)[number], string[]> = {
      철도산업발전기본법: [
        "철도산업발전기본법(기본법+시행령)",
        "철도산업발전기본법",
        "철도산업발전기본법 시행령",
      ],
      철도산업법: [
        "철도산업법(기본법+시행령)",
        "철도산업법",
        "철도산업법 시행령",
      ],
      철도공사법: [
        "철도공사법(기본법+시행령)",
        "철도공사법",
        "철도공사법 시행령",
      ],
      "전체 통합": [], // 아래에서 subject.includes("철도")로 필터
    };

    const result: {
      [subjectKey: string]: {
        attempts: number;
        totalScore: number;
        averageScore: number;
      };
    } = {};

    for (const key of subjectKeys) {
      const targets = subjectMapping[key];
      const filtered =
        key === "전체 통합"
          ? history.filter((h) => h.subject.includes("철도"))
          : history.filter((h) => targets.includes(h.subject));

      const attempts = filtered.length;
      const totalScore = filtered.reduce((sum, h) => sum + h.score, 0);
      const averageScore =
        attempts > 0 ? Math.round(totalScore / attempts) : 0;

      result[key] = { attempts, totalScore, averageScore };
    }

    return result;
  }

  // 전체 문제 풀이 데이터 초기화
  static resetAllProgress(): UserProgress {
    const initialProgress: UserProgress = {
      averageScore: 0,
      totalPoints: 0,
      completedSubjects: [],
      questionHistory: [],
    };

    this.saveUserProgress(initialProgress);
    return initialProgress;
  }
}
