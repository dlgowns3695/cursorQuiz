import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressManager } from "../../data/questionManager";
import { QUIZ_QUESTIONS_COUNT } from "../../data/constants";

interface UserProgress {
  averageScore: number;
  totalPoints: number;
  unlockedDifficulties: string[];
  completedSubjects: string[];
  difficultyStats: {
    [difficulty: string]: {
      attempts: number;
      totalScore: number;
      averageScore: number;
    };
  };
}

const DifficultySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectType, subject } = useParams<{
    subjectType: string;
    subject: string;
  }>();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    averageScore: 0,
    totalPoints: 0,
    unlockedDifficulties: ["매우쉬움"],
    completedSubjects: [],
    difficultyStats: {},
  });

  const subjectName =
    subjectType === "management"
      ? "경영학"
      : subjectType === "railway"
      ? "철도법령"
      : "삼단논법";

  // 사용자 진도 로드 및 해금 상태 업데이트
  useEffect(() => {
    const progress = ProgressManager.getUserProgress();
    const difficultyStats = ProgressManager.getDifficultyStats();

    // 해금 조건을 만족하는 난이도들을 실시간으로 체크하여 해금 상태 업데이트
    const updatedUnlockedDifficulties = [...progress.unlockedDifficulties];

    // 모든 난이도에 대해 해금 조건 체크
    const {
      DIFFICULTY_UNLOCK_CONDITIONS,
      DIFFICULTY_ORDER,
    } = require("../../data/constants");
    const subjectDifficultyStats = ProgressManager.getSubjectDifficultyStats(
      subject || ""
    );

    DIFFICULTY_ORDER.forEach((difficulty: string) => {
      if (difficulty === "매우쉬움") return; // 매우쉬움은 기본 해금

      const condition =
        DIFFICULTY_UNLOCK_CONDITIONS[
          difficulty as keyof typeof DIFFICULTY_UNLOCK_CONDITIONS
        ];
      if (!condition) return;

      // 현재 난이도의 인덱스 찾기
      const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
      if (currentIndex <= 0) return;

      // 이전 단계 난이도 가져오기
      const previousDifficulty = DIFFICULTY_ORDER[currentIndex - 1];

      // 이전 난이도의 통계 가져오기
      const previousStats = subjectDifficultyStats[previousDifficulty] || {
        attempts: 0,
        averageScore: 0,
      };

      // 해금 조건 만족 시 해금 (이전 난이도 기준)
      if (
        previousStats.attempts >= condition.minAttempts &&
        previousStats.averageScore >= condition.minScore &&
        !updatedUnlockedDifficulties.includes(difficulty)
      ) {
        updatedUnlockedDifficulties.push(difficulty);
      }
    });

    // 해금 상태가 변경된 경우 localStorage에 저장
    if (
      updatedUnlockedDifficulties.length !==
        progress.unlockedDifficulties.length ||
      !updatedUnlockedDifficulties.every(
        (diff, index) => diff === progress.unlockedDifficulties[index]
      )
    ) {
      const updatedProgress = {
        ...progress,
        unlockedDifficulties: updatedUnlockedDifficulties,
      };
      ProgressManager.saveUserProgress(updatedProgress);
    }

    setUserProgress({
      averageScore: progress.averageScore,
      totalPoints: progress.totalPoints,
      unlockedDifficulties: updatedUnlockedDifficulties,
      completedSubjects: progress.completedSubjects,
      difficultyStats: difficultyStats,
    });
  }, [subject]);

  // subjectType이 없으면 메인으로 리다이렉트
  if (!subjectType) {
    navigate("/");
    return null;
  }

  const difficulties = [
    {
      name: "매우쉬움",
      color: "bg-green-500",
      description: "기초 문제",
    },
    {
      name: "쉬움",
      color: "bg-blue-500",
      description: "초급 문제",
    },
    {
      name: "보통",
      color: "bg-yellow-500",
      description: "중급 문제",
    },
    {
      name: "어려움",
      color: "bg-orange-500",
      description: "고급 문제",
    },
    {
      name: "매우어려움",
      color: "bg-red-500",
      description: "최고급 문제",
    },
  ];

  // 난이도 해금 체크 함수
  const isDifficultyUnlocked = (difficulty: string) => {
    if (difficulty === "매우쉬움") return true;
    return userProgress.unlockedDifficulties.includes(difficulty);
  };

  // 해금 조건 체크 함수
  const checkUnlockCondition = (difficulty: string) => {
    if (difficulty === "매우쉬움") return null;

    // DIFFICULTY_UNLOCK_CONDITIONS를 사용하여 해금 조건 체크
    const {
      DIFFICULTY_UNLOCK_CONDITIONS,
      DIFFICULTY_ORDER,
    } = require("../../data/constants");
    const condition =
      DIFFICULTY_UNLOCK_CONDITIONS[
        difficulty as keyof typeof DIFFICULTY_UNLOCK_CONDITIONS
      ];

    // 현재 난이도의 인덱스 찾기
    const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
    if (currentIndex <= 0) return null; // 매우쉬움이거나 찾을 수 없는 경우

    // 이전 단계 난이도 가져오기
    const previousDifficulty = DIFFICULTY_ORDER[currentIndex - 1];

    // 해당 과목의 이전 단계 난이도 통계 가져오기
    const subjectDifficultyStats = ProgressManager.getSubjectDifficultyStats(
      subject || ""
    );
    const stats = subjectDifficultyStats[previousDifficulty] || {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
    };

    return {
      minAttempts: condition.minAttempts,
      minAverage: condition.minScore,
      currentAttempts: stats.attempts,
      currentAverage: stats.averageScore,
      previousDifficulty: previousDifficulty,
      isUnlocked:
        stats.attempts >= condition.minAttempts &&
        stats.averageScore >= condition.minScore,
    };
  };

  const handleDifficultySelect = (difficulty: string) => {
    // 해금되지 않은 난이도 클릭 시 팝업 표시
    if (!isDifficultyUnlocked(difficulty)) {
      const condition = checkUnlockCondition(difficulty);
      if (condition) {
        alert(
          `🔒 ${difficulty} 난이도 해금 조건\n\n` +
            `• ${condition.previousDifficulty} ${condition.minAttempts}번 이상 풀이 (현재: ${condition.currentAttempts}번)\n` +
            `• ${condition.previousDifficulty} 평균 ${condition.minAverage}점 이상 (현재: ${condition.currentAverage}점)\n\n` +
            `이전 난이도를 먼저 완주해주세요!`
        );
        return;
      }
    }

    // 난이도 선택 및 통계 로그
    const difficultyStats = ProgressManager.getSubjectDifficultyStats(
      subject || ""
    );
    const stats = difficultyStats[difficulty] || {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
    };

    console.log("🎮 난이도 선택:", difficulty);
    console.log("📊 현재 통계:", {
      풀이횟수: stats.attempts,
      평균점수: stats.averageScore,
    });

    // 문제풀이 페이지로 이동
    navigate(`/quiz/${subjectType}/${subject}/${difficulty}`);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 메인으로 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {subjectName} 난이도 선택
          </h1>
          <p className="text-gray-600">
            원하는 난이도를 선택하여 문제를 풀어보세요
          </p>
        </div>

        {/* 난이도 선택 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {difficulties.map((difficulty, index) => {
            const isUnlocked = isDifficultyUnlocked(difficulty.name);
            // ProgressManager에서 해당 과목의 난이도 통계 가져오기
            const difficultyStats = ProgressManager.getSubjectDifficultyStats(
              subject || ""
            );
            const stats = difficultyStats[difficulty.name] || {
              attempts: 0,
              totalScore: 0,
              averageScore: 0,
            };
            const condition = checkUnlockCondition(difficulty.name);

            return (
              <div
                key={difficulty.name}
                className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-200 ${
                  isUnlocked
                    ? "hover:shadow-xl cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => handleDifficultySelect(difficulty.name)}
              >
                {/* 난이도 순서 */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-400">
                    {index + 1}
                  </span>
                  <div
                    className={`w-12 h-12 ${difficulty.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}
                  >
                    {isUnlocked ? "✓" : "🔒"}
                  </div>
                </div>

                {/* 난이도 이름 */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {difficulty.name}
                  {!isUnlocked && (
                    <span className="text-sm text-red-500 ml-2">(잠김)</span>
                  )}
                </h3>

                {/* 설명 */}
                <p className="text-gray-600 mb-4">{difficulty.description}</p>

                {/* 통계 표시 - 모든 난이도에 대해 표시 */}
                <div
                  className={`rounded-lg p-3 mb-4 ${
                    isUnlocked ? "bg-gray-50" : "bg-gray-100"
                  }`}
                >
                  <div className="text-sm text-gray-600">
                    <div>풀이 횟수: {stats.attempts}번</div>
                    <div>
                      평균 점수: {Number(stats.averageScore || 0).toFixed(2)}점
                    </div>
                  </div>
                </div>

                {/* 해금 조건 표시 - 해금되지 않은 경우에만 */}
                {!isUnlocked && condition && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-red-600">
                      <div>해금 조건:</div>
                      <div>
                        • {condition.previousDifficulty} {condition.minAttempts}
                        번 이상 풀이
                      </div>
                      <div>
                        • {condition.previousDifficulty} 평균{" "}
                        {condition.minAverage}점 이상
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        현재 {condition.previousDifficulty}:{" "}
                        {condition.currentAttempts}번, 평균{" "}
                        {condition.currentAverage}점
                      </div>
                    </div>
                  </div>
                )}

                {/* 시작 버튼 */}
                <button
                  className={`w-full py-3 px-4 ${difficulty.color} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                >
                  시작하기 →
                </button>
              </div>
            );
          })}
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            각 난이도별로 {QUIZ_QUESTIONS_COUNT}문제씩 출제됩니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelectionPage;
