import { Question } from "./types";
import { QUIZ_QUESTIONS_COUNT } from "./constants";
import * as railwayBasicLaw from "./questions/railway/railway_basic_law";
import * as railwayIndustryLaw from "./questions/railway/railway_industry_law";
import * as railwayCorporationLaw from "./questions/railway/railway_corporation_law";

/** UI·저장에서 쓰는 과목 키 → 문제 데이터의 subject 문자열 */
const RAILWAY_SUBJECT_GROUPS: Record<string, string[]> = {
  철도산업발전기본법: ["철도산업발전기본법"],
  철도산업법: ["철도산업법"],
  철도공사법: ["철도공사법"],
  "철도산업발전기본법(기본법+시행령)": ["철도산업발전기본법"],
  "철도산업법(기본법+시행령)": ["철도산업법"],
  "철도공사법(기본법+시행령)": ["철도공사법"],
};

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];
  private questionMap: Map<string, Question[]> = new Map();

  private constructor() {
    this.initializeQuestions();
    this.organizeQuestionsBySubjectAndDifficulty();
  }

  private initializeQuestions() {
    const railwayQuestions: Question[] = [
      ...railwayBasicLaw.철도산업발전기본법,
      ...railwayIndustryLaw.철도산업법,
      ...railwayCorporationLaw.철도공사법,
    ];

    this.questions = this.shuffleArray(railwayQuestions);
  }

  private organizeQuestionsBySubjectAndDifficulty() {
    this.questions.forEach((question) => {
      const key = `${question.subject}_${question.difficulty}`;
      if (!this.questionMap.has(key)) {
        this.questionMap.set(key, []);
      }
      this.questionMap.get(key)!.push(question);
    });
  }

  public static getInstance(): QuestionService {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  public getQuestionsBySubjectName(subject: string): Question[] {
    if (subject === "전체 통합") {
      return this.questions.filter((question) =>
        question.subject.includes("철도")
      );
    }

    const targets = RAILWAY_SUBJECT_GROUPS[subject];
    if (!targets) {
      return [];
    }

    return this.questions.filter((question) =>
      targets.includes(question.subject)
    );
  }

  public getRandomQuestionsBySubject(
    subject: string,
    count: number = QUIZ_QUESTIONS_COUNT
  ): Question[] {
    const filtered = this.getQuestionsBySubjectName(subject);
    if (filtered.length <= count) return [...filtered];
    const shuffled = this.shuffleArray([...filtered]);
    return shuffled.slice(0, count);
  }

  public getQuestionsBySubjectAndDifficulty(
    subjectType: "railway",
    difficulty: string
  ): Question[] {
    return this.questions.filter((question) => {
      const subjectMatch =
        subjectType === "railway" && question.subject.includes("철도");
      const difficultyMatch = question.difficulty === difficulty;
      return subjectMatch && difficultyMatch;
    });
  }

  public getQuestionsBySubject(subjectType: "railway"): Question[] {
    return this.questions.filter(
      (question) =>
        subjectType === "railway" && question.subject.includes("철도")
    );
  }

  public getQuestionsByDifficulty(difficulty: string): Question[] {
    return this.questions.filter(
      (question) => question.difficulty === difficulty
    );
  }

  public getAllQuestions(): Question[] {
    return this.questions;
  }

  public getQuestionById(id: string): Question | undefined {
    return this.questions.find((question) => question.id === id);
  }

  public getQuestionByQuestionId(questionId: number): Question | undefined {
    return this.questions.find((question) => question.questionId === questionId);
  }

  public getQuestionsBySubjectAndDifficultyNew(
    subjectType: "railway",
    subject: string,
    difficulty: string
  ): Question[] {
    return this.questions.filter((question) => {
      if (subjectType !== "railway") return false;

      let subjectMatch = false;
      if (subject === "전체 통합") {
        subjectMatch = question.subject.includes("철도");
      } else {
        const targets = RAILWAY_SUBJECT_GROUPS[subject];
        if (targets) {
          subjectMatch = targets.includes(question.subject);
        }
      }

      const difficultyMatch = question.difficulty === difficulty;
      return subjectMatch && difficultyMatch;
    });
  }

  public getRandomQuestions(
    subjectType: "railway",
    difficulty: string,
    count: number = 5
  ): Question[] {
    const filteredQuestions = this.getQuestionsBySubjectAndDifficulty(
      subjectType,
      difficulty
    );

    if (filteredQuestions.length <= count) {
      return filteredQuestions;
    }

    const shuffled = this.shuffleArray([...filteredQuestions]);
    return shuffled.slice(0, count);
  }

  public getRandomQuestionsNew(
    subjectType: "railway",
    subject: string,
    difficulty: string,
    count: number = 5
  ): Question[] {
    const filteredQuestions = this.getQuestionsBySubjectAndDifficultyNew(
      subjectType,
      subject,
      difficulty
    );

    if (filteredQuestions.length <= count) {
      return filteredQuestions;
    }

    const shuffled = this.shuffleArray([...filteredQuestions]);
    return shuffled.slice(0, count);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public addQuestion(question: Question): void {
    this.questions.push(question);
  }

  public updateQuestion(id: string, updatedQuestion: Question): boolean {
    const index = this.questions.findIndex((question) => question.id === id);
    if (index !== -1) {
      this.questions[index] = updatedQuestion;
      return true;
    }
    return false;
  }

  public deleteQuestion(id: string): boolean {
    const index = this.questions.findIndex((question) => question.id === id);
    if (index !== -1) {
      this.questions.splice(index, 1);
      return true;
    }
    return false;
  }

  public getStatistics() {
    const totalQuestions = this.questions.length;
    const railwayQuestions = this.questions.filter((q) =>
      q.subject.includes("철도")
    ).length;

    const difficultyStats = this.questions.reduce((acc, question) => {
      const key = question.difficulty || "전체";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions,
      railwayQuestions,
      difficultyStats,
    };
  }
}

export const questionService = QuestionService.getInstance();
