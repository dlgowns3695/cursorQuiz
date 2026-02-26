import { Question } from "./types";
import { QUIZ_QUESTIONS_COUNT } from "./constants";
// 철도 관련 문제들 import
import * as railwayBasicLaw from "./questions/railway/railway_basic_law";
import * as railwayBasicLawRegulation from "./questions/railway/railway_basic_law_regulation";
import * as railwayIndustryLaw from "./questions/railway/railway_industry_law";
import * as railwayIndustryLawRegulation from "./questions/railway/railway_industry_law_regulation";
import * as railwayCorporationLaw from "./questions/railway/railway_corporation_law";
import * as railwayCorporationLawRegulation from "./questions/railway/railway_corporation_law_regulation";

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];
  private questionMap: Map<string, Question[]> = new Map();

  private constructor() {
    this.initializeQuestions();
    this.organizeQuestionsBySubjectAndDifficulty();
  }

  private initializeQuestions() {
    // 철도 관련 문제들을 6개 법령(기본법/시행령) 단위로 수집
    const railwayQuestions: Question[] = [
      // 철도산업발전기본법
      ...railwayBasicLaw.철도산업발전기본법,
      // 철도산업발전기본법_시행령
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령,
      // 철도산업법
      ...railwayIndustryLaw.철도산업법,
      // 철도산업법_시행령
      ...railwayIndustryLawRegulation.철도산업법_시행령,
      // 철도공사법
      ...railwayCorporationLaw.철도공사법,
      // 철도공사법_시행령
      ...railwayCorporationLawRegulation.철도공사법_시행령,
    ];

    // 철도 문제들을 랜덤하게 섞어서 저장
    this.questions = this.shuffleArray(railwayQuestions);
  }

  private organizeQuestionsBySubjectAndDifficulty() {
    // 과목별, 난이도별로 문제들을 맵에 저장
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

  // 특정 과목의 모든 문제 가져오기 (과목명 기준, 난이도 무관)
  public getQuestionsBySubjectName(subject: string): Question[] {
    // 과목명(법령 단위 또는 통합 이름)을 실제 문제 subject 값들로 매핑
    const subjectGroups: Record<string, string[]> = {
      // 새 구조: 각 법령별
      철도산업발전기본법: ["철도산업발전기본법"],
      "철도산업발전기본법 시행령": [
        "철도산업발전기본법 시행령",
        "철도산업발전기본법_시행령",
      ],
      철도산업법: ["철도산업법"],
      "철도산업법 시행령": ["철도산업법 시행령", "철도산업법_시행령"],
      철도공사법: ["철도공사법"],
      "철도공사법 시행령": ["철도공사법 시행령", "철도공사법_시행령"],

      // 이전 통합 이름도 그대로 지원 (기본법+시행령)
      "철도산업발전기본법(기본법+시행령)": [
        "철도산업발전기본법",
        "철도산업발전기본법 시행령",
        "철도산업발전기본법_시행령",
      ],
      "철도산업법(기본법+시행령)": [
        "철도산업법",
        "철도산업법 시행령",
        "철도산업법_시행령",
      ],
      "철도공사법(기본법+시행령)": [
        "철도공사법",
        "철도공사법 시행령",
        "철도공사법_시행령",
      ],
    };

    // 전체 통합은 철도 관련 모든 과목 포함
    if (subject === "전체 통합") {
      return this.questions.filter((question) =>
        question.subject.includes("철도")
      );
    }

    const targets = subjectGroups[subject];
    if (!targets) {
      return [];
    }

    return this.questions.filter((question) =>
      targets.includes(question.subject)
    );
  }

  // 과목만 지정해 랜덤 문제 가져오기 (난이도 없음, 퀴즈용)
  public getRandomQuestionsBySubject(
    subject: string,
    count: number = QUIZ_QUESTIONS_COUNT
  ): Question[] {
    const filtered = this.getQuestionsBySubjectName(subject);
    if (filtered.length <= count) return [...filtered];
    const shuffled = this.shuffleArray([...filtered]);
    return shuffled.slice(0, count);
  }

  // 특정 과목과 난이도의 문제들을 가져오기
  public getQuestionsBySubjectAndDifficulty(
    subjectType: "railway",
    difficulty: string
  ): Question[] {
    console.log("=== 필터링 시작 ===");
    console.log("subjectType:", subjectType);
    console.log("difficulty:", difficulty);
    console.log("전체 문제 수:", this.questions.length);

    const filtered = this.questions.filter((question) => {
      const subjectMatch =
        subjectType === "railway" && question.subject.includes("철도");
      const difficultyMatch = question.difficulty === difficulty;

      console.log(
        `문제: ${question.question}, subject: ${question.subject}, difficulty: ${question.difficulty}`
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
  public getQuestionsBySubject(subjectType: "railway"): Question[] {
    return this.questions.filter(
      (question) =>
        subjectType === "railway" && question.subject.includes("철도")
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

  // 특정 과목과 난이도의 문제들을 가져오기 (새로운 과목명 지원)
  public getQuestionsBySubjectAndDifficultyNew(
    subjectType: "railway",
    subject: string,
    difficulty: string
  ): Question[] {
    console.log("=== 새로운 필터링 시작 ===");
    console.log("subjectType:", subjectType);
    console.log("subject:", subject);
    console.log("difficulty:", difficulty);
    console.log("전체 문제 수:", this.questions.length);

    const filtered = this.questions.filter((question) => {
      if (subjectType !== "railway") return false;

      const subjectGroups: Record<string, string[]> = {
        철도산업발전기본법: ["철도산업발전기본법"],
        "철도산업발전기본법 시행령": [
          "철도산업발전기본법 시행령",
          "철도산업발전기본법_시행령",
        ],
        철도산업법: ["철도산업법"],
        "철도산업법 시행령": ["철도산업법 시행령", "철도산업법_시행령"],
        철도공사법: ["철도공사법"],
        "철도공사법 시행령": ["철도공사법 시행령", "철도공사법_시행령"],
        "철도산업발전기본법(기본법+시행령)": [
          "철도산업발전기본법",
          "철도산업발전기본법 시행령",
          "철도산업발전기본법_시행령",
        ],
        "철도산업법(기본법+시행령)": [
          "철도산업법",
          "철도산업법 시행령",
          "철도산업법_시행령",
        ],
        "철도공사법(기본법+시행령)": [
          "철도공사법",
          "철도공사법 시행령",
          "철도공사법_시행령",
        ],
      };

      let subjectMatch = false;

      if (subject === "전체 통합") {
        subjectMatch = question.subject.includes("철도");
      } else {
        const targets = subjectGroups[subject];
        if (targets) {
          subjectMatch = targets.includes(question.subject);
        }
      }

      const difficultyMatch = question.difficulty === difficulty;

      return subjectMatch && difficultyMatch;
    });

    // console.log("필터링 결과:", filtered.length, "개");
    // console.log("=== 새로운 필터링 완료 ===");

    return filtered;
  }

  // 랜덤하게 문제들을 선택하기 (퀴즈용)
  public getRandomQuestions(
    subjectType: "railway",
    difficulty: string,
    count: number = 5
  ): Question[] {
    const filteredQuestions = this.getQuestionsBySubjectAndDifficulty(
      subjectType,
      difficulty
    );

    // 문제가 충분하지 않으면 모든 문제 반환
    if (filteredQuestions.length <= count) {
      return filteredQuestions;
    }

    // Fisher-Yates 셔플 알고리즘으로 더 나은 랜덤성 제공
    const shuffled = this.shuffleArray([...filteredQuestions]);
    return shuffled.slice(0, count);
  }

  // 랜덤하게 문제들을 선택하기 (새로운 과목명 지원)
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

    // 문제가 충분하지 않으면 모든 문제 반환
    if (filteredQuestions.length <= count) {
      return filteredQuestions;
    }

    // Fisher-Yates 셔플 알고리즘으로 더 나은 랜덤성 제공
    const shuffled = this.shuffleArray([...filteredQuestions]);
    return shuffled.slice(0, count);
  }

  // Fisher-Yates 셔플 알고리즘
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
