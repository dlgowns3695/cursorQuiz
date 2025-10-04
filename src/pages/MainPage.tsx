import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressManager } from "../data/questionManager";
import { UserProgress } from "../data/types";
import { QUIZ_QUESTIONS_COUNT } from "../data/constants";

// 과목 정보 인터페이스
interface Subject {
  id: string;
  name: string;
  type: "management" | "railway" | "syllogism";
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
    totalPoints: 0,
    unlockedDifficulties: ["매우쉬움"], // 기본적으로 매우쉬움만 해금
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

  // 난이도 해금 조건
  const difficultyUnlockConditions = useMemo(
    () => ({
      쉬움: { minAttempts: 5, minAverage: 65 },
      보통: { minAttempts: 5, minAverage: 80 },
      어려움: { minAttempts: 5, minAverage: 85 },
      매우어려움: { minAttempts: 5, minAverage: 90 },
    }),
    []
  );

  // 과목 정보 정의
  const subjects: Subject[] = [
    {
      id: "management",
      name: "경영학 시작하기",
      type: "management",
      subjects: ["경영학원론", "인사관리", "마케팅관리", "전체 통합"],
      description: "경영학 기초부터 고급까지 체계적 학습",
      icon: "📊",
      color: "bg-blue-500",
    },
    {
      id: "railway",
      name: "철도법령 시작하기",
      type: "railway",
      subjects: [
        "철도산업발전기본법",
        "철도산업발전기본법 시행령",
        "철도산업법",
        "철도산업법 시행령",
        "철도공사법",
        "철도공사법 시행령",
        "전체 통합",
      ],
      description: "철도 관련 법령 완전 정복",
      icon: "🚂",
      color: "bg-red-500",
    },
    {
      id: "syllogism",
      name: "삼단논법 시작하기",
      type: "syllogism",
      subjects: ["삼단논법 기초", "전체 통합"],
      description: "논리적 사고와 추론 능력 향상",
      icon: "🧠",
      color: "bg-purple-500",
    },
  ];

  // 난이도 해금 체크 함수
  const checkDifficultyUnlock = useCallback(
    (difficulty: string) => {
      const condition =
        difficultyUnlockConditions[
          difficulty as keyof typeof difficultyUnlockConditions
        ];
      if (!condition) return false;

      const difficultyStats = ProgressManager.getDifficultyStats();
      const stats = difficultyStats["매우쉬움"] || {
        attempts: 0,
        totalScore: 0,
        averageScore: 0,
      };
      return (
        stats.attempts >= condition.minAttempts &&
        stats.averageScore >= condition.minAverage
      );
    },
    [difficultyUnlockConditions]
  );

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 진도 로드
  useEffect(() => {
    const progress = ProgressManager.getUserProgress();

    // 초기 상태 체크: questionHistory가 비어있으면 모든 값을 0으로 설정
    const isInitialState =
      !progress.questionHistory || progress.questionHistory.length === 0;

    const newProgress = {
      averageScore: isInitialState ? 0 : progress.averageScore,
      totalPoints: isInitialState ? 0 : progress.totalPoints,
      unlockedDifficulties: isInitialState
        ? ["매우쉬움"]
        : progress.unlockedDifficulties,
      completedSubjects: isInitialState ? [] : progress.completedSubjects,
      questionHistory: isInitialState ? [] : progress.questionHistory,
    };

    setUserProgress(newProgress);
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

    const currentProgress = ProgressManager.getUserProgress();

    // 선택된 과목의 데이터만 제거
    const filteredHistory = currentProgress.questionHistory.filter((record) => {
      if (selectedSubjectToReset === "management") {
        return !record.subject.includes("경영");
      } else if (selectedSubjectToReset === "railway") {
        return !record.subject.includes("철도");
      } else if (selectedSubjectToReset === "syllogism") {
        return !record.subject.includes("삼단논법");
      }
      return true;
    });

    // 해당 과목으로 얻은 포인트 계산
    const removedPoints = currentProgress.questionHistory
      .filter((record) => {
        if (selectedSubjectToReset === "management") {
          return record.subject.includes("경영");
        } else if (selectedSubjectToReset === "railway") {
          return record.subject.includes("철도");
        } else if (selectedSubjectToReset === "syllogism") {
          return record.subject.includes("삼단논법");
        }
        return false;
      })
      .reduce((sum, record) => {
        // 퀴즈 세션별로 획득한 포인트 계산
        // score는 0-100 사이의 점수이므로, 이를 맞힌 문제 수로 변환
        const correctAnswers = Math.round(
          (record.score / 100) * QUIZ_QUESTIONS_COUNT
        );
        return sum + correctAnswers;
      }, 0);

    // 새로운 진도 계산
    const newTotalPoints = Math.max(
      0,
      currentProgress.totalPoints - removedPoints
    );
    const allScores = filteredHistory.map((h) => h.score);
    const newAverageScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          )
        : 0;

    // 해금된 난이도 재계산 (남은 과목들의 통계를 기반으로)
    const remainingDifficulties = new Set<string>();
    remainingDifficulties.add("매우쉬움"); // 기본 해금

    // 남은 과목들의 난이도별 통계를 기반으로 해금 조건 체크
    const remainingHistory = filteredHistory;
    const difficultyStats: {
      [key: string]: {
        attempts: number;
        totalScore: number;
        averageScore: number;
      };
    } = {};

    // 난이도별 통계 계산
    remainingHistory.forEach((record) => {
      const difficulty = record.difficulty;
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = {
          attempts: 0,
          totalScore: 0,
          averageScore: 0,
        };
      }
      difficultyStats[difficulty].attempts += 1;
      difficultyStats[difficulty].totalScore += record.score;
    });

