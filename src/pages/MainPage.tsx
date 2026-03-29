import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressManager } from "../data/questionManager";
import { SolveHistoryManager } from "../data/solveHistoryManager";
import {
  enrichWrongStatsWithQuestions,
  filterWeakQuestionStats,
} from "../data/solveHistoryStats";
import { questionService } from "../data/questionService";
import { UserProgress, QuestionHistory, QuizSession } from "../data/types";

// 해설 문자열에서 **강조** 구문을 찾아 굵게 렌더링
const renderExplanation = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    const isBold = part.startsWith("**") && part.endsWith("**");
    if (isBold) {
      const inner = part.slice(2, -2);
      if (!inner.trim()) {
        return <span key={idx}>{part}</span>;
      }
      return (
        <span key={idx} className="font-bold">
          {inner}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

// 과목 정보 인터페이스
interface Subject {
  id: string;
  name: string;
  type: "railway";
  subjects: string[];
  description: string;
  icon: string;
  color: string;
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  // 사용자 진도 상태 관리
  const [userProgress, setUserProgress] = useState<UserProgress>({
    averageScore: 0,
    completedSubjects: [],
    questionHistory: [],
  });

  // 초기화 확인 모달 상태
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedSubjectToReset, setSelectedSubjectToReset] = useState<
    string | null
  >(null);

  // 응시 기록 모달 상태
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<QuestionHistory | null>(null);
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(
    null,
  );

  // 문항별 오답 빈도 모달
  const [showWrongRateModal, setShowWrongRateModal] = useState(false);
  const [weakOnlyWrongRate, setWeakOnlyWrongRate] = useState(false);

  // 과목 정보 정의
  const subjects: Subject[] = [
    {
      id: "railway",
      name: "철도법령 시작하기",
      type: "railway",
      // 대표 과목/통합 과목 목록 (실제 문제 선택은 세부 과목 페이지에서 처리)
      subjects: ["철도산업발전기본법", "철도산업법", "철도공사법", "전체 통합"],
      description: "철도 관련 법령 완전 정복",
      icon: "🚂",
      color: "bg-red-500",
    },
  ];

  // 난이도 해금 체크 제거됨 (난이도 기능 미사용)

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 진도 로드
  useEffect(() => {
    const progress = ProgressManager.getUserProgress();
    setUserProgress({
      averageScore: progress.averageScore,
      completedSubjects: progress.completedSubjects || [],
      questionHistory: progress.questionHistory || [],
    });
  }, []);

  // 과목 선택 핸들러
  const handleSubjectSelect = (subject: Subject) => {
    // 과목 선택 로그
    console.log("🎯 과목 선택:", subject.name);
    // 세부 과목 선택 페이지로 이동
    navigate(`/quiz/${subject.type}/subjects`);
  };

  // 초기화 버튼 클릭 핸들러
  const handleResetClick = (subjectType: string) => {
    setSelectedSubjectToReset(subjectType);
    setShowResetModal(true);
  };

  // 초기화 확인 핸들러
  const handleResetConfirm = () => {
    if (!selectedSubjectToReset) return;

    if (selectedSubjectToReset === "railway") {
      // 철도법령 관련 모든 학습 데이터 초기화
      const newProgress = ProgressManager.resetAllProgress();
      setUserProgress(newProgress);
      SolveHistoryManager.clear();
    }

    setShowResetModal(false);
    setSelectedSubjectToReset(null);
  };

  // 초기화 취소 핸들러
  const handleResetCancel = () => {
    setShowResetModal(false);
    setSelectedSubjectToReset(null);
  };

  // 응시 기록 모달 열기
  const handleHistoryOpen = () => {
    if (!userProgress.questionHistory.length) return;
    // 가장 최근 기록을 기본 선택
    const sorted = [...userProgress.questionHistory].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
    const latest = sorted[0];
    const session = ProgressManager.getQuizSessionById(latest.questionId);
    setSelectedHistory(latest);
    setSelectedSession(session || null);
    setShowHistoryModal(true);
  };

  // 응시 기록 리스트에서 항목 선택
  const handleHistoryItemClick = (record: QuestionHistory) => {
    const session = ProgressManager.getQuizSessionById(record.questionId);
    setSelectedHistory(record);
    setSelectedSession(session || null);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistory(null);
    setSelectedSession(null);
  };

  const wrongRateRows = useMemo(() => {
    if (!showWrongRateModal) return [];
    const raw = SolveHistoryManager.getWrongStatsSorted();
    const filtered = weakOnlyWrongRate
      ? filterWeakQuestionStats(raw, 0.4)
      : raw;
    return enrichWrongStatsWithQuestions(filtered, (id) =>
      questionService.getQuestionByQuestionId(id),
    );
  }, [showWrongRateModal, weakOnlyWrongRate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-12 py-12">
        {/* 메인 제목 */}
        <div className=" mb-16">
          <h1 className="text-center font-bold text-red-600 mb-4">
            공부시작해!!
          </h1>
          <p className="text-lg text-gray-600 text-center">
            반복적인 학습을 통해 철도법령을 마스터하세요
          </p>
        </div>

        {/* 응시 기록 / 오답 빈도 */}
        <div className="mb-12 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleHistoryOpen}
            disabled={userProgress.questionHistory.length === 0}
            className={`px-4 py-3 rounded-lg font-semibold shadow-lg transition-colors text-sm ${
              userProgress.questionHistory.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            응시 기록 보기
          </button>
          <button
            onClick={() => setShowWrongRateModal(true)}
            className="px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg text-sm"
          >
            문항 오답 빈도
          </button>
        </div>

        {/* 학습 시작 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-center"
              onClick={() => handleSubjectSelect(subject)}
            >
              {/* 아이콘 */}
              <div className="mb-6">
                <div
                  className={`w-20 h-20 ${subject.color} rounded-full flex items-center justify-center text-white text-4xl mx-auto`}
                >
                  {subject.icon}
                </div>
              </div>

              {/* 제목 */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {subject.name}
              </h2>

              {/* 설명 */}
              <p className="text-gray-600 mb-6 text-center">
                {subject.description}
              </p>

              {/* 버튼들 */}
              <div className="space-y-3">
                <button
                  className={`w-full py-3 px-6 ${subject.color} text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity`}
                >
                  시작하기 →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetClick(subject.type);
                  }}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 응시 기록 모달 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">응시 기록</h2>
                <button
                  onClick={closeHistoryModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {userProgress.questionHistory.length === 0 ? (
                <p className="text-sm text-gray-600">
                  아직 응시 기록이 없습니다.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 응시 기록 리스트 - 모바일: 상단 / 데스크톱: 왼쪽 */}
                  <div className="md:col-span-1 md:border-r md:border-gray-200 pr-0 md:pr-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      최근 응시 목록
                    </h3>
                    <div className="space-y-2 max-h-[35vh] md:max-h-[60vh] overflow-y-auto">
                      {userProgress.questionHistory
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.completedAt).getTime() -
                            new Date(a.completedAt).getTime(),
                        )
                        .map((record) => (
                          <button
                            key={record.questionId}
                            onClick={() => handleHistoryItemClick(record)}
                            className={`w-full text-left px-3 py-2 rounded border text-xs ${
                              selectedHistory &&
                              selectedHistory.questionId === record.questionId
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-blue-400"
                            }`}
                          >
                            <div className="font-semibold text-gray-800 truncate">
                              {record.subject}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {new Date(record.completedAt).toLocaleString(
                                undefined,
                                {
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                            <div className="mt-0.5">
                              <span
                                className={
                                  record.isCorrect
                                    ? "font-bold text-green-600"
                                    : "font-bold text-red-600"
                                }
                              >
                                {record.score}점
                              </span>
                              <span className="ml-1 text-[10px] text-gray-500">
                                {record.isCorrect ? "통과" : "재도전 필요"}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* 선택된 기록 상세 - 모바일: 목록 아래 스크롤로 바로 표시 */}
                  <div className="md:col-span-2 min-h-0">
                    {selectedHistory && selectedSession ? (
                      <div className="space-y-4">
                        {/* 요약 정보 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-800 mb-1">
                                {selectedSession.subject}
                              </div>
                              <div className="text-xs text-gray-500">
                                응시일시:{" "}
                                {new Date(
                                  selectedHistory.completedAt,
                                ).toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <span
                                className={
                                  selectedHistory.isCorrect
                                    ? "font-bold text-green-600"
                                    : "font-bold text-red-600"
                                }
                              >
                                {selectedHistory.score}점
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {selectedHistory.isCorrect
                                  ? "통과"
                                  : "재도전 필요"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 문항별 정답/오답 상세 */}
                        <div className="space-y-4">
                          {selectedSession.questions.map((question, index) => {
                            const userAnswer =
                              selectedSession.userAnswers[index];
                            const isCorrect =
                              userAnswer === question.correctAnswer;
                            return (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 ${
                                  isCorrect
                                    ? "border-green-200 bg-green-50"
                                    : "border-red-200 bg-red-50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-semibold text-gray-700">
                                    문항 #{index + 1}
                                  </div>
                                  <div
                                    className={`text-xs font-semibold ${
                                      isCorrect
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }`}
                                  >
                                    {isCorrect ? "정답" : "오답"}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-800 mb-3 whitespace-pre-line">
                                  {renderExplanation(question.question)}
                                </div>
                                <div className="space-y-1">
                                  {question.options.map((opt, optIdx) => {
                                    const isOptCorrect =
                                      optIdx === question.correctAnswer;
                                    const isOptUser = optIdx === userAnswer;
                                    let className =
                                      "px-3 py-1.5 rounded text-sm border bg-white";
                                    if (isOptCorrect) {
                                      className =
                                        "px-3 py-1.5 rounded text-sm border border-green-400 bg-green-50 text-green-800";
                                    } else if (isOptUser && !isOptCorrect) {
                                      className =
                                        "px-3 py-1.5 rounded text-sm border border-red-400 bg-red-100 text-red-800";
                                    }
                                    return (
                                      <div key={optIdx} className={className}>
                                        <span className="font-semibold mr-1">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        {opt}
                                      </div>
                                    );
                                  })}
                                </div>
                                {question.explanation && (
                                  <div className="mt-3 text-xs text-gray-700 bg-white border border-gray-200 rounded p-2">
                                    <span className="font-semibold text-gray-800">
                                      해설:
                                    </span>{" "}
                                    {renderExplanation(question.explanation)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        목록에서 응시 기록을 선택하면 상세 내용을 확인할 수
                        있습니다.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 문항별 오답 빈도 (solveHistory 기반, 신규 문항은 풀이 누적 시 자동 반영) */}
      {showWrongRateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  문항 오답 빈도
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  풀이할 때마다 기록이 쌓이며, 은행에 추가된 문항은 풀이 후 여기에
                  나타납니다.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weakOnlyWrongRate}
                    onChange={(e) => setWeakOnlyWrongRate(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  취약만 (오답률 40% 이상)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowWrongRateModal(false);
                    setWeakOnlyWrongRate(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-1 p-3 sm:p-4 min-h-0">
              {wrongRateRows.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-8">
                  표시할 풀이 기록이 없거나, 필터 조건에 맞는 문항이 없습니다.
                </p>
              ) : (
                <>
                  {/* 좁은 화면: 카드 리스트(세로 스크롤, 문항은 전체 너비 줄바꿈) */}
                  <div className="space-y-3 md:hidden">
                    {wrongRateRows.map((row) => (
                      <div
                        key={row.questionId}
                        className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-xs text-gray-600 tabular-nums">
                            ID {row.questionId}
                          </span>
                          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-900 tabular-nums">
                            {(row.wrongRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5 break-words">
                          {row.subject ?? "—"}
                        </p>
                        <p className="text-sm text-gray-900 leading-snug break-words [overflow-wrap:anywhere]">
                          {row.questionPreview || "(문항을 찾을 수 없음)"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-200/60 pt-2 text-xs text-gray-600">
                          <span>
                            풀이{" "}
                            <strong className="text-gray-800">{row.total}</strong>
                          </span>
                          <span>
                            오답{" "}
                            <strong className="text-gray-800">{row.wrong}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 넓은 화면: 표 + 가로 스크롤(중간 폭 태블릿 세로 모드 대비) */}
                  <div className="hidden md:block overflow-x-auto -mx-1">
                    <table className="min-w-[640px] w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-left">
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            ID
                          </th>
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            과목
                          </th>
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            문항
                          </th>
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            풀이
                          </th>
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            오답
                          </th>
                          <th className="py-2 px-2 font-semibold text-gray-700">
                            오답률
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {wrongRateRows.map((row) => (
                          <tr
                            key={row.questionId}
                            className="border-b border-gray-100 hover:bg-amber-50/50"
                          >
                            <td className="py-2 px-2 font-mono text-xs text-gray-800 whitespace-nowrap">
                              {row.questionId}
                            </td>
                            <td className="py-2 px-2 text-gray-700 whitespace-nowrap">
                              {row.subject ?? "—"}
                            </td>
                            <td className="py-2 px-2 text-gray-800 max-w-md break-words [overflow-wrap:anywhere]">
                              {row.questionPreview || "(문항을 찾을 수 없음)"}
                            </td>
                            <td className="py-2 px-2 text-gray-700 whitespace-nowrap">
                              {row.total}
                            </td>
                            <td className="py-2 px-2 text-gray-700 whitespace-nowrap">
                              {row.wrong}
                            </td>
                            <td className="py-2 px-2 font-semibold text-amber-800 whitespace-nowrap tabular-nums">
                              {(row.wrongRate * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  데이터 초기화
                </h2>
                <p className="text-gray-600">
                  철도법령 관련 학습·응시 기록 및 문항 오답 빈도 데이터가
                  삭제됩니다.
                </p>
              </div>

              {/* 확인 메시지 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다. 철도법령
                  관련 학습 진도, 응시 기록, 문항별 풀이 기록이 삭제됩니다.
                </p>
              </div>

              {/* 버튼들 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleResetCancel}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  예, 초기화합니다
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
