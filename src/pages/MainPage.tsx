import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressManager } from "../data/questionManager";
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

  // 통계 모달 상태
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStatsSubject, setSelectedStatsSubject] = useState<
    string | null
  >(null);

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

        {/* 통계 / 응시 기록 버튼 */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setShowStatsModal(true)}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg text-sm"
          >
            상세 통계 보기
          </button>
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

      {/* 통계 모달 */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">상세 통계</h2>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setSelectedStatsSubject(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 과목 선택 */}
              {!selectedStatsSubject ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6">
                    통계를 볼 과목을 선택하세요
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* 철도법령 */}
                    <button
                      onClick={() => setSelectedStatsSubject("railway")}
                      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <div className="text-4xl mb-3">🚂</div>
                      <div className="font-semibold text-gray-800 text-lg mb-2">
                        철도법령
                      </div>
                      <div className="text-sm text-gray-600">
                        철도법령 관련 통계 보기
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* 뒤로가기 버튼 */}
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedStatsSubject(null)}
                      className="text-blue-500 hover:text-blue-700 mb-4 flex items-center"
                    >
                      ← 과목 선택으로 돌아가기
                    </button>
                    <h3 className="text-lg font-semibold text-gray-700">
                      철도법령 상세 통계
                    </h3>
                  </div>

                  {/* 통계 내용: 과목별 풀이 횟수·평균만 표시 (난이도 구분 없음) */}
                  <div className="space-y-6">
                    {selectedStatsSubject === "railway"
                      ? [
                          {
                            name: "철도산업발전기본법(기본법+시행령)",
                            icon: "🏛️",
                            color: "bg-red-100 border-red-200",
                            subjectName: "철도산업발전기본법(기본법+시행령)",
                          },
                          {
                            name: "철도산업법(기본법+시행령)",
                            icon: "🚂",
                            color: "bg-blue-100 border-blue-200",
                            subjectName: "철도산업법(기본법+시행령)",
                          },
                          {
                            name: "철도공사법(기본법+시행령)",
                            icon: "🏢",
                            color: "bg-green-100 border-green-200",
                            subjectName: "철도공사법(기본법+시행령)",
                          },
                          {
                            name: "전체 통합",
                            icon: "📚",
                            color: "bg-purple-100 border-purple-200",
                            subjectName: "전체 통합",
                          },
                        ].map((law) => {
                          const progress = ProgressManager.getSubjectProgress(
                            law.subjectName,
                          );
                          return (
                            <div
                              key={law.name}
                              className={`rounded-lg border-2 ${law.color} p-6`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-3">
                                    {law.icon}
                                  </div>
                                  <h4 className="text-xl font-bold text-gray-800">
                                    {law.name}
                                  </h4>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                  <div>풀이: {progress.totalQuestions}회</div>
                                  <div>평균: {progress.averageScore}점</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  철도법령 관련 모든 학습 데이터가 삭제됩니다.
                </p>
              </div>

              {/* 확인 메시지 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다. 철도법령{" "}
                  관련 모든 학습 데이터가 삭제됩니다.
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
