import { Question } from "./types";
import { managementQuestions } from "./questions/managementQuestions";
import { railwayQuestions } from "./questions/railwayQuestions";

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];

  private constructor() {
    this.questions = [...managementQuestions, ...railwayQuestions];
  }

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  // 특정 과목과 난이도의 문제들을 가져오기
  public getQuestionsBySubjectAndDifficulty(
    subjectType: "management" | "railway",
    difficulty: string
  ): Question[] {
    console.log("=== 필터링 시작 ===");
    console.log("subjectType:", subjectType);
    console.log("difficulty:", difficulty);
    console.log("전체 문제 수:", this.questions.length);

    const filtered = this.questions.filter((question) => {
      const subjectMatch =
        (subjectType === "management" && question.subject.includes("경영")) ||
        (subjectType === "railway" && question.subject.includes("철도"));
      const difficultyMatch = question.difficulty === difficulty;

      console.log(
        `문제: ${question.id}, subject: ${question.subject}, difficulty: ${question.difficulty}`
      );
      console.log(
        `subjectMatch: ${subjectMatch}, difficultyMatch: ${difficultyMatch}`
      );

      return subjectMatch && difficultyMatch;
    });

    console.log("필터링 결과:", filtered.length, "개");
    console.log("=== 필터링 완료 ===");

    return filtered;
  }

  // 특정 과목의 모든 문제들을 가져오기
  public getQuestionsBySubject(
    subjectType: "management" | "railway"
  ): Question[] {
    return this.questions.filter(
      (question) =>
        (subjectType === "management" && question.subject.includes("경영")) ||
        (subjectType === "railway" && question.subject.includes("철도"))
    );
  }

  // 특정 난이도의 모든 문제들을 가져오기
  public getQuestionsByDifficulty(difficulty: string): Question[] {
    return this.questions.filter(
      (question) => question.difficulty === difficulty
    );
  }

  // 모든 문제들을 가져오기
  public getAllQuestions(): Question[] {
    return this.questions;
  }

  // 문제 ID로 특정 문제 가져오기
  public getQuestionById(id: string): Question | undefined {
    return this.questions.find((question) => question.id === id);
  }

  // 랜덤하게 문제들을 선택하기 (퀴즈용)
  public getRandomQuestions(
    subjectType: "management" | "railway",
    difficulty: string,
    count: number = 10
  ): Question[] {
    const filteredQuestions = this.getQuestionsBySubjectAndDifficulty(
      subjectType,
      difficulty
    );

    // 문제가 충분하지 않으면 모든 문제 반환
    if (filteredQuestions.length <= count) {
      return filteredQuestions;
    }

    // 랜덤하게 선택
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // 문제 추가
  public addQuestion(question: Question): void {
    this.questions.push(question);
  }

  // 문제 업데이트
  public updateQuestion(id: string, updatedQuestion: Question): boolean {
    const index = this.questions.findIndex((question) => question.id === id);
    if (index !== -1) {
      this.questions[index] = updatedQuestion;
      return true;
    }
    return false;
  }

  // 문제 삭제
  public deleteQuestion(id: string): boolean {
    const index = this.questions.findIndex((question) => question.id === id);
    if (index !== -1) {
      this.questions.splice(index, 1);
      return true;
    }
    return false;
  }

  // 통계 정보 가져오기
  public getStatistics() {
    const totalQuestions = this.questions.length;
    const managementQuestions = this.questions.filter((q) =>
      q.subject.includes("경영")
    ).length;
    const railwayQuestions = this.questions.filter((q) =>
      q.subject.includes("철도")
    ).length;

    const difficultyStats = this.questions.reduce((acc, question) => {
      acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions,
      managementQuestions,
      railwayQuestions,
      difficultyStats,
    };
  }
}

export const questionService = QuestionService.getInstance();