    // 평균 점수 계산
    Object.keys(difficultyStats).forEach((difficulty) => {
      const stats = difficultyStats[difficulty];
      stats.averageScore =
        stats.attempts > 0 ? Math.round(stats.totalScore / stats.attempts) : 0;
    });

    // 해금 조건 체크
    const { DIFFICULTY_UNLOCK_CONDITIONS } = require("../data/constants");
    Object.keys(difficultyStats).forEach((difficulty) => {
      if (difficulty === "매우쉬움") return;

      const condition =
        DIFFICULTY_UNLOCK_CONDITIONS[
          difficulty as keyof typeof DIFFICULTY_UNLOCK_CONDITIONS
        ];
      if (
        condition &&
        difficultyStats[difficulty].attempts >= condition.minAttempts &&
        difficultyStats[difficulty].averageScore >= condition.minScore
      ) {
        remainingDifficulties.add(difficulty);
      }
    });

    const newProgress: UserProgress = {
      averageScore: newAverageScore,
      totalPoints: newTotalPoints,
      unlockedDifficulties: Array.from(remainingDifficulties),
      completedSubjects: currentProgress.completedSubjects.filter((subject) => {
        if (selectedSubjectToReset === "management") {
          return !subject.includes("경영");
        } else if (selectedSubjectToReset === "railway") {
          return !subject.includes("철도");
        } else if (selectedSubjectToReset === "syllogism") {
          return !subject.includes("삼단논법");
        }
        return true;
      }),
      questionHistory: filteredHistory,
    };

    ProgressManager.saveUserProgress(newProgress);

    // UI 업데이트
    setUserProgress({
      averageScore: newProgress.averageScore,
      totalPoints: newProgress.totalPoints,
      unlockedDifficulties: newProgress.unlockedDifficulties,
      completedSubjects: newProgress.completedSubjects,
      questionHistory: newProgress.questionHistory,
    });

