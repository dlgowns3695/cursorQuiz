import { Question } from "./types";

/** 문항별 풀이 기록 (로컬 저장 단위) */
export interface SolveHistoryEntry {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
  date: string;
}

/** questionId별 집계 */
export interface QuestionWrongStats {
  questionId: number;
  total: number;
  wrong: number;
  wrongRate: number;
}

/**
 * solveHistory를 questionId별로 집계하고 wrongRate 내림차순으로 정렬합니다.
 */
export function computeQuestionWrongStats(
  history: SolveHistoryEntry[],
): QuestionWrongStats[] {
  const map = new Map<number, { total: number; wrong: number }>();

  for (const h of history) {
    const cur = map.get(h.questionId) ?? { total: 0, wrong: 0 };
    cur.total += 1;
    if (!h.correct) cur.wrong += 1;
    map.set(h.questionId, cur);
  }

  const result: QuestionWrongStats[] = [];
  for (const [questionId, { total, wrong }] of map) {
    result.push({
      questionId,
      total,
      wrong,
      wrongRate: total > 0 ? wrong / total : 0,
    });
  }

  result.sort((a, b) => b.wrongRate - a.wrongRate);
  return result;
}

/**
 * 정답률이 이 비율 이상이면 오답 빈도 목록에서 제외합니다.
 * (오답률이 (1 - 이 값) 이하인 문항은 숨김)
 */
export const MIN_CORRECT_RATE_TO_HIDE_IN_WRONG_FREQUENCY = 0.9;

/**
 * 정답률이 일정 수준 이상(기본 90%)인 문항은 오답 빈도 UI에 너무 많이 쌓이지 않도록 제외합니다.
 * 남기는 조건: 오답률 > (1 - minCorrectRateToHide), 즉 정답률 < minCorrectRateToHide.
 */
export function filterExcludeHighCorrectRateForDisplay(
  stats: QuestionWrongStats[],
  minCorrectRateToHide = MIN_CORRECT_RATE_TO_HIDE_IN_WRONG_FREQUENCY,
): QuestionWrongStats[] {
  const maxWrongRateInclusive = 1 - minCorrectRateToHide;
  return stats.filter((s) => s.wrongRate > maxWrongRateInclusive);
}

/**
 * wrongRate가 minWrongRate 이상인 문항만 반환합니다 (기본 0.4 = 40%).
 */
export function filterWeakQuestionStats(
  stats: QuestionWrongStats[],
  minWrongRate = 0.4,
): QuestionWrongStats[] {
  return stats.filter((s) => s.wrongRate >= minWrongRate);
}

/** 집계 결과에 문항 메타(과목·미리보기)를 붙입니다. */
export function enrichWrongStatsWithQuestions(
  stats: QuestionWrongStats[],
  getQuestion: (questionId: number) => Question | undefined,
): Array<
  QuestionWrongStats & { subject?: string; questionPreview?: string }
> {
  return stats.map((s) => {
    const q = getQuestion(s.questionId);
    const text = q?.question ?? "";
    const questionPreview =
      text.length > 120 ? `${text.slice(0, 120)}…` : text || undefined;
    return {
      ...s,
      subject: q?.subject,
      questionPreview,
    };
  });
}

/** 퀴즈 한 세트를 기록 항목으로 변환 */
export function buildSolveEntriesFromQuiz(
  questions: Question[],
  userAnswers: number[],
  dateIso: string,
): SolveHistoryEntry[] {
  const entries: SolveHistoryEntry[] = [];
  questions.forEach((q, idx) => {
    if (typeof q.questionId !== "number") return;
    const selected = userAnswers[idx];
    if (selected === undefined || selected < 0) return;
    entries.push({
      questionId: q.questionId,
      selectedAnswer: selected,
      correct: selected === q.correctAnswer,
      date: dateIso,
    });
  });
  return entries;
}
