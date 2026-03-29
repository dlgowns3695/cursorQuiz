import { Question } from "../types";

/** 데이터 파일에 적는 문항 한 줄(questionId 없음 — withQuestionIds가 부여) */
export type QuestionBankItem = Omit<Question, "questionId">;

/**
 * 법령별 문제 배열에 questionId를 붙입니다.
 * - prefix: QUESTION_ID_PREFIX의 해당 법령 값 (백만 단위 구간)
 * - 배열 순서대로 prefix+1, prefix+2, … (맨 뒤에 문항을 추가하면 다음 번호가 자동 부여됩니다.)
 * - 배열 중간에 삽입·삭제하면 이후 문항의 questionId가 바뀔 수 있으니, 이미 쌓인 solveHistory와의 일치가 필요하면 맨 뒤에만 추가하는 것을 권장합니다.
 */
export function withQuestionIds(
  prefix: number,
  questions: QuestionBankItem[],
): Question[] {
  return questions.map((q, i) => ({
    ...q,
    questionId: prefix + i + 1,
  }));
}
