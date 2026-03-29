import { STORAGE_KEYS } from "./constants";
import type { QuestionWrongStats } from "./solveHistoryStats";
import {
  SolveHistoryEntry,
  computeQuestionWrongStats,
  filterExcludeHighCorrectRateForDisplay,
  filterWeakQuestionStats,
} from "./solveHistoryStats";

export {
  computeQuestionWrongStats,
  filterWeakQuestionStats,
  enrichWrongStatsWithQuestions,
} from "./solveHistoryStats";
export type { SolveHistoryEntry, QuestionWrongStats } from "./solveHistoryStats";

const MAX_ENTRIES = 50_000;

export class SolveHistoryManager {
  static getSolveHistory(): SolveHistoryEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOLVE_HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveSolveHistory(history: SolveHistoryEntry[]): void {
    const trimmed =
      history.length > MAX_ENTRIES
        ? history.slice(history.length - MAX_ENTRIES)
        : history;
    localStorage.setItem(STORAGE_KEYS.SOLVE_HISTORY, JSON.stringify(trimmed));
  }

  static appendEntries(entries: SolveHistoryEntry[]): void {
    if (!entries.length) return;
    const current = this.getSolveHistory();
    this.saveSolveHistory([...current, ...entries]);
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEYS.SOLVE_HISTORY);
  }

  static getWrongStatsSorted(): QuestionWrongStats[] {
    return computeQuestionWrongStats(this.getSolveHistory());
  }

  static getWeakQuestionStats(minWrongRate = 0.4): QuestionWrongStats[] {
    const forDisplay = filterExcludeHighCorrectRateForDisplay(
      this.getWrongStatsSorted(),
    );
    return filterWeakQuestionStats(forDisplay, minWrongRate);
  }
}
