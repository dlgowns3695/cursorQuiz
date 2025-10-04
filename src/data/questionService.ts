import { Question } from "./types";
import * as managementTheory from "./questions/management/managementTheory";
import * as marketingManagement from "./questions/management/marketingManagement";
import * as personnelManagement from "./questions/management/personnelManagement";

// 철도 관련 문제들 import
import * as railwayBasicLaw from "./questions/railway/railway_basic_law";
import * as railwayBasicLawRegulation from "./questions/railway/railway_basic_law_regulation";
import * as railwayIndustryLaw from "./questions/railway/railway_industry_law";
import * as railwayIndustryLawRegulation from "./questions/railway/railway_industry_law_regulation";
import * as railwayCorporationLaw from "./questions/railway/railway_corporation_law";
import * as railwayCorporationLawRegulation from "./questions/railway/railway_corporation_law_regulation";

// 삼단논법 관련 문제들 import
import * as syllogismBasic from "./questions/syllogism/syllogism_basic";

export class QuestionService {
  private static instance: QuestionService;
  private questions: Question[] = [];
  private questionMap: Map<string, Question[]> = new Map();

  private constructor() {
    this.initializeQuestions();
    this.organizeQuestionsBySubjectAndDifficulty();
  }

  private initializeQuestions() {
    // 경영학 문제들을 수집
    const managementQuestions = [
      // 경영학원론
      ...managementTheory.경영학원론_매우쉬움,
      ...managementTheory.경영학원론_쉬움,
      ...managementTheory.경영학원론_보통,
      ...managementTheory.경영학원론_어려움,
      ...managementTheory.경영학원론_매우어려움,
      // 마케팅관리
      ...marketingManagement.마케팅관리_매우쉬움,
      ...marketingManagement.마케팅관리_쉬움,
      ...marketingManagement.마케팅관리_보통,
      ...marketingManagement.마케팅관리_어려움,
      ...marketingManagement.마케팅관리_매우어려움,
      // 인사관리
      ...personnelManagement.인사관리_매우쉬움,
      ...personnelManagement.인사관리_쉬움,
      ...personnelManagement.인사관리_보통,
      ...personnelManagement.인사관리_어려움,
      ...personnelManagement.인사관리_매우어려움,
    ];

    // 경영학 문제들을 랜덤하게 섞어서 저장
    this.questions = this.shuffleArray(managementQuestions);

    // 철도 관련 문제들을 수집
    const railwayQuestions = [
      // 철도산업발전기본법
      ...railwayBasicLaw.철도산업발전기본법_매우쉬움,
      ...railwayBasicLaw.철도산업발전기본법_쉬움,
      ...railwayBasicLaw.철도산업발전기본법_보통,
      ...railwayBasicLaw.철도산업발전기본법_어려움,
      ...railwayBasicLaw.철도산업발전기본법_매우어려움,
      // 철도산업발전기본법 시행령
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령_매우쉬움,
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령_쉬움,
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령_보통,
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령_어려움,
      ...railwayBasicLawRegulation.철도산업발전기본법_시행령_매우어려움,
      // 철도산업법
      ...railwayIndustryLaw.철도산업법_매우쉬움,
      ...railwayIndustryLaw.철도산업법_쉬움,
      ...railwayIndustryLaw.철도산업법_보통,
      ...railwayIndustryLaw.철도산업법_어려움,
      ...railwayIndustryLaw.철도산업법_매우어려움,
      // 철도산업법 시행령
      ...railwayIndustryLawRegulation.철도산업법_시행령_매우쉬움,
      ...railwayIndustryLawRegulation.철도산업법_시행령_쉬움,
      ...railwayIndustryLawRegulation.철도산업법_시행령_보통,
      ...railwayIndustryLawRegulation.철도산업법_시행령_어려움,
      ...railwayIndustryLawRegulation.철도산업법_시행령_매우어려움,
      // 철도공사법
      ...railwayCorporationLaw.철도공사법_매우쉬움,
      ...railwayCorporationLaw.철도공사법_쉬움,
      ...railwayCorporationLaw.철도공사법_보통,
      ...railwayCorporationLaw.철도공사법_어려움,
      ...railwayCorporationLaw.철도공사법_매우어려움,
      // 철도공사법 시행령
      ...railwayCorporationLawRegulation.철도공사법_시행령_매우쉬움,
      ...railwayCorporationLawRegulation.철도공사법_시행령_쉬움,
      ...railwayCorporationLawRegulation.철도공사법_시행령_보통,
      ...railwayCorporationLawRegulation.철도공사법_시행령_어려움,
      ...railwayCorporationLawRegulation.철도공사법_시행령_매우어려움,
    ];

    // 철도 문제들도 랜덤하게 섞어서 추가
    const shuffledRailwayQuestions = this.shuffleArray(railwayQuestions);
    this.questions = [...this.questions, ...shuffledRailwayQuestions];

    // 삼단논법 관련 문제들을 수집
    const syllogismQuestions = [
      // 삼단논법 기초
      ...syllogismBasic.삼단논법_기초_매우쉬움,
      ...syllogismBasic.삼단논법_기초_쉬움,
      ...syllogismBasic.삼단논법_기초_보통,
      ...syllogismBasic.삼단논법_기초_어려움,
      ...syllogismBasic.삼단논법_기초_매우어려움,
    ];

    // 삼단논법 문제들도 랜덤하게 섞어서 추가
    const shuffledSyllogismQuestions = this.shuffleArray(syllogismQuestions);
    this.questions = [...this.questions, ...shuffledSyllogismQuestions];
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

  // 특정 과목과 난이도의 문제들을 가져오기
  public getQuestionsBySubjectAndDifficulty(
    subjectType: "management" | "railway" | "syllogism",
    difficulty: string
  ): Question[] {
    console.log("=== 필터링 시작 ===");
    console.log("subjectType:", subjectType);
    console.log("difficulty:", difficulty);
    console.log("전체 문제 수:", this.questions.length);

    const filtered = this.questions.filter((question) => {
      const subjectMatch =
        (subjectType === "management" && question.subject.includes("경영학")) ||
        (subjectType === "railway" && question.subject.includes("철도")) ||
        (subjectType === "syllogism" && question.subject.includes("삼단논법"));
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
    subjectType: "management" | "railway" | "syllogism"
  ): Question[] {
    return this.questions.filter(
      (question) =>
        (subjectType === "management" && question.subject.includes("경영학")) ||
        (subjectType === "railway" && question.subject.includes("철도")) ||
        (subjectType === "syllogism" && question.subject.includes("삼단논법"))
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
    subjectType: "management" | "railway" | "syllogism",
    subject: string,
    difficulty: string
  ): Question[] {
    console.log("=== 새로운 필터링 시작 ===");
    console.log("subjectType:", subjectType);
    console.log("subject:", subject);
    console.log("difficulty:", difficulty);
    console.log("전체 문제 수:", this.questions.length);

    const filtered = this.questions.filter((question) => {
      let subjectMatch = false;

      if (subjectType === "management") {
        if (subject === "경영학-경영학원론") {
          subjectMatch = question.subject === "경영학-경영학원론";
        } else if (subject === "경영학-인사관리") {
          subjectMatch = question.subject === "경영학-인사관리";
        } else if (subject === "경영학-마케팅관리") {
          subjectMatch = question.subject === "경영학-마케팅관리";
        } else if (subject === "전체 통합") {
          subjectMatch = question.subject.includes("경영학");
        }
      } else if (subjectType === "railway") {
        if (subject === "철도산업발전기본법(기본법+시행령)") {
          subjectMatch = question.subject.includes("철도산업발전기본법");
        } else if (subject === "철도산업법(기본법+시행령)") {
          subjectMatch = question.subject.includes("철도산업법");
        } else if (subject === "철도공사법(기본법+시행령)") {
          subjectMatch = question.subject.includes("철도공사법");
        } else if (subject === "전체 통합") {
          subjectMatch = question.subject.includes("철도");
        }
      } else if (subjectType === "syllogism") {
        if (subject === "삼단논법 기초") {
          subjectMatch = question.subject === "삼단논법 기초";
        } else if (subject === "전체 통합") {
          subjectMatch = question.subject.includes("삼단논법");
        }
      }

      const difficultyMatch = question.difficulty === difficulty;

      // console.log(
      //   `문제: ${question.id}, subject: ${question.subject}, difficulty: ${question.difficulty}`
      // );
      // console.log(
      //   `subjectMatch: ${subjectMatch}, difficultyMatch: ${difficultyMatch}`
      // );

      return subjectMatch && difficultyMatch;
    });

    // console.log("필터링 결과:", filtered.length, "개");
    // console.log("=== 새로운 필터링 완료 ===");

    return filtered;
  }

  // 랜덤하게 문제들을 선택하기 (퀴즈용)
  public getRandomQuestions(
    subjectType: "management" | "railway" | "syllogism",
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
    subjectType: "management" | "railway" | "syllogism",
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
    const managementQuestions = this.questions.filter((q) =>
      q.subject.includes("경영학")
    ).length;
    const railwayQuestions = this.questions.filter((q) =>
      q.subject.includes("철도")
    ).length;
    const syllogismQuestions = this.questions.filter((q) =>
      q.subject.includes("삼단논법")
    ).length;

    const difficultyStats = this.questions.reduce((acc, question) => {
      acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQuestions,
      managementQuestions,
      railwayQuestions,
      syllogismQuestions,
      difficultyStats,
    };
  }
}

export const questionService = QuestionService.getInstance();