    setShowResetModal(false);
    setSelectedSubjectToReset(null);
  };

  // 초기화 취소 핸들러
  const handleResetCancel = () => {
    setShowResetModal(false);
    setSelectedSubjectToReset(null);
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

        {/* 통계 버튼 */}
        <div className="mb-12 text-center">
          <button
            onClick={() => setShowStatsModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg"
          >
            📊 상세 통계 보기
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

        {/* 하단 정보 */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            포인트: {userProgress.totalPoints} | 해금된 난이도:{" "}
            {userProgress.unlockedDifficulties.length}개
          </p>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {/* 경영학원론 */}
                    <button
                      onClick={() => setSelectedStatsSubject("management")}
                      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-4xl mb-3">📊</div>
                      <div className="font-semibold text-gray-800 text-lg mb-2">
                        경영학
                      </div>
                      <div className="text-sm text-gray-600">
                        경영학 관련 통계 보기
                      </div>
                    </button>

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

                    {/* 삼단논법 */}
                    <button
                      onClick={() => setSelectedStatsSubject("syllogism")}
                      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-4xl mb-3">🧠</div>
                      <div className="font-semibold text-gray-800 text-lg mb-2">
                        삼단논법
                      </div>
                      <div className="text-sm text-gray-600">
                        삼단논법 관련 통계 보기
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
                      {selectedStatsSubject === "management"
                        ? "경영학"
                        : selectedStatsSubject === "railway"
                        ? "철도법령"
                        : "삼단논법"}{" "}
                      상세 통계
                    </h3>
                  </div>

                  {/* 통계 내용 */}
                  <div className="space-y-6">
                    {selectedStatsSubject === "management" ? (
                      // 경영학 통계
                      <div className="space-y-6">
                        {[
                          {
                            name: "경영학원론",
                            icon: "📊",
                            color: "bg-blue-100 border-blue-200",
                            subjectName: "경영학-경영학원론",
                          },
                          {
                            name: "인사관리",
                            icon: "👥",
                            color: "bg-green-100 border-green-200",
                            subjectName: "경영학-인사관리",
                          },
                          {
                            name: "마케팅관리",
                            icon: "📈",
                            color: "bg-purple-100 border-purple-200",
                            subjectName: "경영학-마케팅관리",
                          },
                        ].map((subject) => {
                          const subjectDifficultyStats =
                            ProgressManager.getSubjectDifficultyStats(
                              subject.subjectName
                            );

                          return (
                            <div
                              key={subject.name}
                              className={`rounded-lg border-2 ${subject.color} p-6`}
                            >
                              <div className="flex items-center mb-4">
                                <div className="text-3xl mr-3">
                                  {subject.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-800">
                                  {subject.name}
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                  "매우쉬움",
                                  "쉬움",
                                  "보통",
                                  "어려움",
                                  "매우어려움",
                                ].map((difficulty) => {
                                  const stats = subjectDifficultyStats[
                                    difficulty
                                  ] || {
                                    attempts: 0,
                                    totalScore: 0,
                                    averageScore: 0,
                                  };
                                  const isUnlocked =
                                    userProgress.unlockedDifficulties.includes(
                                      difficulty
                                    );

                                  return (
                                    <div
                                      key={difficulty}
                                      className={`bg-white rounded-lg p-3 text-center ${
                                        isUnlocked
                                          ? "border-2 border-green-300 shadow-sm"
                                          : "border-2 border-gray-200 opacity-60"
                                      }`}
                                    >
                                      <div className="text-sm font-bold text-gray-700 mb-1">
                                        {difficulty}
                                        {isUnlocked ? " ✓" : " 🔒"}
                                      </div>
                                      <div className="text-xs text-gray-600 space-y-1">
                                        <div>풀이: {stats.attempts}번</div>
                                        <div>평균: {stats.averageScore}점</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : selectedStatsSubject === "railway" ? (
                      // 철도법령 통계
                      [
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
                        const subjectDifficultyStats =
                          ProgressManager.getSubjectDifficultyStats(
                            law.subjectName
                          );

                        return (
                          <div
                            key={law.name}
                            className={`rounded-lg border-2 ${law.color} p-6`}
                          >
                            <div className="flex items-center mb-4">
                              <div className="text-3xl mr-3">{law.icon}</div>
                              <h4 className="text-xl font-bold text-gray-800">
                                {law.name}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {[
                                "매우쉬움",
                                "쉬움",
                                "보통",
                                "어려움",
                                "매우어려움",
                              ].map((difficulty) => {
                                const stats = subjectDifficultyStats[
                                  difficulty
                                ] || {
                                  attempts: 0,
                                  totalScore: 0,
                                  averageScore: 0,
                                };
                                const isUnlocked =
                                  userProgress.unlockedDifficulties.includes(
                                    difficulty
                                  );

                                return (
                                  <div
                                    key={difficulty}
                                    className={`bg-white rounded-lg p-3 text-center ${
                                      isUnlocked
                                        ? "border-2 border-green-300 shadow-sm"
                                        : "border-2 border-gray-200 opacity-60"
                                    }`}
                                  >
                                    <div className="text-sm font-bold text-gray-700 mb-1">
                                      {difficulty}
                                      {isUnlocked ? " ✓" : " 🔒"}
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div>풀이: {stats.attempts}번</div>
                                      <div>평균: {stats.averageScore}점</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // 삼단논법 통계
                      [
                        {
                          name: "삼단논법 기초",
                          icon: "🧠",
                          color: "bg-purple-100 border-purple-200",
                          subjectName: "삼단논법 기초",
                        },
                        {
                          name: "전체 통합",
                          icon: "📚",
                          color: "bg-indigo-100 border-indigo-200",
                          subjectName: "전체 통합",
                        },
                      ].map((subject) => {
                        const subjectDifficultyStats =
                          ProgressManager.getSubjectDifficultyStats(
                            subject.subjectName
                          );

                        return (
                          <div
                            key={subject.name}
                            className={`rounded-lg border-2 ${subject.color} p-6`}
                          >
                            <div className="flex items-center mb-4">
                              <div className="text-3xl mr-3">
                                {subject.icon}
                              </div>
                              <h4 className="text-xl font-bold text-gray-800">
                                {subject.name}
                              </h4>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {[
                                "매우쉬움",
                                "쉬움",
                                "보통",
                                "어려움",
                                "매우어려움",
                              ].map((difficulty) => {
                                const stats = subjectDifficultyStats[
                                  difficulty
                                ] || {
                                  attempts: 0,
                                  totalScore: 0,
                                  averageScore: 0,
                                };
                                const isUnlocked =
                                  userProgress.unlockedDifficulties.includes(
                                    difficulty
                                  );

                                return (
                                  <div
                                    key={difficulty}
                                    className={`bg-white rounded-lg p-3 text-center ${
                                      isUnlocked
                                        ? "border-2 border-green-300 shadow-sm"
                                        : "border-2 border-gray-200 opacity-60"
                                    }`}
                                  >
                                    <div className="text-sm font-bold text-gray-700 mb-1">
                                      {difficulty}
                                      {isUnlocked ? " ✓" : " 🔒"}
                                    </div>
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div>풀이: {stats.attempts}번</div>
                                      <div>평균: {stats.averageScore}점</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
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
                  모든 데이터 및 해당과목으로 얻은 포인트는 없어집니다
                </p>
              </div>

              {/* 확인 메시지 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다.
                  {selectedSubjectToReset === "management"
                    ? "경영학"
                    : selectedSubjectToReset === "railway"
                    ? "철도법령"
                    : "삼단논법"}{" "}
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
